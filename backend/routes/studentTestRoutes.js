import express from 'express';
import { 
    registerStudent, 
    loginStudent, 
    getStudentProfile,
    updateStudentProfile,
    getInstructions, 
    getTestResult,
    getAllTestQuestions,
    getTestQuestionsForStudent,
    getMyResults,
    submitTest
} from '../controllers/studentController.js';
import { 
    getAvailableTests,
    getTestDetails,
    startTest
} from '../controllers/studentTestController.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
    authRateLimiter,
    authSpeedLimiter,
    mutationRateLimiter
} from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authSpeedLimiter, authRateLimiter, registerStudent);
router.post('/login', authSpeedLimiter, authRateLimiter, loginStudent);

// Protected routes - apply auth middleware to all routes
router.use(authMiddleware);

// Profile routes
router.get('/profile', getStudentProfile);
router.put('/profile', mutationRateLimiter, updateStudentProfile);

// Test routes
router.get('/tests/available', getAvailableTests);
router.get('/tests/:testId', getTestDetails);
router.get('/instructions/:testId', getInstructions);
router.post('/tests/:testId/start', mutationRateLimiter, startTest);
router.post('/tests/:testId/submit', mutationRateLimiter, submitTest);
router.get('/tests/:testId/result', getTestResult);
// My results
router.get('/results', getMyResults);

// Question routes
router.get('/questions', getAllTestQuestions);
router.get('/tests/:testId/questions', getTestQuestionsForStudent);

export default router;