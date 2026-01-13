import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
    avatar: { type: String },
    username: { type: String, unique: true, sparse: true }, 
    cpf: { type: String },
    rg: { type: String },
    birthDate: { type: Date },
    profileCompleted: { type: Boolean, default: false },
    bankAccount: {
        pixKey: { type: String },
        bank: { type: String },
        agency: { type: String },
        account: { type: String },
        accountType: { type: String } 
    },
    purchasedCourses: [{ type: String }], 
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    authProvider: { type: String, default: 'local' }, 
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
