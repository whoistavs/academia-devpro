
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const transactionSchema = new mongoose.Schema({
    courseId: String,
    buyerId: String,
    sellerId: String,
    amount: Number,
    platformFee: Number,
    sellerNet: Number,
    status: String,
    createdAt: Date
});
const Transaction = mongoose.model('Transaction', transactionSchema);


mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        const transactions = await Transaction.find({});
        console.log(`\n=== TOTAL TRANSACTIONS: ${transactions.length} ===\n`);

        transactions.forEach(t => {
            console.log(`[${t.status}] ID: ${t._id} | Seller: ${t.sellerId} | Amount: ${t.amount} | Fee: ${t.platformFee} | Net: ${t.sellerNet}`);
        });

        const totalFees = transactions.reduce((acc, t) => acc + (t.platformFee || 0), 0);
        console.log(`\nTOTAL PLATFORM FEES (Available Balance): ${totalFees}\n`);

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
