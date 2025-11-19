import Student from '../models/Student.js';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Test from '../models/Test.js';
import StudentTest from '../models/studentTestModel.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import TestQuestions from '../models/testQuestions.js';

// Register a new student
export const registerStudent = async (req, res) => {
    try {
        console.log('Registration request received:', req.body);
        const { rollNo, name, email, password, className, department, year, phone } = req.body;

        // Validate required fields
        if (!rollNo || !name || !email || !password || !className || !department || !year || !phone) {
            console.log('Missing fields:', { rollNo, name, email, password: '***', className, department, year, phone });
            return res.status(400).json({ 
                message: 'All fields are required',
                missingFields: Object.entries({ rollNo, name, email, password, className, department, year, phone })
                    .filter(([_, value]) => !value)
                    .map(([key]) => key)
            });
        }

        // Validate phone number
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ message: 'Please enter a valid 10-digit phone number' });
        }

        // Validate email
        if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Check if student already exists
        const existingStudent = await Student.findOne({ 
            $or: [{ rollNo: rollNo.toUpperCase() }, { email: email.toLowerCase() }, { phone }]
        });

        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists with this roll number, email, or phone' });
        }

        // Create new student with password hashing handled by the model's pre-save hook
        const student = await Student.create({
            rollNo: rollNo.toUpperCase(),
            name,
            email: email.toLowerCase(),
            password,  // Will be hashed by the pre-save hook
            className,
            department,
            year: parseInt(year),
            phone,
            isActive: true
        });

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: "Student registered successfully!",
            token,
            student: {
                id: student._id,
                rollNo: student.rollNo,
                name: student.name,
                email: student.email,
                className: student.className,
                department: student.department,
                year: student.year,
                phone: student.phone
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(err => err.message)
            });
        }
        res.status(500).json({ 
            message: 'Error registering student', 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// Login student
export const loginStudent = async (req, res) => {
    try {
        const { rollNo, password } = req.body;

        if (!rollNo || !password) {
            return res.status(400).json({ message: "Roll number and password are required" });
        }

        // Normalize roll number
        const normalizedRollNo = rollNo.toUpperCase().trim();

        // Add request logging
        console.log('Login attempt details:', {
            attemptedRollNo: rollNo,
            normalizedRollNo: normalizedRollNo
        });

        // Find student by rollNo
        const student = await Student.findOne({ 
            rollNo: normalizedRollNo 
        });

        // Log the query result (without sensitive data)
        console.log('Student search result:', {
            found: student ? 'Yes' : 'No',
            rollNo: normalizedRollNo
        });
        
        if (!student) {
            // Try to find similar roll numbers to help user
            const similarStudents = await Student.find({
                rollNo: { $regex: rollNo.replace(/\D/g, ''), $options: 'i' }
            }).select('rollNo').limit(3);

            console.log('No student found with roll number:', normalizedRollNo);
            return res.status(401).json({ 
                message: "Invalid credentials",
                suggestion: "Please check your roll number and try again",
                similarRollNumbers: similarStudents.length > 0 ? 
                    similarStudents.map(s => s.rollNo) : undefined
            });
        }

        // Check if account is active
        if (!student.isActive) {
            return res.status(403).json({ message: "Account is deactivated. Please contact support." });
        }

        // Verify password using bcryptjs
        const isPasswordValid = await bcryptjs.compare(password, student.password);
        console.log('Password verification:', isPasswordValid ? 'Success' : 'Failed');

        if (!isPasswordValid) {
            // Increment illegal attempts
            student.illegalAttempts = (student.illegalAttempts || 0) + 1;
            await student.save();

            // If too many failed attempts, deactivate account
            if (student.illegalAttempts >= 5) {
                student.isActive = false;
                await student.save();
                return res.status(403).json({ 
                    message: "Too many failed attempts. Account has been deactivated. Please contact support."
                });
            }

            return res.status(401).json({ 
                message: "Invalid credentials",
                attemptsRemaining: 5 - student.illegalAttempts
            });
        }

        // Reset illegal attempts on successful login
        student.illegalAttempts = 0;
        student.lastLogin = new Date();
        await student.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: student._id, role: 'student' },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1d' }
        );

        // Return student data without sensitive fields
        const studentData = {
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            className: student.className,
            department: student.department,
            year: student.year
        };

        res.status(200).json({
            message: "Login successful",
            token,
            student: studentData
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Server error during login" });
    }
};

// Get student profile
export const getStudentProfile = async (req, res) => {
    try {
        const student = await Student.findById(req.user.id).select('-password');
        res.json(student);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};

// Update student profile
export const updateStudentProfile = async (req, res) => {
    try {
        const { name, email, className, department, year } = req.body;
        
        const student = await Student.findById(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        student.name = name || student.name;
        student.email = email || student.email;
        student.className = className || student.className;
        student.department = department || student.department;
        student.year = year || student.year;

        await student.save();

        res.json({
            id: student._id,
            rollNo: student.rollNo,
            name: student.name,
            email: student.email,
            className: student.className,
            department: student.department,
            year: student.year
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

export const getInstructions = async (req, res) => {
    try {
        const { testId } = req.params;
        // Implementation for getting test instructions
        res.status(200).json({ message: "Test instructions" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getAvailableTests = async (req, res) => {
    try {
        const tests = await Test.find();
        res.json(tests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching available tests', error: error.message });
    }
};
export const getTestDetails = async (req, res) => {
    try {
        const test = await Test.findById(req.params.testId)
            .select('testName questions duration startTime totalMarks');

        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Check if test is available
        const now = new Date();
        const endTime = new Date(test.startTime.getTime() + test.duration * 60000);
        // Debug log for time comparison
        console.log('[Test Availability Debug]', {
          now: now,
          nowISO: now.toISOString(),
          startTime: test.startTime,
          startTimeISO: test.startTime.toISOString(),
          endTime: endTime,
          endTimeISO: endTime.toISOString(),
        });
        if (now < test.startTime || now > endTime) {
            return res.status(400).json({ message: 'Test is not currently available' });
        }

        // Check if student has already taken the test (limit to 15 attempts)
        const attemptCount = await StudentTest.countDocuments({
            testId: test._id,
            studentId: req.user._id
        });
        if (attemptCount >= 15) {
            return res.status(400).json({ message: 'Maximum attempts (15) reached for this test' });
        }

        res.json({
            ...test.toObject(),
            attemptCount,
            maxAttempts: 15
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching test details', error: error.message });
    }
};

export const startTest = async (req, res) => {
    try {
        // Check if questions exist
        const questions = await TestQuestions.find();
        if (!questions || questions.length === 0) {
            return res.status(404).json({ message: 'No test questions available' });
        }

        // Count previous attempts for this test and student
        const attemptCount = await StudentTest.countDocuments({
            testId: req.params.testId,
            studentId: req.user._id
        });
        if (attemptCount >= 15) {
            return res.status(400).json({ message: 'Maximum attempts (15) reached for this test' });
        }

        // Only allow one in-progress attempt at a time
        const existingTest = await StudentTest.findOne({
            studentId: req.user._id,
            testId: req.params.testId,
            status: 'in_progress'
        });

        if (existingTest) {
            const timeElapsed = Math.floor((Date.now() - existingTest.startedAt) / 60000);
            const timeRemaining = Math.max(0, 60 - timeElapsed); // 60 minutes default

            if (timeRemaining <= 0) {
                // If time is up, mark test as completed
                existingTest.status = 'completed';
                existingTest.completedAt = Date.now();
                await existingTest.save();
                return res.status(400).json({ message: 'Test time has expired' });
            }

            return res.status(200).json({
                attemptId: existingTest._id,
                timeRemaining
            });
        }

        // Create new test attempt (with attemptNumber)
        const newTest = await StudentTest.create({
            studentId: req.user._id,
            totalMarks: questions.length, // Each question worth 1 mark
            marksObtained: 0,
            percentage: 0,
            status: 'in_progress',
            startedAt: Date.now(),
            questions: questions.map(q => ({
                questionId: q._id,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer
            })),
            testId: req.params.testId, // Add testId to the attempt
            attemptNumber: attemptCount + 1
        });

        res.status(200).json({
            attemptId: newTest._id,
            testId: req.params.testId,
            timeRemaining: 60,
            questions: questions.map(q => ({
                questionId: q._id,
                question: q.question,
                options: q.options
            }))
        });
    } catch (error) {
        console.error('Error starting test:', error);
        res.status(500).json({ message: 'Error starting test', error: error.message });
    }
};

export const submitTest = async (req, res) => {
    try {
        const { answers } = req.body;
        console.log('Submit test request:', { testId: req.params.testId, studentId: req.user._id, answersCount: answers?.length });
        
        // Populate questions virtual with correct model name
        const test = await Test.findById(req.params.testId).populate({ path: 'questions', model: 'TestQuestions' });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }
        if (!Array.isArray(test.questions) || test.questions.length === 0) {
            return res.status(400).json({ message: 'No questions found for this test' });
        }

        // Get student's test attempt with retry logic for version conflicts
        let studentTest;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                studentTest = await StudentTest.findOne({
                    testId: test._id,
                    studentId: req.user._id,
                    status: 'in_progress'
                });

                // If no in-progress attempt exists, create one on the fly (robustness)
                if (!studentTest) {
                    // Guard against rapid duplicate submissions: reuse most recent completed attempt in last 5 seconds
                    const recentCompleted = await StudentTest.findOne({
                        testId: test._id,
                        studentId: req.user._id,
                        status: 'completed'
                    }).sort({ completedAt: -1 });
                    if (recentCompleted && (Date.now() - new Date(recentCompleted.completedAt).getTime()) < 5000) {
                        return res.status(200).json({
                            totalMarks: recentCompleted.totalMarks,
                            marksObtained: recentCompleted.marksObtained,
                            percentage: recentCompleted.percentage,
                            timeTaken: recentCompleted.timeTaken
                        });
                    }
                }

                if (!studentTest) {
                    studentTest = await StudentTest.create({
                        studentId: req.user._id,
                        testId: test._id,
                        totalMarks: Number(test.totalMarks ?? test.questions.length) || 0,
                        marksObtained: 0,
                        percentage: 0,
                        status: 'in_progress',
                        startedAt: Date.now()
                    });
                }

                // Map answers to expected format for calculateScore
                const mappedAnswers = (answers || []).map(ans => ({
                    questionId: ans.questionId,
                    selectedAnswer: ans.selectedAnswer || ans.answer
                }));

                // Calculate score
                const score = await calculateScore(test, mappedAnswers);

                // Update attempt (ensure required numeric fields)
                studentTest.answers = score.answers;
                studentTest.totalMarks = Number(score.totalMarks) || (test.totalMarks ?? test.questions.length);
                studentTest.marksObtained = Number(score.marksObtained) || 0;
                studentTest.percentage = Number(score.percentage) || 0;
                studentTest.status = 'completed';
                studentTest.completedAt = Date.now();
                studentTest.timeTaken = Math.floor((studentTest.completedAt - studentTest.startedAt) / 60000);

                await studentTest.save();
                break; // Success, exit retry loop
                
            } catch (saveError) {
                if (saveError.name === 'VersionError' && retryCount < maxRetries - 1) {
                    console.log(`Version conflict, retrying... (attempt ${retryCount + 1})`);
                    retryCount++;
                    await new Promise(resolve => setTimeout(resolve, 100 * retryCount)); // Exponential backoff
                    continue;
                } else {
                    throw saveError;
                }
            }
        }

        if (retryCount >= maxRetries) {
            return res.status(500).json({ message: 'Failed to save test after multiple attempts' });
        }

        res.status(200).json({
            totalMarks: studentTest.totalMarks,
            marksObtained: studentTest.marksObtained,
            percentage: studentTest.percentage,
            timeTaken: studentTest.timeTaken
        });
    } catch (error) {
        console.error('Submit test error:', error);
        res.status(500).json({ message: 'Error submitting test', error: error.message });
    }
};

export const getTestResult = async (req, res) => {
    try {
        console.log(`Fetching test result for testId: ${req.params.testId}, studentId: ${req.user._id}`);
        
        // First try to find a completed test
        let result = await StudentTest.findOne({
            testId: req.params.testId,
            studentId: req.user._id,
            status: 'completed'
        }).populate('testId', 'title duration totalMarks startTime');

        // If no completed test found, check for in_progress test
        if (!result) {
            console.log('No completed test found, checking for in_progress test');
            result = await StudentTest.findOne({
                testId: req.params.testId,
                studentId: req.user._id,
                status: 'in_progress'
            }).populate('testId', 'title duration totalMarks startTime');
            
            // If we found an in_progress test, let's complete it with the answers so far
            if (result) {
                console.log('Found in_progress test, completing it with current answers');
                result.status = 'completed';
                result.completedAt = new Date();
                result.timeTaken = Math.floor((result.completedAt - result.startedAt) / 60000);
                
                // Calculate score based on existing answers
                const answers = result.answers || [];
                const correctCount = answers.filter(ans => ans.isCorrect).length;
                result.marksObtained = correctCount;
                result.percentage = result.totalMarks > 0 ? (correctCount / result.totalMarks) * 100 : 0;
                
                await result.save();
                console.log('Test marked as completed');
            }
        }

        // If no result found, return a 404 error
        if (!result) {
            console.log('No test attempt found for this test');
            return res.status(404).json({ 
                message: 'No test attempt found. Please attempt the test first.' 
            });
        }
        
        // Make sure we're using the actual test data
        const test = await Test.findById(req.params.testId).populate({ path: 'questions', model: 'TestQuestions' });
        if (!test) {
            return res.status(404).json({ message: 'Test not found' });
        }

        // Ensure answers include correctness; recompute if missing
        let answers = result.answers || [];
        const needsRecalc = answers.some(a => typeof a.isCorrect === 'undefined');
        if (needsRecalc) {
            const test = await Test.findById(req.params.testId).populate({ path: 'questions', model: 'TestQuestions' });
            const mapped = answers.map(a => ({ questionId: a.questionId?.toString?.() || String(a.questionId), selectedAnswer: a.selectedAnswer }));
            const score = await calculateScore(test, mapped);
            result.answers = score.answers;
            result.totalMarks = Number(score.totalMarks) || result.totalMarks;
            result.marksObtained = Number(score.marksObtained);
            result.percentage = Number(score.percentage);
            await result.save();
            answers = result.answers;
        }

        const correctCount = answers.filter(ans => ans.isCorrect).length;
        const incorrectCount = answers.length - correctCount;
        const accuracyRate = answers.length > 0 ? (correctCount / answers.length) * 100 : 0;

        // Ensure we're using actual data, not sample data
        const formattedResult = {
            _id: result._id,
            testId: result.testId,
            studentId: result.studentId,
            answers: result.answers,
            totalMarks: result.totalMarks || test.totalMarks,
            marksObtained: result.marksObtained,
            percentage: result.percentage,
            status: result.status,
            startedAt: result.startedAt,
            completedAt: result.completedAt,
            timeTaken: result.timeTaken,
            // Analytics
            correctCount,
            incorrectCount,
            accuracyRate,
            totalQuestions: answers.length,
            // Test details
            testTitle: test.title || test.testName || 'Test',
            testDuration: test.duration || 0
        };

        res.json(formattedResult);
    } catch (error) {
        console.error('Error fetching result:', error);
        res.status(500).json({ message: 'Error fetching result', error: error.message });
    }
};

// List all results for current student (latest first)
export const getMyResults = async (req, res) => {
    try {
        const results = await StudentTest.find({ studentId: req.user._id, status: 'completed' })
            .sort({ completedAt: -1 })
            .populate({ path: 'testId', model: 'Test', select: 'title duration totalMarks startTime' });
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching results', error: error.message });
    }
};

export const getAllTestQuestions = async (req, res) => {
    try {
        const questions = await TestQuestions.find();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};

export const getTestQuestionsForStudent = async (req, res) => {
    try {
        const { testId } = req.params;
        const questions = await TestQuestions.find({ testId });
        // Map to consistent structure
        const formattedQuestions = questions.map(q => ({
            id: q._id.toString(),
            text: q.question,
            type: q.type || 'mcq', // default to 'mcq' if not present
            options: q.options,
            correctAnswer: q.correctAnswer
        }));
        res.status(200).json(formattedQuestions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions', error: error.message });
    }
};
