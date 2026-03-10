import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import {
    registerUser,
    verifyEmail,
    resendVerification,
    loginUser,
    verifyPassword
} from '../controllers/authController.js';

const router = express.Router();

router.post('/cadastro', registerUser);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', loginUser);
router.post('/auth/verify-password', verifyToken, verifyPassword);

export default router;
