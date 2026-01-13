
import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
    courseId: { type: String, required: true },
    buyerId: { type: String, required: true },
    sellerId: { type: String }, 
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true }, 
    sellerNet: { type: Number, required: true }, 
    mpPaymentId: { type: String }, 
    status: { type: String, default: 'approved' }, 
    couponCode: { type: String },
    discountAmount: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Transaction', transactionSchema);
