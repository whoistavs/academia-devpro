import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
    userId: { type: String, required: true }, 
    courseId: { type: String, required: true },

    
    completedLessons: [{ type: mongoose.Schema.Types.Mixed }],

    quizScores: { type: mongoose.Schema.Types.Mixed, default: {} }, 

    lastAccessed: { type: Date, default: Date.now }
});


progressSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export default mongoose.model('Progress', progressSchema);
