import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

// MongoDB Imports
import connectDB from './connectDb.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Progress from './models/Progress.js';
import Message from './models/Message.js';
import Comment from './models/Comment.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "chave_secreta_super_segura";


// Connect to MongoDB
connectDB().then(async () => {
    // Auto-Seed Check
    try {
        const count = await Course.countDocuments();
        if (count === 0) {
            console.log("Database empty. Seeding initial courses...");
            const dataPath = path.join(__dirname, 'courses.json');
            if (fs.existsSync(dataPath)) {
                const courses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
                for (const c of courses) {
                    // Ensure slug
                    const slug = c.slug || (typeof c.title === 'string' ? c.title : (c.title.pt || 'curso')).toLowerCase().replace(/[^a-z0-9]/g, '-');

                    // Sanitize ID usage: let Mongo create _id, but we can keep legacy logic if needed. 
                    // We remove _id from source if it conflicts, or just create new.
                    const { _id, ...courseData } = c;


                    // Sanitize Modules structure
                    // If 'modulos' is array of strings, convert to objects to satisfy Schema
                    let modulos = c.modulos || [];
                    if (Array.isArray(modulos) && modulos.length > 0 && typeof modulos[0] === 'string') {
                        modulos = modulos.map((m, i) => ({
                            id: i + 1,
                            title: m,
                            aulas: []
                        }));
                    }

                    await Course.create({
                        ...courseData,
                        modulos,
                        slug,
                        authorId: 'admin',
                        status: 'published'
                    });

                }
                console.log("Seeding complete.");
            }
        }
    } catch (e) {
        console.error("Seeding error:", e);
    }
});


// Email Configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Storage
let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    // Usage Cloudinary
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'devpro_academy', // Folder name in Cloudinary
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }] // Optimisation
        },
    });
    console.log("Using Cloudinary Storage");
} else {
    // Fallback Local
    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = 'server/uploads';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + path.extname(file.originalname));
        }
    });
    console.log("Using Local Disk Storage (FALLBACK)");
}

const upload = multer({ storage: storage });

// Enable CORS for ALL origins (Wildcard) to guarantee connection
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static('server/uploads'));

// Middleware
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        req.user = decoded;
        next();
    });
};

const verifyAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({ error: 'Requer privilégios de administrador.' });
        }
    });
};

// --- ROUTES ---

app.get('/', (req, res) => {
    res.json({ message: 'AcademiaDevPro API is running with MongoDB!' });
});

// GET Courses
app.get('/api/courses', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        let isAdmin = false;

        if (token) {
            try {
                const decoded = jwt.verify(token, SECRET_KEY);
                if (decoded.role === 'admin') isAdmin = true;
            } catch (e) { }
        }

        const query = isAdmin ? {} : { status: 'published' };
        const courses = await Course.find(query).sort({ createdAt: -1 });

        const summary = courses.map(c => ({
            id: c._id,
            slug: c.slug,
            title: c.title,
            description: c.description,
            image: c.image,
            level: c.level,
            duration: c.duration,
            category: c.category,
            totalLessons: c.aulas ? c.aulas.length : 0,
            status: c.status,
            authorId: c.authorId
        }));

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});

// GET Professor Courses
app.get('/api/professor/courses', verifyToken, async (req, res) => {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado.' });
    }
    try {
        const courses = await Course.find({ authorId: req.user.id });
        res.json(courses);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});

// POST Create Course
app.post('/api/courses', verifyToken, async (req, res) => {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada.' });
    }

    const { title, description, category, level, image, duration, modulos, aulas } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    // Slug generation
    const titleText = typeof title === 'string' ? title : (title.pt || title.en || 'curso');
    const slug = titleText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    try {
        const newCourse = new Course({
            title, description, category, level, image, duration, slug,
            modulos: modulos || [],
            aulas: aulas || [],
            authorId: req.user.id,
            status: req.user.role === 'admin' ? 'published' : 'pending'
        });

        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar curso.' });
    }
});

// PUT Update Course
app.put('/api/courses/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

        // Permission Logic:
        // 1. Admin can edit their own courses.
        // 2. Admin can edit "System" courses (where authorId is 'admin' or missing).
        // 3. Admin CANNOT edit courses owned by other professors (privacy).
        // 4. Professors can ONLY edit their own courses.

        const isOwner = course.authorId === req.user.id;
        const isSystemCourse = !course.authorId || course.authorId === 'admin';
        const isAdmin = req.user.role === 'admin';

        // Allowed if: It's my course OR (I'm admin AND it's a system course)
        if (!isOwner && !(isAdmin && isSystemCourse)) {
            return res.status(403).json({ error: 'Permissão negada. Admin só edita cursos do Sistema ou Próprios.' });
        }

        Object.assign(course, req.body);
        // Protect strict fields if needed

        await course.save();
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
});

