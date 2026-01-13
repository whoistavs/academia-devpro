
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
        console.log(`Found ${transactions.length} transactions to check.`);

        let fixedCount = 0;

        for (const t of transactions) {
            
            let amount = t.amount || 0;

            
            if (amount < 2) {
                amount = 150.00;
                t.amount = amount;
            }

            const newFee = amount * 0.10; 
            const newNet = amount * 0.90; 

            
            
            if (t.amount !== (t.amount || 0) || t.platformFee !== newFee || t.sellerNet !== newNet || !t.status) {
                t.platformFee = newFee;
                t.sellerNet = newNet;
                if (!t.status) t.status = 'approved'; 

                await t.save();
                console.log(`Fixed Transaction ${t._id}: Amount R$${amount} -> Fee R$${newFee} | Net R$${newNet}`);
                fixedCount++;
            }
        }

        console.log(`\nSuccess! Fixed ${fixedCount} transactions.`);
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
