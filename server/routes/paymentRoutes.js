import express from 'express';
import * as paymentController from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', verifyToken, paymentController.checkout);
router.post('/payment/confirm-manual', verifyToken, paymentController.confirmManualPayment);
router.post('/coupons/validate', paymentController.validateCoupon);

export default router;
