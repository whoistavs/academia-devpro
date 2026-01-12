const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. Checking Payouts...");
        const payouts = await mongoose.connection.collection('payouts').find({}).toArray();
        console.log(`Found ${payouts.length} payouts.`);
        payouts.forEach(p => {
            console.log(`ID: ${p._id} | User: ${p.userId} | Amount: ${p.amount} | Status: ${p.status}`);
        });
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
