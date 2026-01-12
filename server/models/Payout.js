
import mongoose from 'mongoose';

const payoutSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    bankDetails: {
        bank: String,
        agency: String,
        account: String,
        accountType: String,
        pixKey: String
    },
    status: { type: String, enum: ['pending', 'processing', 'completed', 'failed'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    processedAt: { type: Date }
});

export default mongoose.model('Payout', payoutSchema);
