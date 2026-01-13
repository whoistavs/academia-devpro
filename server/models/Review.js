import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    courseId: { type: String, required: true }, 
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userAvatar: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
});


reviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
