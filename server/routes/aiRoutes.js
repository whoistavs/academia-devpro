import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/ai/chat', aiController.aiChat);
router.post('/ai/correct-challenge', aiController.correctChallenge);

export default router;
