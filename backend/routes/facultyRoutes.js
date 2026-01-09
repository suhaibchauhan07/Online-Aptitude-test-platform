import express from 'express';
import { 
    registerFaculty,
    loginFaculty,
    getFacultyProfile,
    updateFacultyProfile,
    createClass, 
    createTest, 
    uploadQuestions,
    changeFacultyPassword,
    getAllStudentResults,
    getStudentResultsByStudentId,
    getStudentTestResultByStudentAndTest,
    requestFacultyPasswordResetOtp,
    verifyFacultyPasswordResetOtp,
    resetFacultyPassword,
    lookupFacultyRegisteredPhoneByEmail,
    getDashboardStats
} from '../controllers/facultyController.js';
import uploadMiddleware from '../middleware/uploadMiddleware.js';
import { authMiddleware, requireRole } from '../middleware/authMiddleware.js';
import {
    authRateLimiter,
    authSpeedLimiter,
    mutationRateLimiter,
    uploadRateLimiter,
    uploadSpeedLimiter
} from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', authSpeedLimiter, authRateLimiter, registerFaculty);
router.post('/login', authSpeedLimiter, authRateLimiter, loginFaculty);
router.post('/forgot-password/lookup-email', authSpeedLimiter, authRateLimiter, lookupFacultyRegisteredPhoneByEmail);
router.post('/forgot-password/request-otp', authSpeedLimiter, authRateLimiter, requestFacultyPasswordResetOtp);
router.post('/forgot-password/verify-otp', authSpeedLimiter, authRateLimiter, verifyFacultyPasswordResetOtp);
router.post('/forgot-password/reset', authSpeedLimiter, authRateLimiter, resetFacultyPassword);

// Protected routes
router.get('/dashboard-stats', authMiddleware, requireRole(['faculty']), getDashboardStats);
router.get('/profile', authMiddleware, requireRole(['faculty']), getFacultyProfile);
router.put('/profile', authMiddleware, requireRole(['faculty']), mutationRateLimiter, updateFacultyProfile);
router.post('/create-class', authMiddleware, requireRole(['faculty']), mutationRateLimiter, createClass);
router.post('/create-test', authMiddleware, requireRole(['faculty']), mutationRateLimiter, createTest);
router.post(
    '/upload-questions',
    authMiddleware,
    requireRole(['faculty']),
    uploadSpeedLimiter,
    uploadRateLimiter,
    uploadMiddleware.single('file'),
    uploadQuestions
);
router.post('/change-password', authMiddleware, requireRole(['faculty']), mutationRateLimiter, changeFacultyPassword);
router.get('/student-results', authMiddleware, requireRole(['faculty']), getAllStudentResults);
router.get('/student-results/:studentId', authMiddleware, requireRole(['faculty']), getStudentResultsByStudentId);
router.get('/student-results/:studentId/tests/:testId', authMiddleware, requireRole(['faculty']), getStudentTestResultByStudentAndTest);

export default router;
