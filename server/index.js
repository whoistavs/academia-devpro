import './loadEnv.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Database & Seeder
import connectDB from './connectDb.js';
import { runSeeder } from './scripts/seeder.js';

// Modular Routes
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import professorRoutes from './routes/professorRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes Registration
app.use('/api', authRoutes);
app.use('/api', adminRoutes);
app.use('/api', courseRoutes);
app.use('/api', professorRoutes);
app.use('/api', aiRoutes);
app.use('/api', chatRoutes);
app.use('/api', progressRoutes);
app.use('/api', paymentRoutes);
app.use('/api', uploadRoutes);
app.use('/api', userRoutes);

// Health Check
app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'API Running' }));

// Static Files & Production Routing
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));
    app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

// Global Error Handlers
process.on('uncaughtException', (err) => console.error('🔥 CRITICAL: Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('🔥 CRITICAL: Unhandled Rejection:', reason));

// Startup
connectDB().then(async () => {
    await runSeeder();
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
