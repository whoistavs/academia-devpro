const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. Diagnosing Payouts...");

        const txs = await mongoose.connection.collection('transactions').find({}).toArray();
        const users = await mongoose.connection.collection('users').find({}).toArray();

        console.log("\n--- Users (Professors?) ---");
        users.forEach(u => {
            console.log(`User: ${u.name} | ID: ${u._id} | Role: ${u.role}`);
        });

        console.log("\n--- Transactions ---");
        txs.forEach(t => {
            console.log(`TX: ${t._id} | Amount: ${t.amount} | Seller: ${t.sellerId} | Status: ${t.status}`);
        });

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
