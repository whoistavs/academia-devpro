import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { verifyAdmin } from '../middleware/auth.js';
import {
    getFinancials,
    getDebts,
    registerManualPayout,
    getApprovals,
    approveTransaction,
    rejectTransaction,
    getCoupons,
    createCoupon,
    deleteCoupon,
    updateCoupon,
    getUsers,
    deleteUser,
    updateUserRole
} from '../controllers/adminController.js';

const router = express.Router();

// Financials
router.get('/admin/financials', verifyToken, verifyAdmin, getFinancials);
router.get('/admin/debts', verifyToken, verifyAdmin, getDebts);
router.post('/admin/payouts/manual', verifyToken, verifyAdmin, registerManualPayout);

// Approvals (Manual Payments)
router.get('/admin/approvals', verifyToken, verifyAdmin, getApprovals);
router.post('/admin/approve/:id', verifyToken, verifyAdmin, approveTransaction);
router.post('/admin/reject/:id', verifyToken, verifyAdmin, rejectTransaction);

// Coupons
router.get('/admin/coupons', verifyToken, verifyAdmin, getCoupons);
router.post('/admin/coupons', verifyToken, verifyAdmin, createCoupon);
router.delete('/admin/coupons/:id', verifyToken, verifyAdmin, deleteCoupon);
router.put('/admin/coupons/:id', verifyToken, verifyAdmin, updateCoupon);

// User Management
router.get('/users', verifyToken, verifyAdmin, getUsers);
router.delete('/users/:id', verifyToken, verifyAdmin, deleteUser);
router.patch('/users/:id/role', verifyToken, verifyAdmin, updateUserRole);

export default router;
