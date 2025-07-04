import express from 'express';
import { 
    registerStudent, 
    loginStudent, 
    getStudentProfile,
    updateStudentProfile,
    getInstructions, 
    startTest, 
    submitTest,
    getAvailableTests,
    getTestDetails,
    getTestResult,
    getAllTestQuestions,
    getTestQuestionsForStudent
} from '../controllers/studentController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerStudent);
router.post('/login', loginStudent);

// Protected routes
router.use(authMiddleware);
router.use(requireRole(['student']));

// Profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', updateStudentProfile);

// Test routes
router.get('/tests/available', getAvailableTests);
router.get('/tests/:testId', getTestDetails);
router.get('/instructions/:testId', getInstructions);
router.post('/tests/:testId/start', startTest);
router.post('/tests/:testId/submit', submitTest);
router.get('/tests/:testId/result', getTestResult);

// Question routes
router.get('/questions', getAllTestQuestions);
router.get('/tests/:testId/questions', getTestQuestionsForStudent);

export default router;