import Test from "../models/Test.js";
import UserTest from "../models/UserTest.js";
import TestQuestion from '../models/testQuestions.js';
 

export const getTestDetails = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    res.status(200).json(test);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

 

export const createTest = async (req, res) => {
    try {
        console.log('Received create test request:', req.body);
        const { testName, description, duration, totalMarks, startTime, instructions, status } = req.body;
        const facultyId = req.user.id;

        // Validate required fields (totalMarks will be computed from uploaded questions)
        if (!testName || !duration) {
            console.log('Missing required fields:', { testName, duration });
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // Create new test
        const test = new Test({
            title: testName,
            description: description || '',
            duration: Number(duration),
            totalMarks: Number(totalMarks) || 0,
            startTime,
            instructions,
            createdBy: facultyId,
            status: status === 'active' ? 'published' : (status || 'draft')
        });

        const savedTest = await test.save();
        console.log('Test created successfully:', savedTest);
        res.status(201).json({ 
            message: 'Test created successfully', 
            test: savedTest 
        });
    } catch (error) {
        console.error('Error creating test:', error);
        res.status(500).json({ message: error.message });
    }
};

export const uploadTestQuestions = async (req, res) => {
    try {
        console.log('Received upload questions request. TestID:', req.params.testId);
        console.log('Questions:', req.body.questions);
        
        const { testId } = req.params;
        const { questions } = req.body;
        const facultyId = req.user.id;

        // Verify test exists and belongs to faculty
        const test = await Test.findOne({ _id: testId, createdBy: facultyId });
        if (!test) {
            console.log('Test not found or unauthorized for faculty:', facultyId);
            return res.status(404).json({ message: 'Test not found or unauthorized' });
        }

        // Validate questions array
        if (!Array.isArray(questions) || questions.length === 0) {
            console.log('Invalid questions format received');
            return res.status(400).json({ message: 'Invalid questions format' });
        }

        // Process and validate each question
        const processedQuestions = questions.map((q, index) => {
            // Validate required fields
            if (!q.question || !q.options || !q.correctAnswer) {
                throw new Error(`Question ${index + 1}: Missing required fields`);
            }

            // Validate options
            if (!Array.isArray(q.options) || q.options.length < 2) {
                throw new Error(`Question ${index + 1}: Must have at least 2 options`);
            }

            // Validate correct answer
            if (!q.options.includes(q.correctAnswer)) {
                throw new Error(`Question ${index + 1}: Correct answer must be one of the options`);
            }

            // Normalize marks coming from different sources (e.g., Excel JSON) and tolerate case/whitespace
            const lower = Object.keys(q || {}).reduce((acc, k) => { acc[k.trim().toLowerCase()] = q[k]; return acc; }, {});
            const rawMarks = (q.marks ?? q.Marks ?? q.totalMarks ?? q.TotalMarks ?? lower['marks'] ?? lower['totalmarks']);
            const parsedMarks = Number(rawMarks);
            const safeMarks = Number.isFinite(parsedMarks) && parsedMarks > 0 ? parsedMarks : 1;

            return {
                testId,
                question: q.question.trim(),
                options: q.options.map(opt => opt.trim()),
                correctAnswer: q.correctAnswer,
                marks: safeMarks,
                createdBy: facultyId
            };
        });

        // Upsert questions by (testId, question) so re-uploads update marks/options/correctAnswer
        const bulkOps = processedQuestions.map((q) => ({
            updateOne: {
                filter: { testId, question: q.question },
                update: {
                    $set: {
                        options: q.options,
                        correctAnswer: q.correctAnswer,
                        marks: q.marks,
                        createdBy: q.createdBy
                    }
                },
                upsert: true
            }
        }));

        const bulkRes = await TestQuestion.bulkWrite(bulkOps);
        const upserted = (bulkRes.upsertedCount || 0);
        const modified = (bulkRes.modifiedCount || 0);
        console.log(`Questions upserted: ${upserted}, modified: ${modified}`);

        // Update test status and recompute totalMarks from questions
        try {
            const mongoose = (await import('mongoose')).default;
            const agg = await TestQuestion.aggregate([
                { $match: { testId: new mongoose.Types.ObjectId(testId) } },
                { $group: { _id: null, total: { $sum: '$marks' } } }
            ]);
            const computedTotal = Number(agg?.[0]?.total || 0);
            await Test.findByIdAndUpdate(testId, { status: 'published', totalMarks: computedTotal });
            console.log('Updated test.totalMarks to', computedTotal);
        } catch (e) {
            console.warn('Failed to recompute test.totalMarks:', e?.message || e);
            await Test.findByIdAndUpdate(testId, { status: 'published' });
        }

        res.status(201).json({
            message: 'Questions uploaded successfully',
            summary: { upserted, modified }
        });
    } catch (error) {
        console.error('Error uploading questions:', error);
        res.status(500).json({ 
            message: 'Error processing questions',
            error: error.message 
        });
    }
};

export const getTestQuestions = async (req, res) => {
    try {
        const { testId } = req.params;
        const facultyId = req.user.id;

        // Verify test exists and belongs to faculty
        const test = await Test.findOne({ _id: testId, createdBy: facultyId });
        if (!test) {
            return res.status(404).json({ message: 'Test not found or unauthorized' });
        }

        const questions = await TestQuestion.find({ testId })
            .select('-correctAnswer')
            .sort({ createdAt: 1 });

        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
};

// Add more: analytics, leaderboard etc.
