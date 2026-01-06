import Test from "../models/Test.js";
import UserTest from "../models/UserTest.js";
import TestQuestion from '../models/testQuestions.js';
import StudentTest from '../models/studentTestModel.js';
 

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

export const listMyTests = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const tests = await Test.find({ createdBy: facultyId })
      .select('title description duration totalMarks startTime status createdAt updatedAt')
      .sort({ createdAt: -1 });
    const mongoose = (await import('mongoose')).default;
    const ids = tests.map(t => t._id);
    const counts = await TestQuestion.aggregate([
      { $match: { testId: { $in: ids } } },
      { $group: { _id: '$testId', count: { $sum: 1 }, marks: { $sum: '$marks' } } }
    ]);
    const map = new Map(counts.map(c => [String(c._id), { count: c.count, marks: c.marks }]));
    const enriched = tests.map(t => {
      const m = map.get(String(t._id)) || { count: 0, marks: t.totalMarks || 0 };
      return {
        id: t._id,
        title: t.title,
        description: t.description,
        duration: t.duration,
        totalMarks: m.marks ?? t.totalMarks,
        startTime: t.startTime,
        status: t.status,
        questionCount: m.count,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      };
    });
    res.status(200).json({ tests: enriched });
  } catch (error) {
    res.status(500).json({ message: 'Error listing tests', error: error.message });
  }
};

export const updateTestStatus = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { testId } = req.params;
    const { status } = req.body;
    if (!['draft', 'published', 'archived'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const test = await Test.findOneAndUpdate(
      { _id: testId, createdBy: facultyId },
      { status },
      { new: true }
    ).select('title status');
    if (!test) return res.status(404).json({ message: 'Test not found or unauthorized' });
    res.status(200).json({ message: 'Status updated', test });
  } catch (error) {
    res.status(500).json({ message: 'Error updating status', error: error.message });
  }
};

export const archiveTest = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { testId } = req.params;
    const test = await Test.findOneAndUpdate(
      { _id: testId, createdBy: facultyId },
      { status: 'archived' },
      { new: true }
    ).select('title status');
    if (!test) return res.status(404).json({ message: 'Test not found or unauthorized' });
    res.status(200).json({ message: 'Archived', test });
  } catch (error) {
    res.status(500).json({ message: 'Error archiving test', error: error.message });
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

export const deleteTest = async (req, res) => {
  try {
    const facultyId = req.user.id;
    const { testId } = req.params;
    const test = await Test.findOne({ _id: testId, createdBy: facultyId });
    if (!test) return res.status(404).json({ message: 'Test not found or unauthorized' });
    await Promise.all([
      TestQuestion.deleteMany({ testId }),
      UserTest.deleteMany({ testId }),
      StudentTest.deleteMany({ testId })
    ]);
    await Test.deleteOne({ _id: testId });
    res.status(200).json({ message: 'Test deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting test', error: error.message });
  }
};