// PATCH Update Status
app.patch('/api/courses/:id/status', verifyToken, async (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only.' });

    try {
        const { status } = req.body;
        const course = await Course.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!course) return res.status(404).json({ error: 'Not found.' });
        res.json({ message: `Status updated to ${status}` });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET Course Details
app.get('/api/courses/:slug', async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
        res.json(course);
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

// --- PROGRESS ---

app.get('/api/progress/:courseId', verifyToken, async (req, res) => {
    try {
        const progress = await Progress.findOne({ userId: req.user.id, courseId: req.params.courseId });
        res.json(progress || { completedLessons: [], quizScores: {} });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar progresso.' });
    }
});

app.post('/api/progress/update', verifyToken, async (req, res) => {
    const { courseId, lessonId, quizScore } = req.body;
    const userId = req.user.id;

    try {
        let progress = await Progress.findOne({ userId, courseId });

        if (!progress) {
            progress = new Progress({ userId, courseId, completedLessons: [], quizScores: {} });
        }

        if (lessonId && !progress.completedLessons.includes(lessonId)) {
            progress.completedLessons.push(lessonId);
        }

        if (quizScore !== undefined) {
            progress.quizScores = { ...progress.quizScores, lastScore: quizScore, date: new Date() };
        }

        progress.lastAccessed = new Date();
        await progress.save();

        res.json(progress);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao salvar progresso.' });
    }
});

// --- AUTH ---

app.post('/api/cadastro', async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email já cadastrado.' });

        const hashedPassword = bcrypt.hashSync(password, 8);
        const verificationToken = Math.random().toString(36).substring(2);

        const newUser = new User({
            name, email, password: hashedPassword,
            role: role === 'professor' ? 'professor' : 'student',
            verificationToken
        });

        await newUser.save();

        // Send Email (Mock or Real)
        // sendVerificationEmail(email, verificationToken); // Implement/Uncomment

        res.status(201).json({ message: 'Cadastro realizado com sucesso!' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

        // if (!user.isVerified) return res.status(403).json({ error: 'Email não verificado.' });

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            accessToken: token
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro no login.' });
    }
});

app.post('/api/auth/google', async (req, res) => {
    const { access_token } = req.body;
    try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!googleRes.ok) return res.status(401).json({ error: 'Invalid Google Token' });

        const googleData = await googleRes.json();
        const { email, picture } = googleData;

        // Robust name extraction
        const name = googleData.name || googleData.given_name || 'Usuário';

        let user = await User.findOne({ email });

        if (!user) {
            const tempPass = bcrypt.hashSync(Math.random().toString(36), 8);
            user = new User({
                name, email,
                password: tempPass,
                role: 'student',
                isVerified: true,
                avatar: picture,
                authProvider: 'google'
            });
            await user.save();
        } else {
            // Fix "undefined" name issue for existing users
            let changed = false;
            if (!user.name || user.name === 'undefined') {
                user.name = name;
                changed = true;
            }
            if (!user.avatar && picture) {
                user.avatar = picture;
                changed = true;
            }
            if (changed) await user.save();
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            accessToken: token
        });

    } catch (e) {
        res.status(500).json({ error: 'Google Auth Failed' });
    }
});

// --- ADMIN ---

app.get('/api/users', verifyAdmin, async (req, res) => {
    try {
        const users = await User.find({}, '-password'); // Exclude password
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});

app.delete('/api/users/:id', verifyAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});

app.patch('/api/users/:id/role', verifyAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: 'Role updated' });
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});

// --- USER PROFILE ---

app.patch('/api/users/me', verifyToken, async (req, res) => {
    try {
        const { name, avatar } = req.body;
        const user = await User.findByIdAndUpdate(req.user.id, { name, avatar }, { new: true });

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            message: 'Updated',
            user: { id: user._id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
            token
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});

app.post('/api/users/delete-me', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Conta excluída com sucesso.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao excluir conta.' });
    }
});

app.delete('/api/users/me', verifyToken, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.user.id);
        res.json({ message: 'Conta excluída com sucesso.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao excluir conta.' });
    }
});



app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file' });

    // Cloudinary returns file.path as the secure URL automatically
    let imageUrl = req.file.path;

    // If fallback to local storage (file.path is not http...), construct URL manually
    if (!imageUrl || !imageUrl.startsWith('http')) {
        const protocol = req.protocol;
        const host = req.get('host');
        imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    }

    res.json({ url: imageUrl });
});


app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const msg = new Message({ name, email, subject, message });
        await msg.save();
        res.status(201).json({ message: 'Sent' });
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});


// --- COMMENTS ---
app.get('/api/comments/:courseSlug/:lessonIndex', async (req, res) => {
    try {
        const { courseSlug, lessonIndex } = req.params;
        const comments = await Comment.find({ courseSlug, lessonIndex }).sort({ createdAt: -1 });
        res.json(comments);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar comentários' });
    }
});

app.post('/api/comments', verifyToken, async (req, res) => {
    try {
        const { courseSlug, lessonIndex, content } = req.body;
        const user = await User.findById(req.user.id);

        const newComment = new Comment({
            courseSlug,
            lessonIndex,
            userId: user._id,
            userName: user.name,
            userAvatar: user.avatar,
            content
        });

        await newComment.save();
        res.status(201).json(newComment);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao postar comentário' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
