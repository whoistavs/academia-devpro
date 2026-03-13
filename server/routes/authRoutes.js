import express from 'express';
import { 
    registerUser, verifyEmail, resendVerification, loginUser, verifyPassword,
    googleAuth, forgotPassword, validateCode, resetPassword, changePassword,
    getMe, completeProfile, updateBankAccount, updateMe, deleteMe, getRanking
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/cadastro', registerUser);
router.get('/ranking', getRanking);
router.get('/leaderboard', getRanking);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/login', loginUser);
router.post('/auth/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/validate-code', validateCode);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/users/me', verifyToken, getMe);
router.patch('/users/me', verifyToken, updateMe);
router.put('/users/me', verifyToken, updateMe);
router.delete('/users/me', verifyToken, deleteMe);
router.post('/users/delete-me', verifyToken, deleteMe);
router.post('/auth/verify-password', verifyToken, verifyPassword);
router.patch('/users/change-password', verifyToken, changePassword);
router.post('/user/complete-profile', verifyToken, completeProfile);
router.put('/users/bank-account', verifyToken, updateBankAccount);

export default router;
