
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

        
        const lastTransaction = await Transaction.findOne().sort({ createdAt: -1 });

        if (lastTransaction) {
            console.log(`Keeping latest transaction: ${lastTransaction._id} (R$${lastTransaction.amount})`);

            
            const result = await Transaction.deleteMany({ _id: { $ne: lastTransaction._id } });
            console.log(`Deleted ${result.deletedCount} old transactions.`);
        } else {
            console.log("No transactions found.");
        }

        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
