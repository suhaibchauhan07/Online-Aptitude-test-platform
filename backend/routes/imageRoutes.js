import express from 'express';
import { getImage } from '../controllers/imageController.js';

const router = express.Router();

// Route to serve images by filename
router.get('/:filename', getImage);

export default router;
