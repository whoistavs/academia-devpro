import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
    avatar: { type: String },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    authProvider: { type: String, default: 'local' }, // 'google', 'local'
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
