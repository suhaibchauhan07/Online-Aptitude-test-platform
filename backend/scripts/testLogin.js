import mongoose from 'mongoose';
import Faculty from '../models/Faculty.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const testFacultyLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aptitude-test');
        console.log('Connected to MongoDB');

        const testEmail = 'imranali123@gmail.com';
        const testPassword = 'faculty123';

        console.log('\n=== TESTING FACULTY LOGIN ===');
        console.log('Email:', testEmail);
        console.log('Password:', testPassword);

        // Find faculty
        const faculty = await Faculty.findOne({
            email: testEmail.toLowerCase().trim()
        });
        
        if (!faculty) {
            console.log('❌ No faculty found with email:', testEmail);
            return;
        }

        console.log('✅ Faculty found:', faculty.name);

        // Compare passwords
        const isMatch = await faculty.comparePassword(testPassword);
        console.log('Password verification result:', isMatch);

        if (isMatch) {
            console.log('🎉 LOGIN SUCCESSFUL!');
            console.log('Faculty Name:', faculty.name);
            console.log('Faculty Email:', faculty.email);
            console.log('Department:', faculty.department);
            console.log('You can now login to the application with these credentials.');
        } else {
            console.log('❌ Login failed - password does not match');
        }

    } catch (error) {
        console.error('Error during login test:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the test
testFacultyLogin();