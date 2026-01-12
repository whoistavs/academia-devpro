
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    buyerId: { type: String, required: true },
    sellerId: { type: String }, // Can be 'admin' if system course, or ObjectId if professor
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true }, // 10%
    sellerNet: { type: Number, required: true }, // 90%
    mpPaymentId: { type: String }, // For reconciliation
    status: { type: String, default: 'approved' }, // 'approved', 'pending_approval', 'rejected'
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
