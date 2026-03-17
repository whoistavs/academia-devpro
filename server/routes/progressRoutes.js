import express from 'express';
import * as progressController from '../controllers/progressController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/progress/:courseId', verifyToken, progressController.getProgress);
router.post('/progress/update', verifyToken, progressController.updateProgress);

export default router;
