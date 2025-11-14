import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import bcryptjs from 'bcryptjs';

dotenv.config();

const studentManagement = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // List all students
    console.log('=== ALL STUDENTS ===');
    const allStudents = await Student.find({}, 'name email rollNo className isActive');
    if (allStudents.length === 0) {
      console.log('No students found in database');
    } else {
      allStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.name} (${student.rollNo}) - ${student.email} - Class: ${student.className} - Status: ${student.isActive ? 'Active' : 'Inactive'}`);
      });
    }

    // Check specific student
    console.log('\n=== CHECK SPECIFIC STUDENT ===');
    const targetEmail = 'student@example.com'; // Change this to the email you want to check
    
    const student = await Student.findOne({ email: targetEmail });
    if (student) {
      console.log(`Found student: ${student.name}`);
      console.log(`Roll No: ${student.rollNo}`);
      console.log(`Class: ${student.className}`);
      console.log(`Phone: ${student.phone}`);
      console.log(`Department: ${student.department || 'N/A'}`);
      console.log(`Year: ${student.year || 'N/A'}`);
      console.log(`Active: ${student.isActive}`);
      console.log(`Illegal Attempts: ${student.illegalAttempts}`);
      
      // Test common passwords
      console.log('\n=== Testing Common Passwords ===');
      const commonPasswords = ['123456', 'password123', 'student123', 'student@123', '12345678', 'password'];
      let foundPassword = null;
      
      for (const password of commonPasswords) {
        const match = await student.comparePassword(password);
        if (match) {
          console.log(`✅ Working password found: ${password}`);
          foundPassword = password;
          break;
        }
      }
      
      if (!foundPassword) {
        console.log('❌ None of the common passwords work');
        
        // Reset password option
        console.log('\n=== RESET PASSWORD ===');
        const newPassword = 'student123'; // Default password
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(newPassword, salt);
        
        student.password = hashedPassword;
        student.illegalAttempts = 0; // Reset failed attempts
        await student.save();
        
        console.log(`✅ Password reset successful!`);
        console.log(`New password: ${newPassword}`);
        console.log(`Student can now login with email: ${targetEmail} and password: ${newPassword}`);
      }
    } else {
      console.log(`Student with email ${targetEmail} not found`);
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

studentManagement();