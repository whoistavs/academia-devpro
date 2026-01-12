const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. Fetching...");
        const txs = await mongoose.connection.collection('transactions').find({}).toArray();
        console.log(`Found ${txs.length} transactions.`);
        txs.forEach(t => {
            console.log(`ID: ${t._id} | Amount: ${t.amount} | Status: '${t.status}' | Date: ${t.createdAt}`);
        });
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
