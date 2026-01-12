import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'professor', 'admin'], default: 'student' },
    avatar: { type: String },
    username: { type: String, unique: true, sparse: true }, // sparse allows null/undefined to not conflict uniqueness
    cpf: { type: String },
    rg: { type: String },
    birthDate: { type: Date },
    profileCompleted: { type: Boolean, default: false },
    bankAccount: {
        pixKey: { type: String },
        bank: { type: String },
        agency: { type: String },
        account: { type: String },
        accountType: { type: String } // 'corrente', 'poupanca'
    },
    purchasedCourses: [{ type: String }], // Array of Course IDs (slugs or _ids)
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    authProvider: { type: String, default: 'local' }, // 'google', 'local'
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
