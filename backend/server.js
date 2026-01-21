import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import studentTestRoutes from './routes/studentTestRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import testRoutes from './routes/testRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import {
    globalRateLimiter,
    globalSpeedLimiter
} from './middleware/rateLimitMiddleware.js';

mongoose.set('bufferCommands', false);
mongoose.set('strictQuery', true);

// Suppress deprecation warnings
process.removeAllListeners('warning');

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '.env') });

// Hardcode MongoDB URI if not found in .env
if (!process.env.MONGODB_URI) {
    process.env.MONGODB_URI = 'mongodb+srv://suhaib07:suhaibmongoatlas123@cluster0.iqxtsqv.mongodb.net/aptitude_test?retryWrites=true&w=majority';
}

// Verify MongoDB URI is loaded
console.log('MongoDB URI loaded:', process.env.MONGODB_URI ? 'Yes' : 'No');

const app = express();
app.set('trust proxy', 1);

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://online-aptitude-test-platform.vercel.app',
    process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        // Check if origin is in allowedOrigins
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        // Allow any Vercel deployment subdomain
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(globalSpeedLimiter);
app.use(globalRateLimiter);

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add authentication check middleware
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log('Request headers:', req.headers);
        console.log('Request method:', req.method);
        console.log('Request origin:', req.get('origin'));
        next();
    });
}

// MongoDB Connection with proper error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
            socketTimeoutMS: 30000,
            family: 4,
            maxPoolSize: 10
        });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        try {
            const collections = await mongoose.connection.db.listCollections().toArray();
            console.log('Available collections:', collections.map(c => c.name));
        } catch (err) {
            console.log('Could not list collections (this is expected if DB is empty or permissions are limited)');
        }
        return true;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

// Connect to MongoDB
// connectDB();

// Enhanced request logging middleware
if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
        console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
        if (req.method === 'POST') {
            console.log('Request body:', req.body);
        }
        next();
    });
}

app.get('/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const state = states[mongoose.connection.readyState] || 'unknown';
    res.status(200).json({ status: 'ok', db: state });
});

app.get('/api/health', (req, res) => {
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    const state = states[mongoose.connection.readyState] || 'unknown';
    res.status(200).json({ status: 'ok', db: state, timestamp: new Date().toISOString() });
});

app.use((req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Service unavailable: database not connected' });
    }
    next();
});

// Routes with proper error handling
app.use('/api/student', studentTestRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/images', imageRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    console.error('Stack:', err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 5000;
const start = async () => {
    console.log('Starting Server... (Deployment Check: v2 - Health Route Added)');
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);

            // Self-ping to keep Render awake (every 14 minutes)
            if (process.env.NODE_ENV === 'production') {
                const interval = 14 * 60 * 1000; // 14 minutes
                const url = `https://online-aptitude-test-platform-1.onrender.com/health`;
                console.log(`Setting up self-ping to ${url} every ${interval}ms`);
                setInterval(async () => {
                    try {
                        const response = await fetch(url);
                        console.log(`Self-ping status: ${response.status}`);
                    } catch (err) {
                        console.error('Self-ping failed:', err.message);
                    }
                }, interval);
            }
        });
    } catch (err) {
        console.error('Initial DB connection failed. Retrying in 5s...');
        setTimeout(start, 5000);
    }
};
start();
