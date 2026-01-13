const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log("Connected. Retroactive fee fix...");

        const cursor = mongoose.connection.collection('transactions').find({ status: 'approved' });

        let count = 0;
        while (await cursor.hasNext()) {
            const tx = await cursor.next();
            
            if (tx.amount > 0 && (tx.platformFee === 0 || tx.sellerNet === 0)) {
                const fee = tx.amount * 0.10;
                const net = tx.amount * 0.90;

                await mongoose.connection.collection('transactions').updateOne(
                    { _id: tx._id },
                    { $set: { platformFee: fee, sellerNet: net } }
                );
                console.log(`Fixed fees for TX ${tx._id} (Amount: ${tx.amount})`);
                count++;
            }
        }

        console.log(`\nFixed ${count} transactions.`);
        mongoose.disconnect();
    })
    .catch(err => console.error(err));
