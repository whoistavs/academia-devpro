const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. Resetting Payouts...");
        const res = await mongoose.connection.collection('payouts').deleteMany({});
        console.log(`Deleted ${res.deletedCount} payouts.`);
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
