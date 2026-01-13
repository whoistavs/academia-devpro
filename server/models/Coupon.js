import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    validUntil: { type: Date },
    maxUses: { type: Number },
    maxUsesPerUser: { type: Number, default: 1 }, 
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: String }], 
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: String } 
});

export default mongoose.model('Coupon', couponSchema);
