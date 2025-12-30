import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // String to match User._id/id
    courseId: { type: String, required: true },

    // Array of lesson IDs (strings or numbers)
    completedLessons: [{ type: mongoose.Schema.Types.Mixed }],

    quizScores: { type: mongoose.Schema.Types.Mixed, default: {} }, // Flexible object for scores

    lastAccessed: { type: Date, default: Date.now }
});

// Composite index to ensure unique progress per user/course
progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
