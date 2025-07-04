import Faculty from '../models/Faculty.js';
import Test from '../models/Test.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import xlsx from 'xlsx';
import TestQuestions from '../models/testQuestions.js';

export const registerFaculty = async (req, res) => {
    try {
        const { name, email, password, department, phone } = req.body;

        // Convert department to uppercase to match enum values
        const normalizedDepartment = department.toUpperCase();
        
        // Convert email to lowercase
        const normalizedEmail = email.toLowerCase();

        // Hash password directly here instead of relying on middleware
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        // Create and save faculty with hashed password
        const faculty = await Faculty.create({
            name,
            email: normalizedEmail,
            password: hashedPassword,
            department: normalizedDepartment,
            phone,
            isActive: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: faculty._id, role: 'faculty' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Faculty registered successfully!",
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        
        // Handle specific validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: "Registration failed", 
                errors: messages 
            });
        }
        
        // Handle duplicate key errors (email or phone)
        if (error.code === 11000) {
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `This ${field} is already registered` 
            });
        }

        res.status(500).json({ message: "Registration failed" });
    }
};

export const loginFaculty = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Add request logging
        console.log('Login attempt details:', {
            attemptedEmail: email,
            normalizedEmail: email.toLowerCase().trim()
        });

        // Find faculty without select('+password') since we removed select: false
        const faculty = await Faculty.findOne({
            email: email.toLowerCase().trim()
        });
        
        // Log the query result (without sensitive data)
        console.log('Faculty search result:', {
            found: faculty ? 'Yes' : 'No',
            email: email.toLowerCase().trim()
        });
        
        if (!faculty) {
            console.log('No faculty found with email:', email.toLowerCase().trim());
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Compare passwords using the schema method
        const isMatch = await faculty.comparePassword(password);
        console.log('Password verification:', isMatch ? 'Success' : 'Failed');

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Update last login time
        faculty.lastLogin = new Date();
        await faculty.save();

        // Generate token
        const token = jwt.sign(
            { 
                id: faculty._id, 
                role: 'faculty',
                email: faculty.email 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            faculty: {
                id: faculty._id,
                name: faculty.name,
                email: faculty.email,
                department: faculty.department,
                phone: faculty.phone
            }
        });
    } catch (error) {
        console.error('Login error details:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            success: false,
            message: "Server error during login" 
        });
    }
};

export const getFacultyProfile = async (req, res) => {
    try {
        console.log('Attempting to fetch faculty profile for user ID:', req.user.id);
        const faculty = await Faculty.findById(req.user.id)
            .select('-password')
            .populate('createdTests', 'title className section timeLimit');
        
        if (!faculty) {
            console.log('Faculty not found for ID:', req.user.id);
            return res.status(404).json({ message: "Faculty not found" });
        }
        
        console.log('Faculty profile found, sending response.');
        res.status(200).json(faculty);
    } catch (error) {
        console.error('Error fetching faculty profile:', error);
        res.status(500).json({ message: error.message });
    }
};
 
export const updateFacultyProfile = async (req, res) => {
    try {
        const {
            name,
            username,
            email,
            phone,
            department,
            country,
            city,
            pinCode,
            profilePicture
        } = req.body;

        const faculty = await Faculty.findById(req.user.id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        // Update all fields if provided
        if (name) faculty.name = name;
        if (username) faculty.username = username;
        if (email) faculty.email = email;
        if (phone) faculty.phone = phone;
        if (department) faculty.department = department;
        if (country) faculty.country = country;
        if (city) faculty.city = city;
        if (pinCode) faculty.pinCode = pinCode;
        if (profilePicture) faculty.profilePicture = profilePicture;

        await faculty.save();

        res.status(200).json({
            message: "Profile updated successfully",
            faculty
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

export const createClass = async (req, res) => {
    try {
        const { className, section } = req.body;
        // Implementation for creating class
        res.status(201).json({ message: "Class created successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createTest = async (req, res) => {
    try {
        const { title, className, section, timeLimit } = req.body;
        const test = new Test({
            title,
            className,
            section,
            timeLimit,
            createdBy: req.user.id
        });
        await test.save();
        res.status(201).json({ message: "Test created successfully", test });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadQuestions = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const { testId } = req.body;
        if (!testId) {
            return res.status(400).json({ message: "testId is required" });
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(worksheet);

        // Map and add testId to each question, and map options to array
        const questionsWithTestId = data.map(q => ({
            question: q.question,
            options: [q.optionA, q.optionB, q.optionC, q.optionD],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            testId
        }));

        // Save questions to database (assuming TestQuestions is imported)
        await TestQuestions.insertMany(questionsWithTestId);

        res.status(200).json({ message: "Questions uploaded successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const changeFacultyPassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: "Both old and new passwords are required" });
    }

    const faculty = await Faculty.findById(req.user.id);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    const isMatch = await faculty.comparePassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ message: "Old password is incorrect" });
    }

    // Hash and set new password
    const salt = await bcryptjs.genSalt(10);
    faculty.password = await bcryptjs.hash(newPassword, salt);
    await faculty.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
