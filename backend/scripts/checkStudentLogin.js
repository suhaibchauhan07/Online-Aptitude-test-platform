import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';

dotenv.config();

const testStudentLogin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Test with specific student email and password
    const testEmail = 'student@example.com'; // Change this to your email
    const testPassword = 'student123'; // Change this to your password

    console.log('=== TESTING STUDENT LOGIN ===');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);

    const student = await Student.findOne({ email: testEmail });
    
    if (!student) {
      console.log('❌ Student not found');
      console.log('\n=== All Students ===');
      const allStudents = await Student.find({}, 'name email rollNo className');
      allStudents.forEach(s => {
        console.log(`- ${s.name} (${s.rollNo}) - ${s.email} - Class: ${s.className}`);
      });
    } else {
      console.log('✅ Student found:', student.name);
      console.log('Roll No:', student.rollNo);
      console.log('Class:', student.className);
      
      const isMatch = await student.comparePassword(testPassword);
      console.log('Password verification result:', isMatch);
      
      if (isMatch) {
        console.log('🎉 LOGIN SUCCESSFUL!');
        console.log('Student Name:', student.name);
        console.log('Student Email:', student.email);
        console.log('Roll No:', student.rollNo);
      } else {
        console.log('❌ Wrong password');
        
        // Test common default passwords
        console.log('\n=== Testing Common Passwords ===');
        const commonPasswords = ['123456', 'password123', 'student123', 'student@123', '12345678'];
        
        for (const password of commonPasswords) {
          const match = await student.comparePassword(password);
          if (match) {
            console.log(`✅ Password found: ${password}`);
            break;
          }
        }
      }
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

testStudentLogin();