import mongoose from 'mongoose';
import Faculty from '../models/Faculty.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const checkFacultyLogin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aptitude-test');
        console.log('Connected to MongoDB');

        // Test email from the logs
        const testEmail = 'imranali123@gmail.com';
        const testPassword = 'asdfghjkl@123';

        console.log('\n=== FACULTY LOGIN DIAGNOSTICS ===');
        console.log('Testing email:', testEmail);
        console.log('Testing password:', testPassword);

        // Find faculty
        const faculty = await Faculty.findOne({ email: testEmail.toLowerCase().trim() });
        
        if (!faculty) {
            console.log('❌ No faculty found with email:', testEmail);
            return;
        }

        console.log('\n=== FACULTY DATA FOUND ===');
        console.log('ID:', faculty._id);
        console.log('Name:', faculty.name);
        console.log('Email:', faculty.email);
        console.log('Department:', faculty.department);
        console.log('Phone:', faculty.phone);
        console.log('Is Active:', faculty.isActive);
        console.log('Is Verified:', faculty.isVerified);
        console.log('Password Hash Length:', faculty.password.length);
        console.log('Password Hash Preview:', faculty.password.substring(0, 20) + '...');

        // Test password comparison
        console.log('\n=== PASSWORD VERIFICATION TEST ===');
        const isMatch = await faculty.comparePassword(testPassword);
        console.log('Password matches:', isMatch);

        // Test with bcrypt directly
        console.log('\n=== MANUAL BCRYPT TEST ===');
        const manualMatch = await bcryptjs.compare(testPassword, faculty.password);
        console.log('Manual bcrypt comparison:', manualMatch);

        // Check if password was hashed with correct salt rounds
        console.log('\n=== PASSWORD HASH ANALYSIS ===');
        console.log('Hash starts with $2:', faculty.password.startsWith('$2'));
        console.log('Hash parts:', faculty.password.split('$').length);

        // If password doesn't match, let's test some common issues
        if (!isMatch) {
            console.log('\n=== TROUBLESHOOTING ===');
            
            // Test with trimmed password
            const trimmedMatch = await faculty.comparePassword(testPassword.trim());
            console.log('Password matches (trimmed):', trimmedMatch);

            // Test with different case
            const lowerMatch = await faculty.comparePassword(testPassword.toLowerCase());
            console.log('Password matches (lowercase):', lowerMatch);

            // Test if password might be stored in plain text (security issue)
            if (faculty.password === testPassword) {
                console.log('⚠️  CRITICAL: Password appears to be stored in plain text!');
            }

            // Test common password variations
            const variations = [
                testPassword,
                testPassword.trim(),
                testPassword.toLowerCase(),
                testPassword.toUpperCase(),
                'password123',
                'Password123',
                'admin123'
            ];

            console.log('\n=== TESTING PASSWORD VARIATIONS ===');
            for (const variation of variations) {
                const match = await faculty.comparePassword(variation);
                if (match) {
                    console.log(`✅ Found matching variation: "${variation}"`);
                    break;
                }
            }
        }

    } catch (error) {
        console.error('Error during diagnostics:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the diagnostics
checkFacultyLogin();