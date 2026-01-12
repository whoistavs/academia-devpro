const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. fixing...");

        // 1. Fix Missing Status for MANUAL payments
        const res = await mongoose.connection.collection('transactions').updateMany(
            { mpPaymentId: { $regex: /MANUAL/ }, status: { $exists: false } },
            { $set: { status: 'pending_approval' } }
        );
        console.log(`Updated ${res.modifiedCount} manual transactions to 'pending_approval'.`);

        // 2. Fix Missing Status for OTHERS (Assume Approved legacy)
        const res2 = await mongoose.connection.collection('transactions').updateMany(
            { status: { $exists: false } },
            { $set: { status: 'approved' } }
        );
        console.log(`Updated ${res2.modifiedCount} legacy transactions to 'approved'.`);

        mongoose.disconnect();
    })
    .catch(err => console.error(err));
