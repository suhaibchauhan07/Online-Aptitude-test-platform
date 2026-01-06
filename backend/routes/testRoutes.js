import express from "express";
import { 
    createTest,
    getTestDetails,
    uploadTestQuestions,
    getTestQuestions,
    listMyTests,
    updateTestStatus,
    archiveTest,
    deleteTest
} from "../controllers/testController.js";
import { authMiddleware, requireRole } from "../middleware/authMiddleware.js";
import { mutationRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Protected routes
router.post('/create', authMiddleware, requireRole(['faculty']), mutationRateLimiter, createTest);
router.get('/:testId', authMiddleware, requireRole(['faculty']), getTestDetails);
router.post('/:testId/questions', 
    authMiddleware, 
    requireRole(['faculty']), 
    mutationRateLimiter,
    uploadTestQuestions
);
router.get('/:testId/questions', authMiddleware, requireRole(['faculty']), getTestQuestions);
router.get('/mine/list', authMiddleware, requireRole(['faculty']), listMyTests);
router.patch('/:testId/status', authMiddleware, requireRole(['faculty']), updateTestStatus);
router.patch('/:testId/archive', authMiddleware, requireRole(['faculty']), archiveTest);
router.delete('/:testId', authMiddleware, requireRole(['faculty']), deleteTest);

export default router;
