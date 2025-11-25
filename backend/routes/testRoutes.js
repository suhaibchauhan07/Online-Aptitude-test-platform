import express from "express";
import { 
    createTest,
    getTestDetails,
    uploadTestQuestions,
    getTestQuestions
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

export default router;
