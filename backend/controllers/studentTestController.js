import Test from '../models/Test.js';
import StudentTest from '../models/studentTestModel.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import TestQuestions from '../models/testQuestions.js';

// Get available tests for student
export const getAvailableTests = async (req, res) => {
  try {    
    console.log('Fetching available tests...');    
    // Get all tests first to debug
    const allTests = await Test.find({}).select('title description instructions startTime endTime duration totalMarks testName');
    console.log('All tests in database:', allTests.length);
    console.log('Test details:', allTests.map(t => ({
      id: t._id,
      title: t.title || t.testName,
      startTime: t.startTime,
      endTime: t.endTime,
      hasStartTime: !!t.startTime,
      hasEndTime: !!t.endTime
    })));

    const now = new Date();
    console.log('Current time:', now);    
    // More flexible filtering - if no startTime/endTime, include the test
    const tests = await Test.find({
      status: 'published',
      $or: [
        // Tests with time constraints that are currently active
        {
          startTime: { $exists: true, $lte: now },
          endTime: { $exists: true, $gte: now }
        },
        // Tests without time constraints (always available)
        {
          startTime: { $exists: false },
          endTime: { $exists: false }
        },
        // Tests with only startTime (available after start)
        {
          startTime: { $exists: true, $lte: now },
          endTime: { $exists: false }
        }
      ]
    }).select('title description instructions startTime endTime duration totalMarks testName');

    const totalsAgg = await TestQuestions.aggregate([
      { $group: { _id: '$testId', total: { $sum: '$marks' } } }
    ]);
    const totalMap = new Map(totalsAgg.map(t => [String(t._id), Number(t.total)]));
    const enriched = tests.map(t => {
      const obj = t.toObject();
      obj.totalMarks = totalMap.get(String(t._id)) ?? obj.totalMarks;
      return obj;
    });

    console.log('Available tests after filtering:', tests.length);
    console.log('Available test details:', tests.map(t => ({
      id: t._id,
      title: t.title || t.testName,
      startTime: t.startTime,
      endTime: t.endTime
    })));

    res.status(200).json({
      status: 'success',
      data: enriched
    });
  } catch (error) {
    console.error('Error fetching available tests:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get test details and questions
export const getTestDetails = async (req, res) => {
  try {
    const test = await Test.findOne({ _id: req.params.testId, status: 'published' }).populate({ path: 'questions', model: 'TestQuestions' });
    if (!test) {
      return res.status(404).json({
        status: 'error',
        message: 'Test not found or not published'
      });
    }

    // Allow multiple attempts - no restrictions on retaking tests

    const computedTotal = Array.isArray(test.questions) ? test.questions.reduce((s, q) => s + Number(q?.marks ?? 1), 0) : (test.totalMarks || 0);
    res.status(200).json({
      status: 'success',
      data: {
        testName: test.testName,
        instructions: test.instructions,
        duration: test.duration,
        totalMarks: computedTotal,
        questions: test.questions
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Start test attempt
export const startTest = async (req, res) => {
  try {
    console.log('Starting test attempt...');
    console.log('Test ID:', req.params.testId);
    console.log('User ID:', req.user?._id);
    console.log('User role:', req.user?.role);

    // Check if user is authenticated
    if (!req.user || !req.user._id) {
      console.error('User not authenticated');
      return res.status(401).json({
        status: 'error',
        message: 'User not authenticated'
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      console.error('User is not a student:', req.user.role);
      return res.status(403).json({
        status: 'error',
        message: 'Only students can take tests'
      });
    }

    const test = await Test.findOne({ _id: req.params.testId, status: 'published' }).populate({ path: 'questions', model: 'TestQuestions' });
    if (!test) {
      console.error('Test not found:', req.params.testId);
      return res.status(404).json({
        status: 'error',
        message: 'Test not found or not published'
      });
    }

    console.log('Test found:', test.testName || test.title);

    // Check if student has already started the test
    const existingAttempt = await StudentTest.findOne({
      testId: test._id,
      studentId: req.user._id
    });

    if (existingAttempt) {
      console.log('Existing attempt found:', existingAttempt._id);
      const timeRemaining = test.duration - Math.floor((Date.now() - existingAttempt.startedAt) / 60000);
      return res.status(200).json({
        status: 'success',
        data: {
          attemptId: existingAttempt._id,
          timeRemaining: Math.max(0, timeRemaining)
        }
      });
    }

    console.log('Creating new test attempt...');
    // Create new test attempt
    const initialTotal = Array.isArray(test.questions) ? test.questions.reduce((s, q) => s + Number(q?.marks ?? 1), 0) : (test.totalMarks || 0);
    const newAttempt = await StudentTest.create({
      studentId: req.user._id,
      testId: test._id,
      totalMarks: Number(initialTotal) || 0,
      marksObtained: 0,
      percentage: 0,
      status: 'in_progress',
      startedAt: new Date()
    });

    console.log('Test attempt created successfully:', newAttempt._id);

    res.status(200).json({
      status: 'success',
      data: {
        attemptId: newAttempt._id,
        timeRemaining: test.duration || 60 // Default to 60 minutes if not set
      }
    });
  } catch (error) {
    console.error('Error in startTest:', error);
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Submit test
export const submitTest = async (req, res) => {
  try {
    console.log('Submitting test...');
    console.log('Test ID:', req.params.testId);
    console.log('User ID:', req.user?._id);
    console.log('Answers received:', req.body.answers);

    const { answers } = req.body;
    
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid answers format'
      });
    }

    const test = await Test.findById(req.params.testId);
    if (!test) {
      console.error('Test not found:', req.params.testId);
      return res.status(404).json({
        status: 'error',
        message: 'Test not found'
      });
    }

    console.log('Test found:', test.testName || test.title);

    // Always create a new test attempt (allow multiple attempts)
    console.log('Creating new test attempt...');
    const newAttempt = await StudentTest.create({
      studentId: req.user._id, 
      testId: test._id,
      totalMarks: test.totalMarks || test.questions?.length || 0,
      marksObtained: 0,
      percentage: 0,
      status: 'in_progress',
      startedAt: new Date() 
    });

    console.log('New test attempt created:', newAttempt._id);

    res.status(200).json({
      status: 'success',
      data: {
        attemptId: newAttempt._id,
        timeRemaining: test.duration || 60 // Default to 60 minutes if not set
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
}; 
