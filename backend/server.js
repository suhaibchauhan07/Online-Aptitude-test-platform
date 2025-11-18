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
import uploadRoutes from './routes/uploadRoutes.js';

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

// Middleware
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://online-aptitude-test-platform.vercel.app',
    'https://online-aptitude-test-platform-git-main-<team>.vercel.app',

    process.env.FRONTEND_ORIGIN
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Increase payload size limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Add authentication check middleware
app.use((req, res, next) => {
    console.log('Request headers:', req.headers);
    console.log('Request method:', req.method);
    console.log('Request origin:', req.get('origin'));
    next();
});

// MongoDB Connection with proper error handling
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            family: 4
        });
        console.log(`Connected to MongoDB: ${conn.connection.host}`);
        
        // Verify connection and log available collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Available collections:', collections.map(c => c.name));
    } catch (error) {
        console.error('MongoDB connection error:', error);
        // Retry connection after 5 seconds
        setTimeout(connectDB, 5000);
    }
};

// Connect to MongoDB
connectDB();

// Enhanced request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    if (req.method === 'POST') {
        console.log('Request body:', req.body);
    }
    next();
});

// Routes with proper error handling
app.use('/api/student', studentTestRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/upload', uploadRoutes);

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
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`CORS enabled for: ${allowedOrigins.join(', ')}`);
});
