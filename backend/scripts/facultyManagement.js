import mongoose from 'mongoose';
import Faculty from '../models/Faculty.js';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const facultyManagement = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aptitude-test');
        console.log('Connected to MongoDB');

        console.log('\n=== ALL FACULTY ACCOUNTS ===');
        const allFaculty = await Faculty.find({}).select('name email department phone isActive isVerified createdAt');
        
        if (allFaculty.length === 0) {
            console.log('No faculty accounts found in database');
        } else {
            allFaculty.forEach((faculty, index) => {
                console.log(`\n${index + 1}. Name: ${faculty.name}`);
                console.log(`   Email: ${faculty.email}`);
                console.log(`   Department: ${faculty.department}`);
                console.log(`   Phone: ${faculty.phone}`);
                console.log(`   Active: ${faculty.isActive}`);
                console.log(`   Verified: ${faculty.isVerified}`);
                console.log(`   Created: ${faculty.createdAt}`);
            });
        }

        // Check specific faculty account
        const targetEmail = 'imranali123@gmail.com';
        console.log(`\n=== DETAILED CHECK FOR: ${targetEmail} ===`);
        const faculty = await Faculty.findOne({ email: targetEmail });
        
        if (faculty) {
            console.log('Account found:');
            console.log('Name:', faculty.name);
            console.log('Email:', faculty.email);
            console.log('Department:', faculty.department);
            console.log('Phone:', faculty.phone);
            console.log('Is Active:', faculty.isActive);
            console.log('Is Verified:', faculty.isVerified);
            console.log('Last Login:', faculty.lastLogin);
            console.log('Created At:', faculty.createdAt);
            console.log('Updated At:', faculty.updatedAt);
            
            // Test some common default passwords
            console.log('\n=== TESTING COMMON DEFAULT PASSWORDS ===');
            const commonPasswords = [
                'password123',
                'Password123',
                'admin123',
                'faculty123',
                '123456',
                'password',
                'test123',
                'welcome123',
                'imran123',
                'suhaib123',
                'chauhan123'
            ];

            let foundPassword = null;
            for (const password of commonPasswords) {
                const isMatch = await faculty.comparePassword(password);
                if (isMatch) {
                    foundPassword = password;
                    console.log(`✅ Found working password: "${password}"`);
                    break;
                }
            }

            if (!foundPassword) {
                console.log('❌ None of the common passwords worked');
                
                // Option to reset password
                console.log('\n=== PASSWORD RESET OPTION ===');
                const newPassword = 'faculty123'; // You can change this
                console.log(`Resetting password to: "${newPassword}"`);
                
                const salt = await bcryptjs.genSalt(10);
                const hashedPassword = await bcryptjs.hash(newPassword, salt);
                
                faculty.password = hashedPassword;
                await faculty.save();
                
                console.log('✅ Password reset successfully!');
                console.log(`New password is: "${newPassword}"`);
                console.log('You can now login with this password.');
            }
        } else {
            console.log('❌ Faculty account not found');
            
            // Option to create a new faculty account
            console.log('\n=== CREATING NEW FACULTY ACCOUNT ===');
            const newFacultyData = {
                name: 'Suhaib Chauhan',
                email: targetEmail,
                password: 'faculty123',
                department: 'CSE',
                phone: '9012434557'
            };
            
            console.log('Creating faculty account with data:');
            console.log('Name:', newFacultyData.name);
            console.log('Email:', newFacultyData.email);
            console.log('Department:', newFacultyData.department);
            console.log('Phone:', newFacultyData.phone);
            console.log('Password:', newFacultyData.password);
            
            const salt = await bcryptjs.genSalt(10);
            const hashedPassword = await bcryptjs.hash(newFacultyData.password, salt);
            
            const newFaculty = await Faculty.create({
                name: newFacultyData.name,
                email: newFacultyData.email.toLowerCase().trim(),
                password: hashedPassword,
                department: newFacultyData.department.toUpperCase(),
                phone: newFacultyData.phone,
                isActive: true,
                isVerified: true
            });
            
            console.log('✅ New faculty account created successfully!');
            console.log('You can now login with:');
            console.log('Email:', newFacultyData.email);
            console.log('Password:', newFacultyData.password);
        }

    } catch (error) {
        console.error('Error during faculty management:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
};

// Run the faculty management
facultyManagement();