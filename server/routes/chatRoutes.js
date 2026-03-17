import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { verifyToken } from '../middleware/auth.js';
import { chatUpload } from '../middleware/upload.js';

const router = express.Router();

router.get('/chat/:userId', verifyToken, chatController.getMessages);
router.post('/chat/send', verifyToken, chatUpload.single('file'), chatController.sendMessage);

export default router;
