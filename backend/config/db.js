import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
	try {
		const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/siya_project';
		const conn = await mongoose.connect(mongoUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);
	} catch (error) {
		console.error(`Error: ${error.message}`);
		process.exit(1);
	}
};

export default connectDB; 