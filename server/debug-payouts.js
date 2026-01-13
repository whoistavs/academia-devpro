
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const payoutSchema = new mongoose.Schema({
    userId: String,
    amount: Number,
    status: String,
    requestedAt: Date
});
const Payout = mongoose.model('Payout', payoutSchema);


mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const payouts = await Payout.find({});
        console.log(`\n=== TOTAL PAYOUTS (SAQUES): ${payouts.length} ===\n`);

        payouts.forEach(p => {
            console.log(`[${p.status}] ID: ${p._id} | User: ${p.userId} | Amount: ${p.amount}`);
        });

        console.log('\n=================================\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
