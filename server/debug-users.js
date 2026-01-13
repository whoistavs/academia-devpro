
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });


mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');

        
        const userSchema = new mongoose.Schema({
            name: String,
            email: String,
            role: String,
            createdAt: Date
        });

        const User = mongoose.model('User', userSchema);

        const users = await User.find({});
        console.log(`\n=== TOTAL USERS: ${users.length} ===\n`);

        users.forEach(u => {
            console.log(`[${u.role.toUpperCase()}] ${u.name} (${u.email}) - ID: ${u._id}`);
        });

        console.log('\n==========================\n');
        process.exit(0);
    })
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });
