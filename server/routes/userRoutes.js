import express from 'express';
import { getPublicProfile, updateProfile } from '../controllers/userController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Public Profile
router.get('/users/public/:username', getPublicProfile);

// Authenticated Profile Updates
router.put('/users/profile', verifyToken, updateProfile);

export default router;
