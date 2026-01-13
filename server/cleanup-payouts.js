
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
    status: String
});
const Payout = mongoose.model('Payout', payoutSchema);


mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const result = await Payout.deleteMany({});
        console.log(`Deleted ${result.deletedCount} payouts.`);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
