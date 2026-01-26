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
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


import connectDB from './connectDb.js';
import User from './models/User.js';
import Course from './models/Course.js';
import Progress from './models/Progress.js';
import Message from './models/Message.js';
import Comment from './models/Comment.js';
import Transaction from './models/Transaction.js';
import Payout from './models/Payout.js';
import ChatMessage from './models/ChatMessage.js';
import Review from './models/Review.js';
import Coupon from './models/Coupon.js';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';






const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.join(__dirname, '../.env');
const result = dotenv.config({ path: envPath });

if (result.error) {
    console.error("Error loading .env from:", envPath, result.error);
} else {
    // console.log(".env loaded from:", envPath);

}

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = process.env.JWT_SECRET || "chave_secreta_super_segura";

app.use(cors()); // Allow all origins (Netlify, Localhost, etc)
app.use(express.json()); // Ensure JSON body parsing is on too if missing




connectDB().then(async () => {

    try {



        console.log("Syncing Users from users.json...");
        const usersPath = path.join(__dirname, 'users.json');
        if (fs.existsSync(usersPath)) {
            const users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
            for (const u of users) {
                const existing = await User.findOne({ email: u.email });
                if (!existing) {
                    const userData = { ...u };
                    if (userData._id && userData._id.length !== 24) delete userData._id;
                    await User.create(userData);
                } else {




                    if (u.password && u.password !== existing.password) existing.password = u.password;
                    if (u.role && u.role !== existing.role) existing.role = u.role;
                    if (u.name && u.name !== existing.name) existing.name = u.name;
                    await existing.save();
                }
            }
            console.log(`Synced ${users.length} users from users.json`);
        }


        const adminEmail = 'octavio.marvel2018@gmail.com';
        const adminExists = await User.findOne({ email: adminEmail });
        if (!adminExists) {
            console.log("Seeding Admin User (Fallback)...");
            const hashedPassword = await bcrypt.hash('123456', 10);
            await User.create({
                name: "Octavio Rodrigues Schwab",
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                verified: true,
                isVerified: true,
                avatar: "http://localhost:3000/uploads/1765981908160.jpg",
                profileCompleted: true,
                bankAccount: { pixKey: '13eede2d-188c-456e-a39c-17fa855e496b' }
            });
            console.log("Admin seeded. Login with: 123456");
        }

        // === Seed Coupons ===
        try {
            const couponsPath = path.join(__dirname, 'coupons.json');
            if (fs.existsSync(couponsPath)) {
                const fileData = fs.readFileSync(couponsPath, 'utf-8');
                const coupons = JSON.parse(fileData);
                if (coupons.length > 0) {
                    console.log("Syncing Coupons from coupons.json...");
                    for (const c of coupons) {
                        const exists = await Coupon.findOne({ code: c.code });
                        if (!exists) {
                            await Coupon.create(c);
                            console.log(`Seeded Coupon: ${c.code}`);
                        } else {
                            // Ensure it's active
                            exists.discountPercentage = c.discountPercentage;
                            exists.validUntil = c.validUntil;
                            await exists.save();
                        }
                    }
                }
            }
        } catch (couponErr) {
            console.error("Error seeding coupons:", couponErr);
        }


        const courseCount = await Course.countDocuments();
        if (courseCount === 0) {
            console.log("Database empty. Seeding initial courses...");
            const dataPath = path.join(__dirname, 'courses.json');
            if (fs.existsSync(dataPath)) {
                const courses = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));


                let authorId = 'admin';
                const adminUser = await User.findOne({ email: adminEmail });
                if (adminUser) authorId = adminUser._id;

                for (const c of courses) {
                    const slug = c.slug || (typeof c.title === 'string' ? c.title : (c.title.pt || 'curso')).toLowerCase().replace(/[^a-z0-9]/g, '-');
                    const { _id, ...courseData } = c;

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
                        _id: _id && _id.length === 24 ? _id : undefined,
                        modulos,
                        slug,
                        authorId,
                        status: 'published'
                    });
                }
                console.log("Course Seeding complete.");


                if (adminUser) {
                    const logica = await Course.findOne({ slug: 'logica-de-programacao' });
                    if (logica && !adminUser.purchasedCourses.includes(logica._id)) {
                        adminUser.purchasedCourses.push(logica._id);
                        await adminUser.save();
                    }
                }
            }
        }
    } catch (e) {
        console.error("Seeding error:", e);
    }
});



const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const sendVerificationEmail = async (email, token, language = 'pt') => {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/verify-email?token=${token}`;

    const subjects = {
        pt: "Verifique seu email - DevPro Academy",
        en: "Verify your email - DevPro Academy",
        es: "Verifica tu correo - DevPro Academy",
        fr: "Vérifiez votre email - DevPro Academy",
        de: "Überprüfen Sie Ihre E-Mail - DevPro Academy",
        zh: "验证您的电子邮件 - DevPro Academy",
        ar: "تحقق من بريدك الإلكتروني - DevPro Academy"
    };

    const contents = {
        pt: { title: "Bem-vindo à DevPro Academy! 🚀", text1: "Estamos muito felizes em ter você conosco.", text2: "Para garantir a segurança da sua conta e acessar todos os recursos, por favor, clique no botão abaixo para verificar seu email:", btn: "Verificar Email Agora", small: "Ou copie e cole este link no seu navegador:" },
        en: { title: "Welcome to DevPro Academy! 🚀", text1: "We are very happy to have you with us.", text2: "To ensure your account security and access all features, please click the button below to verify your email:", btn: "Verify Email Now", small: "Or copy and paste this link into your browser:" },
        es: { title: "¡Bienvenido a DevPro Academy! 🚀", text1: "Estamos muy felices de tenerte con nosotros.", text2: "Para garantizar la seguridad de tu cuenta y acceder a todos los recursos, haz clic en el botón de abajo para verificar tu correo:", btn: "Verificar Correo Ahora", small: "O copia y pega este enlace en tu navegador:" },
        fr: { title: "Bienvenue chez DevPro Academy ! 🚀", text1: "Nous sommes très heureux de vous avoir parmi nous.", text2: "Pour assurer la sécurité de votre compte et accéder à toutes les fonctionnalités, veuillez cliquer sur le bouton ci-dessous pour vérifier votre email :", btn: "Vérifier l'Email Maintenant", small: "Ou copiez et collez ce lien dans votre navigateur :" },
        de: { title: "Willkommen bei DevPro Academy! 🚀", text1: "Wir freuen uns sehr, Sie bei uns zu haben.", text2: "Um die Sicherheit Ihres Kontos zu gewährleisten und auf alle Funktionen zuzugreifen, klicken Sie bitte auf die Schaltfläche unten:", btn: "E-Mail jetzt bestätigen", small: "Oder kopieren Sie diesen Link in Ihren Browser:" },
        zh: { title: "欢迎来到 DevPro Academy！🚀", text1: "我们非常高兴有您加入。", text2: "为了确保您的帐户安全并访问所有功能，请点击下面的按钮验证您的电子邮件：", btn: "立即验证电子邮件", small: "或者将此链接复制并粘贴到您的浏览器中：" },
        ar: { title: "مرحباً بكم في DevPro Academy! 🚀", text1: "نحن سعداء جداً بوجودك معنا.", text2: "لضمان أمان حسابك والوصول إلى جميع الميزات، يرجى النقر فوق الزر أدناه للتحقق من بريدك الإلكتروني:", btn: "تحقق من البريد الإلكتروني الآن", small: "أو انسخ هذا الرابط والصقه في متصفحك:" }
    };

    const lang = contents[language] ? language : 'pt';
    const content = contents[lang];

    try {
        await transporter.sendMail({
            from: `"DevPro Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subjects[lang],
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
                    <h2 style="color: #4F46E5;">${content.title}</h2>
                    <p>${content.text1}</p>
                    <p>${content.text2}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">${content.btn}</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">${content.small}</p>
                    <p style="color: #666; font-size: 12px;">${link}</p>
                </div>
            `
        });
        console.log(`Verification email sent to ${email}`);
        console.log(`DEV ONLY - Verification Link: ${link}`);
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};




cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});


let storage;
if (process.env.CLOUDINARY_CLOUD_NAME) {

    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'devpro_academy',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 800, height: 800, crop: 'limit' }]
        },
    });
    console.log("Using Cloudinary Storage");
} else {

    storage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = path.join(__dirname, 'uploads');
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


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


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
        console.log(`[VerifyAdmin] Check user: ${req.user?.email || 'No User'} Role: ${req.user?.role}`);
        if (req.user.role === 'admin') {
            next();
        } else {
            console.log(`[VerifyAdmin] Access Denied for ${req.user?.email}`);
            res.status(403).json({ error: 'Requer privilégios de administrador.' });
        }
    });
};



// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API Running' });
});


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


        const authorIds = [...new Set(courses.map(c => c.authorId).filter(id => id && id !== 'admin'))];
        const authors = await User.find({ _id: { $in: authorIds } });
        const authorMap = {};
        authors.forEach(a => authorMap[a._id.toString()] = a.name);

        const summary = await Promise.all(courses.map(async c => {
            const reviews = await Review.find({ courseId: c._id });
            const reviewCount = reviews.length;
            const avgRating = reviewCount > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount).toFixed(1)
                : 0;

            return {
                id: c._id,
                slug: c.slug,
                title: c.title,
                description: c.description,
                image: c.image,
                level: c.level,
                duration: c.duration,
                price: c.price || 0,
                category: c.category,
                totalLessons: (c.aulas && c.aulas.length > 0)
                    ? c.aulas.length
                    : (c.modulos && c.modulos.length > 0
                        ? c.modulos.reduce((acc, m) => acc + (m.items ? m.items.length : (m.aulas ? m.aulas.length : 0)), 0)
                        : 0),
                status: c.status,
                language: c.language || 'pt',
                authorId: c.authorId,
                authorName: c.authorId === 'admin' ? 'DevPro Oficial' : (authorMap[c.authorId] || 'Professor'),
                rating: avgRating,
                totalReviews: reviewCount
            };
        }));

        res.json(summary);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});


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


app.post('/api/courses', verifyToken, async (req, res) => {
    if (req.user.role !== 'professor' && req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Permissão negada.' });
    }

    const { title, description, category, level, image, duration, price, modulos, aulas, language } = req.body;

    if (!title || !description || !category) {
        return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }


    const titleText = typeof title === 'string' ? title : (title.pt || title.en || 'curso');
    const slug = titleText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-') + '-' + Date.now().toString(36);

    try {
        const newCourse = new Course({
            title, description, category, level, image, duration, slug,
            price: price || 0,
            modulos: modulos || [],
            aulas: aulas || [],
            language: language || 'pt',
            authorId: req.user.id,
            status: req.user.role === 'admin' ? 'published' : 'pending'
        });

        await newCourse.save();
        res.status(201).json(newCourse);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar curso.' });
    }
});


app.get('/api/admin/financials', verifyAdmin, async (req, res) => {
    console.log("[API] GET /api/admin/financials called");
    try {
        const transactions = await Transaction.find().sort({ createdAt: -1 });
        const payouts = await Payout.find({ userId: req.user.id, status: { $ne: 'failed' } });

        const totalSales = transactions.reduce((acc, t) => acc + t.amount, 0);
        const totalFees = transactions.reduce((acc, t) => acc + t.platformFee, 0);
        const totalPayoutsToPro = transactions.reduce((acc, t) => acc + t.sellerNet, 0);

        const withdrawn = payouts.reduce((acc, p) => acc + p.amount, 0);
        const availableBalance = totalFees - withdrawn;

        res.json({
            transactions: transactions.slice(0, 50),
            payouts,
            summary: {
                totalSales,
                totalFees,
                totalPayouts: totalPayoutsToPro,
                availableBalance,
                withdrawn
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao buscar financeiro' });
    }
});







app.get('/api/admin/debts', verifyAdmin, async (req, res) => {
    try {

        const professors = await User.find({ role: { $in: ['professor', 'admin'] } });
        const debts = [];

        for (const prof of professors) {
            const transactions = await Transaction.find({ sellerId: prof._id, status: 'approved' });
            const payouts = await Payout.find({ userId: prof._id, status: 'completed' });

            const totalEarned = transactions.reduce((acc, t) => acc + (t.sellerNet || 0), 0);
            const totalPaid = payouts.reduce((acc, p) => acc + (p.amount || 0), 0);
            const balance = totalEarned - totalPaid;

            if (balance > 0.01) {
                debts.push({
                    professorId: prof._id,
                    name: prof.name,
                    email: prof.email,
                    pixKey: prof.bankAccount?.pixKey || 'Não configurada',
                    balance: balance,
                    totalEarned,
                    totalPaid
                });
            }
        }

        res.json(debts);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao calcular dívidas.' });
    }
});


app.post('/api/admin/payouts/manual', verifyAdmin, async (req, res) => {
    try {
        const { professorId, amount, notes } = req.body;

        if (!professorId || !amount) return res.status(400).json({ error: 'Dados incompletos.' });

        const professor = await User.findById(professorId);
        if (!professor) return res.status(404).json({ error: 'Professor não encontrado.' });


        const payout = await Payout.create({
            userId: professorId,
            amount: Number(amount),
            bankDetails: professor.bankAccount || {},
            status: 'completed',
            processedAt: new Date(),
            notes: notes || 'Pagamento Manual via Admin'
        });

        res.json({ message: 'Pagamento registrado com sucesso!', payout });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao registrar pagamento.' });
    }
});





app.get('/api/admin/approvals', verifyAdmin, async (req, res) => {
    try {


        const pendings = await Transaction.find({ status: 'pending_approval' });


        const richPendings = await Promise.all(pendings.map(async (t) => {
            const buyer = await User.findById(t.buyerId).select('name email');
            let courseTitle = 'Curso Removido';

            if (t.trackId) {
                const track = tracks.find(tr => tr.id === t.trackId);
                if (track) courseTitle = `Trilha: ${track.title}`;
            } else if (t.courseId) {
                const course = await Course.findById(t.courseId).select('title');
                if (course) courseTitle = course.title.pt || course.title;
            }

            return {
                ...t.toObject(),
                buyerName: buyer ? buyer.name : 'Desconhecido',
                buyerEmail: buyer ? buyer.email : '---',
                courseTitle
            };
        }));

        res.json(richPendings);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar aprovações.' });
    }
});


app.post('/api/admin/approve/:id', verifyAdmin, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ error: 'Pedido não encontrado.' });

        if (transaction.status !== 'pending_approval') {
            return res.status(400).json({ error: 'Este pedido não está pendente.' });
        }


        const user = await User.findById(transaction.buyerId);

        if (user) {
            let coursesToAdd = [];

            if (transaction.trackId) {
                const track = tracks.find(t => t.id === transaction.trackId);
                if (track && track.courses) {
                    coursesToAdd = track.courses;
                }
            } else if (transaction.courseId) {
                coursesToAdd = [transaction.courseId];
            }

            let modified = false;
            for (const cid of coursesToAdd) {
                if (cid && !user.purchasedCourses.includes(cid)) {
                    user.purchasedCourses.push(cid);
                    modified = true;
                }
            }

            if (modified) await user.save();
        }



        const amount = transaction.amount || 0;
        transaction.platformFee = amount * 0.10;
        transaction.sellerNet = amount * 0.90;
        transaction.status = 'approved';
        await transaction.save();


        try {
            const usersPath = path.join(__dirname, 'users.json');
            if (user && fs.existsSync(usersPath)) {
                let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                const idx = users.findIndex(u => u.email === user.email);
                if (idx >= 0) {
                    const userObj = user.toObject();
                    if (userObj._id) userObj._id = userObj._id.toString();
                    users[idx] = { ...users[idx], ...userObj };
                    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                    console.log(`APPROVAL PERSISTENCE: Saved ${user.email} to users.json`);
                }
            }
        } catch (perr) { console.error("Persistence Warning:", perr); }

        res.json({ message: 'Aprovado com sucesso!' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao aprovar.' });
    }
});


app.post('/api/admin/reject/:id', verifyAdmin, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ error: 'Pedido não encontrado.' });

        transaction.status = 'rejected';
        await transaction.save();

        res.json({ message: 'Pedido rejeitado.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao rejeitar.' });
    }
});




app.get('/api/admin/coupons', verifyAdmin, async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar cupons.' });
    }
});


app.post('/api/admin/coupons', verifyAdmin, async (req, res) => {
    try {
        const { code, discountPercentage, validUntil, maxUses, maxUsesPerUser } = req.body;

        if (!code || !discountPercentage) {
            return res.status(400).json({ error: 'Código e Desconto são obrigatórios.' });
        }

        const coupon = new Coupon({
            code: code.toUpperCase(),
            discountPercentage,
            validUntil,
            maxUses,
            maxUsesPerUser: maxUsesPerUser || 1,
            createdBy: req.user.id
        });

        await coupon.save();
        res.json(coupon);
    } catch (e) {
        if (e.code === 11000) return res.status(400).json({ error: 'Código já existe.' });
        res.status(500).json({ error: 'Erro ao criar cupom.' });
    }
});


app.delete('/api/admin/coupons/:id', verifyAdmin, async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cupom removido.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao remover cupom.' });
    }
});


app.put('/api/admin/coupons/:id', verifyAdmin, async (req, res) => {
    try {
        const { code, discountPercentage, validUntil, maxUses, maxUsesPerUser } = req.body;

        const coupon = await Coupon.findById(req.params.id);
        if (!coupon) return res.status(404).json({ error: 'Cupom não encontrado.' });

        if (code) coupon.code = code.toUpperCase();
        if (discountPercentage) coupon.discountPercentage = discountPercentage;
        if (validUntil !== undefined) coupon.validUntil = validUntil;
        if (maxUses !== undefined) coupon.maxUses = maxUses;
        if (maxUsesPerUser !== undefined) coupon.maxUsesPerUser = maxUsesPerUser;

        await coupon.save();
        res.json(coupon);
    } catch (e) {
        if (e.code === 11000) return res.status(400).json({ error: 'Código já existe.' });
        res.status(500).json({ error: 'Erro ao atualizar cupom.' });
    }
});


app.post('/api/coupons/validate', async (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code) return res.status(400).json({ error: 'Código obrigatório.' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({ error: 'Cupom inválido.' });
        }


        if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) {
            return res.status(400).json({ error: 'Cupom expirado.' });
        }


        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            return res.status(400).json({ error: 'Cupom esgotado.' });
        }


        if (userId && coupon.maxUsesPerUser) {
            const userUses = coupon.usedBy.filter(id => id === userId).length;
            if (userUses >= coupon.maxUsesPerUser) {
                return res.status(400).json({ error: `Cupom já utilizado o máximo de vezes (${coupon.maxUsesPerUser}) por você.` });
            }
        }

        res.json({
            valid: true,
            discountPercentage: coupon.discountPercentage,
            code: coupon.code
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao validar cupom.' });
    }
});




app.get('/api/professor/students', verifyToken, async (req, res) => {
    try {

        const myCourses = await Course.find({ authorId: req.user.id });
        const myCourseIds = myCourses.map(c => c._id.toString());



        const students = await User.find({
            purchasedCourses: { $in: myCourseIds }
        }).select('name email avatar purchasedCourses');


        const richStudents = students.map(s => {
            const boughtMyCourses = myCourses.filter(c =>
                s.purchasedCourses.includes(c._id.toString()) ||
                s.purchasedCourses.includes(c._id)
            );
            return {
                id: s._id,
                name: s.name,
                email: s.email,
                avatar: s.avatar,
                courses: boughtMyCourses.map(c => c.title)
            };
        });

        res.json(richStudents);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao buscar alunos.' });
    }
});


app.get('/api/student/professors', verifyToken, async (req, res) => {
    try {
        const studentId = req.user.id;
        const student = await User.findById(studentId);

        if (!student.purchasedCourses || student.purchasedCourses.length === 0) {
            return res.json([]);
        }


        const purchasedCourses = await Course.find({
            _id: { $in: student.purchasedCourses }
        });


        const authorIds = [...new Set(purchasedCourses.map(c => c.authorId))];


        const professors = await User.find({
            _id: { $in: authorIds }
        }).select('name email avatar role');


        const richProfessors = professors.map(p => {
            const coursesTaught = purchasedCourses
                .filter(c => c.authorId === p._id.toString() || c.authorId === p.id)
                .map(c => c.title);

            return {
                id: p._id,
                name: p.name,
                email: p.email,
                avatar: p.avatar,
                role: p.role,
                courses: coursesTaught
            };
        });

        res.json(richProfessors);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao buscar professores.' });
    }
});


app.get('/api/chat/:userId', verifyToken, async (req, res) => {
    try {
        const otherId = req.params.userId;
        const myId = req.user.id;

        const messages = await ChatMessage.find({
            $or: [
                { senderId: myId, receiverId: otherId },
                { senderId: otherId, receiverId: myId }
            ]
        }).sort({ createdAt: 1 });

        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar chat.' });
    }
});


let chatStorage;
if (process.env.CLOUDINARY_CLOUD_NAME) {
    chatStorage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: {
            folder: 'devpro_chat',
            resource_type: 'auto',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'pdf', 'mp3', 'wav', 'ogg', 'mp4'],
        },
    });
} else {

    chatStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const uploadDir = 'server/uploads/chat';
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }
            cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });
}
const uploadChat = multer({ storage: chatStorage });


app.post('/api/chat/send', verifyToken, uploadChat.single('file'), async (req, res) => {
    try {
        const { receiverId, content } = req.body;
        const myId = req.user.id;

        let fileUrl = null;
        let fileType = null;
        let fileName = null;

        if (req.file) {
            fileUrl = req.file.path;
            fileName = req.file.originalname;


            if (fileName === 'voice-message.webm') {
                fileType = 'audio';
            } else {
                const mime = req.file.mimetype;
                if (mime.startsWith('image/')) fileType = 'image';
                else if (mime.startsWith('audio/')) fileType = 'audio';
                else if (mime.startsWith('video/')) fileType = 'video';
                else if (mime === 'application/pdf') fileType = 'pdf';
                else fileType = 'file';
            }
        }

        const msg = await ChatMessage.create({
            senderId: myId,
            receiverId,
            content: content || '',
            fileUrl,
            fileType,
            fileName
        });

        res.json(msg);
    } catch (e) {
        console.error("Send error:", e);
        res.status(500).json({ error: 'Erro ao enviar mensagem.' });
    }
});


app.put('/api/courses/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });







        const isOwner = course.authorId === req.user.id;
        const isSystemCourse = !course.authorId || course.authorId === 'admin';
        const isAdmin = req.user.role === 'admin';


        if (!isOwner && !(isAdmin && isSystemCourse)) {
            return res.status(403).json({ error: 'Permissão negada. Admin só edita cursos do Sistema ou Próprios.' });
        }

        Object.assign(course, req.body);

        course.markModified('modulos');
        course.markModified('aulas');

        await course.save();


        try {

            const coursesPath = path.join(__dirname, 'courses.json');

            if (fs.existsSync(coursesPath)) {
                let courses = JSON.parse(fs.readFileSync(coursesPath, 'utf-8'));

                const idx = courses.findIndex(c => String(c._id) === String(course._id) || c.slug === course.slug);

                if (idx >= 0) {
                    const courseObj = course.toObject();
                    if (courseObj._id) courseObj._id = courseObj._id.toString();


                    courses[idx] = { ...courses[idx], ...courseObj };

                    fs.writeFileSync(coursesPath, JSON.stringify(courses, null, 2));
                    console.log(`PERSISTENCE SUCCESS: Updated '${course.title}' in courses.json (matched index ${idx})`);
                } else {
                    console.warn(`PERSISTENCE WARNING: Could not find '${course.title}' (Slug: ${course.slug}, ID: ${course._id}) in courses.json`);
                }
            }
        } catch (err) {
            console.error("Failed to persist course update:", err);

        }

        res.json(course);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar.' });
    }
});



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


app.delete('/api/courses/:id', verifyToken, async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });


        const isOwner = course.authorId === req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!isOwner && !isAdmin) {
            return res.status(403).json({ error: 'Permissão negada.' });
        }

        await Course.findByIdAndDelete(req.params.id);
        res.json({ message: 'Curso excluído com sucesso.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao excluir curso.' });
    }
});


app.get('/api/courses/id/:id', async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });
        res.json(course);
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});


app.get('/api/courses/:slug', async (req, res) => {
    try {
        const course = await Course.findOne({ slug: req.params.slug });
        if (!course) return res.status(404).json({ error: 'Curso não encontrado.' });

        let authorName = 'Professor';
        if (course.authorId === 'admin') authorName = 'DevPro Oficial';
        else if (course.authorId) {
            try {
                const author = await User.findById(course.authorId);
                if (author) authorName = author.name;
            } catch (e) { }
        }

        const courseObj = course.toObject();
        courseObj.authorName = authorName;

        res.json(courseObj);
    } catch (e) {
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

import { Pix } from './utils/pix.js';


import { tracks } from './tracks.js'; // Ensure this is imported at top, adding here for context but should be careful

// ... inside /api/checkout ...
app.post('/api/checkout', verifyToken, async (req, res) => {
    const { courseId, trackId, couponCode } = req.body; // Added trackId
    try {
        let title, price; // vars to hold final info

        if (trackId) {
            const track = tracks.find(t => t.id === trackId);
            if (!track) return res.status(404).json({ error: 'Trilha não encontrada' });
            title = `Trilha: ${track.title}`;
            price = track.price;
        } else {
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            title = typeof course.title === 'string' ? course.title : (course.title.pt || 'Curso');
            price = Number(course.price);
        }

        const adminEmail = 'octavio.marvel2018@gmail.com';
        const admin = await User.findOne({ email: adminEmail });

        if (!admin || !admin.bankAccount || !admin.bankAccount.pixKey) {
            console.log("Admin Pix Key missing:", admin?.bankAccount);
            return res.status(400).json({ error: 'Chave Pix do sistema não configurada.' });
        }

        const pixKey = admin.bankAccount.pixKey;
        const name = admin.name.substring(0, 20);
        const city = 'SaoPaulo';

        let amount = Number(price);
        let discount = 0;

        // Coupons for tracks? Let's assume yes for now
        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (!coupon) {
                return res.status(400).json({ error: 'Cupom inválido.' });
            }

            const now = new Date();
            if (coupon.validUntil && now > new Date(coupon.validUntil)) {
                return res.status(400).json({ error: 'Cupom expirado.' });
            }

            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                return res.status(400).json({ error: 'Cupom esgotado.' });
            }

            // Valid coupon
            discount = (amount * coupon.discountPercentage) / 100;
            amount = amount - discount;
            if (amount < 0) amount = 0;
        }


        const txId = `CRS${Date.now().toString().slice(-10)}`;
        const pix = new Pix(pixKey, name, city, amount, txId);
        const payload = pix.getPayload();

        res.json({
            mode: 'pix_direct',
            payload,
            amount: amount.toFixed(2),
            originalPrice: price,
            discount: discount.toFixed(2),
            key: pixKey,
            txId,
            courseTitle: title
        });

    } catch (e) {
        console.error("Pix Gen Error:", e);
        res.status(500).json({ error: 'Erro ao gerar Pix.' });
    }
});


app.post('/api/payment/confirm-manual', verifyToken, async (req, res) => {
    const { courseId, trackId, txId, couponCode } = req.body;

    try {
        const user = await User.findById(req.user.id);

        let price = 0;
        let sellerId = null;

        if (trackId) {
            const track = tracks.find(t => t.id === trackId);
            if (!track) return res.status(404).json({ error: 'Trilha não encontrada' });
            price = track.price;
            // Tracks are sold by System (Admin) usually
            // finding admin id
            const admin = await User.findOne({ role: 'admin' });
            sellerId = admin ? admin._id : null;
        } else {
            const course = await Course.findById(courseId);
            price = course.price || 0;
            sellerId = course.authorId;
        }

        let discount = 0;
        let finalCode = null;


        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (coupon) {
                const now = new Date();
                const isExpired = coupon.validUntil && now > new Date(coupon.validUntil);
                const isExhausted = coupon.maxUses && coupon.usedCount >= coupon.maxUses;

                let isUserExhausted = false;
                if (coupon.maxUsesPerUser) {
                    const userUses = coupon.usedBy.filter(id => id === req.user.id).length;
                    if (userUses >= coupon.maxUsesPerUser) isUserExhausted = true;
                }

                if (!isExpired && !isExhausted && !isUserExhausted) {
                    discount = (price * coupon.discountPercentage) / 100;
                    price = price - discount;
                    if (price < 0) price = 0;
                    finalCode = coupon.code;


                    coupon.usedCount += 1;
                    coupon.usedBy.push(req.user.id);
                    await coupon.save();
                }
            }
        }


        await Transaction.create({
            courseId: courseId, // Can be null if trackId is present? Schema might require it. Check Schema.
            trackId: trackId,   // Add this to schema if strictly needed, or just leverage metadata.
            // WORKAROUND: If Schema requires courseId, use a placeholder or the first course ID.
            // But better to update schema. For now, if trackId exists, courseId might be ignored by approval logic but needed for DB.
            // Let's pass the first course ID of the track as a fallback if courseId is missing.
            buyerId: req.user.id,
            sellerId: sellerId,
            amount: price,
            platformFee: 0,
            sellerNet: 0,
            mpPaymentId: `PIX-MANUAL-${txId}`,
            status: 'pending_approval',
            couponCode: finalCode,
            discountAmount: discount
        });

        return res.json({ status: 'pending', message: 'Pagamento enviado para análise. Liberação em breve.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Manual confirm failed' });
    }
});



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



        const hasLesson = lessonId !== undefined && lessonId !== null && lessonId !== '';

        console.log(`[Progress Update] User: ${userId} Course: ${courseId} Lesson: ${lessonId} (HasLesson: ${hasLesson})`);

        if (hasLesson) {
            const lid = Number(lessonId);
            if (!progress.completedLessons.includes(lid) && !progress.completedLessons.includes(String(lid))) {
                progress.completedLessons.push(lid);
                console.log(`Added lesson ${lid} to progress.`);
            }
        }

        if (quizScore !== undefined) {
            progress.quizScores = { ...progress.quizScores, lastScore: quizScore, date: new Date() };
        }



        if (completed && !progress.moduleProgress[moduleIndex]?.lessons[lessonIndex]?.completed) {
            const user = await User.findById(userId);
            if (user) {

                const XP_PER_LESSON = 50;
                const XP_PER_QUIZ_PASS = 100;

                let xpGained = XP_PER_LESSON;


                if (quizScore !== undefined && quizScore >= 70) {
                    xpGained += XP_PER_QUIZ_PASS;
                }

                user.xp = (user.xp || 0) + xpGained;



                const newLevel = Math.floor(user.xp / 500) + 1;
                if (newLevel > (user.level || 1)) {
                    user.level = newLevel;

                }

                await user.save();
            }
        }


        progress.lastAccessed = new Date();
        await progress.save();

        res.json(progress);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao salvar progresso.' });
    }
});


app.get('/api/leaderboard', async (req, res) => {
    try {

        const users = await User.find({ role: 'student' })
            .sort({ xp: -1 })
            .limit(10)
            .select('name avatar xp level');
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar ranking.' });
    }
});



app.post('/api/cadastro', async (req, res) => {
    const { name, email, password, role, username, language = 'pt' } = req.body;

    try {
        const existingUser = await User.findOne({
            $or: [{ email }, { username: username }]
        });

        if (existingUser) {
            if (existingUser.email === email) return res.status(400).json({ error: 'Email já cadastrado.' });
            if (existingUser.username === username) return res.status(400).json({ error: 'Nome de usuário já existe.' });
        }


        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/;

        if (password.length < minLength || !hasNumber.test(password) || !hasSpecialChar.test(password)) {
            return res.status(400).json({ error: 'A senha deve ter 8+ caracteres, números e símbolos.' });
        }

        const hashedPassword = bcrypt.hashSync(password, 8);
        const verificationToken = Math.random().toString(36).substring(2);

        const newUser = new User({
            name, email,
            username, // Save username
            password: hashedPassword,
            role: role === 'professor' ? 'professor' : 'student',
            verificationToken,
            profileCompleted: false // Explicitly false initially
        });

        await newUser.save();

        // PERSISTENCE (DEV ONLY): Add new user to users.json
        try {
            // fs and path imported globally
            const usersPath = path.join(__dirname, 'users.json');

            if (fs.existsSync(usersPath)) {
                let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                // Check dupes again just in case
                if (!users.some(u => u.email === newUser.email)) {
                    let userObj = newUser.toObject();
                    if (userObj._id) userObj._id = userObj._id.toString();
                    users.push(userObj);
                    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                    console.log("PERSISTENCE SUCCESS: New user added to users.json:", newUser.email);
                }
            }
        } catch (err) {
            console.error("Failed to persist new user:", err);
        }

        // Send Email
        sendVerificationEmail(email, verificationToken, language);

        res.status(201).json({ message: 'Cadastro realizado! Verifique seu email.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
});

app.post('/api/user/complete-profile', verifyToken, async (req, res) => {
    const { name, cpf, rg, birthDate } = req.body;

    if (!name || !cpf || !rg || !birthDate) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        user.name = name;
        user.cpf = cpf;
        user.rg = rg;
        user.birthDate = birthDate;
        user.profileCompleted = true;

        await user.save();

        // PERSISTENCE (DEV ONLY): Update users.json
        try {
            const usersPath = path.join(__dirname, 'users.json');

            if (fs.existsSync(usersPath)) {
                let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                // Find and update or add
                const idx = users.findIndex(u => u.email === user.email);
                const userObj = user.toObject();

                // Ensure _id is string in JSON to match format
                if (userObj._id) userObj._id = userObj._id.toString();

                if (idx >= 0) {
                    users[idx] = { ...users[idx], ...userObj };
                } else {
                    users.push(userObj);
                }

                fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                console.log("Updated users.json with profile completion.");
            }
        } catch (err) {
            console.error("Failed to persist to users.json:", err);
        }

        res.json({
            message: 'Perfil completado com sucesso!',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                profileCompleted: true
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao salvar perfil.' });
    }
});

app.put('/api/users/bank-account', verifyToken, async (req, res) => {
    const { pixKey, bank, agency, account, accountType } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        user.bankAccount = {
            pixKey, bank, agency, account, accountType
        };

        await user.save();

        // Persistence: Update users.json
        try {
            const usersPath = path.join(__dirname, 'users.json');
            if (fs.existsSync(usersPath)) {
                const allUsers = await User.find({});
                fs.writeFileSync(usersPath, JSON.stringify(allUsers, null, 2));
                console.log("Updated users.json with new bank details.");
            }
        } catch (writeErr) {
            console.error("Error persisting to users.json:", writeErr);
        }

        res.json({ message: 'Dados bancários atualizados com sucesso!', bankAccount: user.bankAccount });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao salvar dados bancários.' });
    }
});

app.post('/api/verify-email', async (req, res) => {
    const { token } = req.body;

    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            console.log("Token not found in DB");
            return res.status(400).json({ error: 'Token inválido ou expirado.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Clear token
        await user.save();
        console.log(`User ${user.email} verified successfully.`);

        res.json({ message: 'Email verificado com sucesso!' });
    } catch (e) {
        console.error("Verification error:", e);
        res.status(500).json({ error: 'Erro ao verificar email.' });
    }
});

app.post('/api/resend-verification', async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
        if (user.isVerified) return res.status(400).json({ error: 'Este email já foi verificado.' });

        const verificationToken = Math.random().toString(36).substring(2);
        user.verificationToken = verificationToken;
        await user.save();

        sendVerificationEmail(email, verificationToken);

        res.json({ message: 'Novo email de verificação enviado! Cheque sua caixa de entrada.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao reenviar email.' });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

        if (!user.isVerified) return res.status(403).json({ error: 'Email não verificado. Cheque sua caixa de entrada.' });

        const expiresIn = rememberMe ? '30d' : '24h';
        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn });

        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            username: user.username,
            profileCompleted: user.profileCompleted,
            purchasedCourses: user.purchasedCourses || [],
            authProvider: user.authProvider,
            bankAccount: user.bankAccount, // Return bank account too
            accessToken: token
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro no login.' });
    }
});

app.post('/api/auth/verify-password', verifyToken, async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (user.authProvider === 'google') {
            // For Google users, since they don't know their random password, we might skip or require a different confirmation. 
            // For now, we return error instructing them this feature is for password interactions, 
            // OR we could allow it if we decide Google auth implies "security enough" for session (but the prompt asked for password).
            // Let's return 200 OK to bypass for Google users for usability in this specific POC context, 
            // but strictly speaking they should not be able to "verify password". 
            // Let's strictly follow "colocar senha". If they don't have one, they can't.
            // BUT, to avoid locking them out, let's treat "password" as "confirmation" for them? No, that's confusing.
            // Let's fail for Google users with a specific message.
            return res.status(400).json({ error: 'Usuários Google não possuem senha definida. Ação não permitida.' });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Senha incorreta.' });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao verificar senha.' });
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
            role: user.role,
            avatar: user.avatar,
            authProvider: user.authProvider,
            profileCompleted: user.profileCompleted,
            accessToken: token
        });

    } catch (e) {
        res.status(500).json({ error: 'Google Auth Failed' });
    }
});

// --- ADMIN ---

app.get('/api/users', verifyAdmin, async (req, res) => {
    console.log("[API] GET /api/users called");
    try {
        const users = await User.find({}, '-password'); // Exclude password
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
});

app.delete('/api/users/:id', verifyAdmin, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (deletedUser) {
            // Also remove from users.json to prevent reappearance on restart
            const usersPath = path.join(__dirname, 'users.json');
            if (fs.existsSync(usersPath)) {
                let localUsers = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                const originalLength = localUsers.length;
                // Filter by ID or Email (since local IDs might differ or match)
                localUsers = localUsers.filter(u => u._id !== req.params.id && u.email !== deletedUser.email);

                if (localUsers.length !== originalLength) {
                    fs.writeFileSync(usersPath, JSON.stringify(localUsers, null, 2));
                    console.log(`[API] User ${deletedUser.email} removed from users.json`);
                }
            }
        }

        res.json({ message: 'User deleted' });
    } catch (e) {
        console.error("Error deleting user:", e);
        res.status(500).json({ error: 'Erro ao excluir usuário.' });
    }
});

app.patch('/api/users/:id/role', verifyAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

        if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado.' });

        res.json({ message: 'Role updated', user: updatedUser });
    } catch (e) {
        console.error("Error updating role:", e);
        res.status(500).json({ error: e.message || 'Erro ao atualizar função.' });
    }
});

app.post('/api/admin/approve/:id', verifyAdmin, async (req, res) => {
    console.log(`[API] Approve requested for TX: ${req.params.id}`);
    try {
        const tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Transação não encontrada.' });

        if (tx.status === 'approved') return res.json({ message: 'Já aprovada.' });

        tx.status = 'approved';
        await tx.save();

        // Grant access to buyer
        const buyer = await User.findById(tx.buyerId);
        if (buyer) {
            if (tx.trackId) {
                const track = tracks.find(t => t.id === tx.trackId);
                if (track && track.courses) {
                    for (const cid of track.courses) {
                        if (!buyer.purchasedCourses.includes(cid)) {
                            buyer.purchasedCourses.push(cid);
                        }
                    }
                    await buyer.save();
                }
            } else if (tx.courseId) {
                if (!buyer.purchasedCourses.includes(tx.courseId)) {
                    buyer.purchasedCourses.push(tx.courseId);
                    await buyer.save();
                }
            }

            // Persistence (users.json) - keeping it in sync for dev
            try {
                const usersPath = path.join(__dirname, 'users.json');
                if (fs.existsSync(usersPath)) {
                    let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                    const idx = users.findIndex(u => u.email === buyer.email);
                    if (idx >= 0) {
                        const userObj = buyer.toObject();
                        if (userObj._id) userObj._id = userObj._id.toString();
                        users[idx] = { ...users[idx], ...userObj };
                        fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                    }
                }
            } catch (e) { console.error("Persistence error:", e); }
        }

        res.json({ message: 'Transação aprovada e acesso liberado.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao aprovar.' });
    }
});

app.post('/api/admin/reject/:id', verifyAdmin, async (req, res) => {
    try {
        const tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Transação não encontrada.' });

        tx.status = 'rejected';
        await tx.save();

        res.json({ message: 'Transação rejeitada.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao rejeitar.' });
    }
});

app.patch('/api/users/change-password', verifyToken, async (req, res) => {
    const { oldPassword, newPassword, language = 'pt' } = req.body;

    const messages = {
        pt: { fill: 'Preencha todos os campos.', notFound: 'Usuário não encontrado.', google: 'Usuários Google não possuem senha para alterar.', wrong: 'Senha atual incorreta.', weak: 'A nova senha deve ter 8+ caracteres, números e símbolos.', success: 'Senha alterada com sucesso.', error: 'Erro ao alterar senha.' },
        en: { fill: 'Please fill all fields.', notFound: 'User not found.', google: 'Google users do not have a password to change.', wrong: 'Incorrect current password.', weak: 'New password must have 8+ chars, numbers, and symbols.', success: 'Password changed successfully.', error: 'Error changing password.' },
        es: { fill: 'Rellene todos los campos.', notFound: 'Usuario no encontrado.', google: 'Usuarios de Google no tienen contraseña.', wrong: 'Contraseña actual incorrecta.', weak: 'La nueva contraseña debe tener 8+ caracteres, números y símbolos.', success: 'Contraseña cambiada con éxito.', error: 'Error al cambiar contraseña.' },
        fr: { fill: 'Veuillez remplir tous les champs.', notFound: 'Utilisateur non trouvé.', google: 'Les utilisateurs Google n\'ont pas de mot de passe à changer.', wrong: 'Mot de passe actuel incorrect.', weak: 'Le nouveau mot de passe doit comporter 8+ car., chiffres et symboles.', success: 'Mot de passe modifié avec succès.', error: 'Erreur lors du changement de mot de passe.' },
        de: { fill: 'Bitte füllen Sie alle Felder aus.', notFound: 'Benutzer nicht gefunden.', google: 'Google-Benutzer haben kein Passwort zum Ändern.', wrong: 'Aktuelles Passwort falsch.', weak: 'Neues Passwort muss 8+ Zeichen, Zahlen und Symbole enthalten.', success: 'Passwort erfolgreich geändert.', error: 'Fehler beim Ändern des Passworts.' },
        zh: { fill: '请填写所有字段。', notFound: '用户未找到。', google: 'Google 用户没有密码可更改。', wrong: '当前密码不正确。', weak: '新密码必须包含 8+ 个字符、数字和符号。', success: '密码修改成功。', error: '修改密码时出错。' },
        ar: { fill: 'يرجى ملء جميع الحقول.', notFound: 'المستخدم غير موجود.', google: 'مستخدمو Google ليس لديهم كلمة مرور لتغييرها.', wrong: 'كلمة المرور الحالية غير صحيحة.', weak: 'يجب أن تكون كلمة المرور الجديد 8+ أحرف وأرقام ورموز.', success: 'تم تغيير كلمة المرور بنجاح.', error: 'خطأ في تغيير كلمة المرور.' }
    };

    const msgs = messages[language] || messages.pt;

    if (!oldPassword || !newPassword) return res.status(400).json({ error: msgs.fill });

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: msgs.notFound });

        if (user.authProvider === 'google') {
            return res.status(400).json({ error: msgs.google });
        }

        const isValid = bcrypt.compareSync(oldPassword, user.password);
        if (!isValid) return res.status(401).json({ error: msgs.wrong });

        // Password Validation
        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/;

        if (newPassword.length < minLength || !hasNumber.test(newPassword) || !hasSpecialChar.test(newPassword)) {
            return res.status(400).json({ error: msgs.weak });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        user.password = hashedPassword;
        await user.save();

        res.json({ message: msgs.success });
    } catch (e) {
        res.status(500).json({ error: msgs.error });
    }
});


app.post('/api/forgot-password', async (req, res) => {
    const { email, language = 'pt' } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Email não encontrado.' });
        if (user.authProvider === 'google') return res.status(400).json({ error: 'Use o login do Google.' });


        const code = Math.floor(100000 + Math.random() * 900000).toString();

        user.resetPasswordToken = code;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
        await user.save();

        const subjects = {
            pt: "Recuperação de Senha - DevPro Academy",
            en: "Password Recovery - DevPro Academy",
            es: "Recuperación de Contraseña - DevPro Academy",
            fr: "Récupération de Mot de Passe - DevPro Academy",
            de: "Passwortwiederherstellung - DevPro Academy",
            zh: "找回密码 - DevPro Academy",
            ar: "استعادة كلمة المرور - DevPro Academy"
        };

        const contents = {
            pt: { title: "Recuperação de Senha 🔒", text1: "Você solicitou a redefinição da sua senha.", text2: "Use o código abaixo para continuar:", small1: "Este código expira em 15 minutos.", small2: "Se você não solicitou isso, ignore este email." },
            en: { title: "Password Recovery 🔒", text1: "You requested a password reset.", text2: "Use the code below to continue:", small1: "This code expires in 15 minutes.", small2: "If you did not request this, please ignore this email." },
            es: { title: "Recuperación de Contraseña 🔒", text1: "Has solicitado restablecer tu contraseña.", text2: "Usa el código abajo para continuar:", small1: "Este código expira en 15 minutos.", small2: "Si no solicitaste esto, ignora este correo." },
            fr: { title: "Récupération de Mot de Passe 🔒", text1: "Vous avez demandé la réinitialisation de votre mot de passe.", text2: "Utilisez le code ci-dessous pour continuer:", small1: "Ce code expire dans 15 minutes.", small2: "Si vous n'avez pas demandé cela, ignorez cet e-mail." },
            de: { title: "Passwortwiederherstellung 🔒", text1: "Sie haben das Zurücksetzen Ihres Passworts angefordert.", text2: "Verwenden Sie den untenstehenden Code:", small1: "Dieser Code läuft in 15 Minuten ab.", small2: "Wenn Sie dies nicht angefordert haben, ignorieren Sie diese E-Mail." },
            zh: { title: "找回密码 🔒", text1: "您请求重置密码。", text2: "请使用以下代码继续：", small1: "此代码在 15 分钟后过期。", small2: "如果您未请求此操作，请忽略此邮件。" },
            ar: { title: "استعادة كلمة المرور 🔒", text1: "لقد طلبت إعادة تعيين كلمة المرور الخاصة بك.", text2: "استخدم الرمز أدناه للمتابعة:", small1: "تنتهي صلاحية هذا الرمز في 15 دقيقة.", small2: "إذا لم تطلب ذلك، يرجى تجاهل هذا البريد الإلكتروني." }
        };

        const lang = contents[language] ? language : 'pt';
        const content = contents[lang];

        await transporter.sendMail({
            from: `"DevPro Academy" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: subjects[lang],
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; direction: ${lang === 'ar' ? 'rtl' : 'ltr'};">
                    <h2 style="color: #4F46E5;">${content.title}</h2>
                    <p>${content.text1}</p>
                    <p>${content.text2}</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="background-color: #f3f4f6; padding: 15px 30px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1F2937;">${code}</span>
                    </div>
                    <p style="color: #666; font-size: 14px;">${content.small1}</p>
                    <p style="color: #666; font-size: 12px;">${content.small2}</p>
                </div>
            `
        });

        res.json({ message: 'Código enviado para seu email.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao enviar email.' });
    }
});

app.post('/api/validate-code', async (req, res) => {
    const { email, code, language = 'pt' } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        const messages = {
            pt: { invalid: 'Código inválido ou expirado.', error: 'Erro ao validar código.' },
            en: { invalid: 'Invalid or expired code.', error: 'Error validating code.' },
            es: { invalid: 'Código inválido o expirado.', error: 'Error al validar código.' },
            fr: { invalid: 'Code invalide ou expiré.', error: 'Erreur lors de la validation du code.' },
            de: { invalid: 'Ungültiger oder abgelaufener Code.', error: 'Fehler bei der Code-Validierung.' },
            zh: { invalid: '代码无效或过期。', error: '验证代码时出错。' },
            ar: { invalid: 'رمز غير صالح أو منتهي الصلاحية.', error: 'خطأ في التحقق من الرمز.' }
        };

        const msgs = messages[language] || messages.pt;

        if (!user) return res.status(400).json({ error: msgs.invalid });

        res.json({ message: 'Código válido.' });
    } catch (e) {
        const messages = {
            pt: { error: 'Erro ao validar código.' },
            en: { error: 'Error validating code.' },
            es: { error: 'Error al validar código.' },
            fr: { error: 'Erreur lors de la validation du code.' },
            de: { error: 'Fehler bei der Code-Validierung.' },
            zh: { error: '验证代码时出错。' },
            ar: { error: 'خطأ في التحقق من الرمز.' }
        };
        const msgs = messages[req.body.language] || messages.pt;
        res.status(500).json({ error: msgs.error });
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { email, code, newPassword, language = 'pt' } = req.body;
    try {
        const user = await User.findOne({
            email,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });

        const messages = {
            pt: { invalid: 'Código inválido ou expirado.', weakPass: 'A senha deve ter 8+ caracteres, números e símbolos.', success: 'Senha alterada com sucesso! Faça login agora.', error: 'Erro ao redefinir senha.' },
            en: { invalid: 'Invalid or expired code.', weakPass: 'Password must be 8+ chars with numbers and symbols.', success: 'Password changed successfully! Login now.', error: 'Error resetting password.' },
            es: { invalid: 'Código inválido o expirado.', weakPass: 'La contraseña debe tener 8+ caracteres, números y símbolos.', success: 'Contraseña cambiada con éxito. Inicia sesión ahora.', error: 'Error al restablecer contraseña.' },
            fr: { invalid: 'Code invalide ou expiré.', weakPass: 'Le mot de passe doit comporter 8+ car., chiffres et symboles.', success: 'Mot de passe modifié avec succès ! Connectez-vous maintenant.', error: 'Erreur lors de la réinitialisation du mot de passe.' },
            de: { invalid: 'Ungültiger oder abgelaufener Code.', weakPass: 'Passwort muss 8+ Zeichen, Zahlen und Symbole enthalten.', success: 'Passwort erfolgreich geändert! Jetzt anmelden.', error: 'Fehler beim Zurücksetzen des Passworts.' },
            zh: { invalid: '代码无效或过期。', weakPass: '密码必须包含 8+ 个字符、数字和符号。', success: '密码修改成功！立即登录。', error: '重置密码时出错。' },
            ar: { invalid: 'رمز غير صالح أو منتهي الصلاحية.', weakPass: 'يجب أن تكون كلمة المرور 8+ أحرف وأرقام ورموز.', success: 'تم تغيير كلمة المرور بنجاح! سجل الدخول الآن.', error: 'خطأ في إعادة تعيين كلمة المرور.' }
        };

        const msgs = messages[language] || messages.pt;

        if (!user) return res.status(400).json({ error: msgs.invalid });


        const minLength = 8;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>_]/;

        if (newPassword.length < minLength || !hasNumber.test(newPassword) || !hasSpecialChar.test(newPassword)) {
            return res.status(400).json({ error: msgs.weakPass });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 8);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: msgs.success });
    } catch (e) {
        const messages = {
            pt: { error: 'Erro ao redefinir senha.' },
            en: { error: 'Error resetting password.' },
            es: { error: 'Error al restablecer contraseña.' },
            fr: { error: 'Erreur lors de la réinitialisation du mot de passe.' },
            de: { error: 'Fehler beim Zurücksetzen des Passworts.' },
            zh: { error: '重置密码时出错。' },
            ar: { error: 'خطأ في إعادة تعيين كلمة المرور.' }
        };
        const msgs = messages[req.body.language] || messages.pt;
        res.status(500).json({ error: msgs.error });
    }
});

// --- USER PROFILE ---

// Correctly locate the GET endpoint for /api/users/me and adds authProvider
app.get('/api/users/me', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        // Manually constructing response to ensuring fields or just send user
        // user includes authProvider if it's in schema. 
        // Let's ensure we return it. user is a Mongoose doc, so .toJSON() is automatic.
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'System Error' });
    }
});
const handleUserUpdate = async (req, res) => {
    try {
        const updates = req.body; // Allow dynamic updates (name, avatar, etc)
        // Security check: Only allow specific fields
        const allowedUpdates = ['name', 'avatar', 'cpf', 'rg', 'birthDate', 'username', 'profileCompleted'];
        const actualUpdates = {};

        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                actualUpdates[key] = updates[key];
            }
        });

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        Object.keys(actualUpdates).forEach(key => {
            user[key] = actualUpdates[key];
        });

        // Ensure profileCompleted is true if we have the critical data (prevent forced redirect)
        if (user.name && user.cpf && user.rg) {
            user.profileCompleted = true;
        }

        await user.save();

        // PERSISTENCE (DEV ONLY): Update users.json
        try {
            const usersPath = path.join(__dirname, 'users.json');

            if (fs.existsSync(usersPath)) {
                let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                const idx = users.findIndex(u => u.email === user.email);

                if (idx >= 0) {
                    const userObj = user.toObject();
                    if (userObj._id) userObj._id = userObj._id.toString();
                    users[idx] = { ...users[idx], ...userObj };
                    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                    console.log("PERSISTENCE SUCCESS: Updated users.json for", user.email);
                } else {
                    console.log("PERSISTENCE WARNING: User not found in users.json", user.email);
                }
            } else {
                console.log("PERSISTENCE ERROR: users.json not found at", usersPath);
            }
        } catch (e) {
            console.error("PERSISTENCE CRITICAL: Failed to persist user update (Non-fatal):", e);
            // Do not return error to client, as DB update succeeded
        }

        const token = jwt.sign({ id: user._id, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

        res.json({
            message: 'Updated',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                profileCompleted: user.profileCompleted
            },
            token
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
};

app.patch('/api/users/me', verifyToken, handleUserUpdate);
app.put('/api/users/me', verifyToken, handleUserUpdate);

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




// --- PROGRESS TRACKING ---

app.get('/api/progress/:courseId', verifyToken, async (req, res) => {
    try {
        const { courseId } = req.params;
        const userId = req.user.id;
        const progress = await Progress.findOne({ userId, courseId });
        res.json(progress || { completedLessons: [], quizScores: {} });
    } catch (e) {
        console.error("Error fetching progress:", e);
        res.status(500).json({ error: 'Erro ao buscar progresso.' });
    }
});

app.post('/api/progress/update', verifyToken, async (req, res) => {
    try {
        const { courseId, lessonId, progress } = req.body;
        const userId = req.user.id;

        // Validations
        if (!courseId || (!lessonId && lessonId !== 0)) {
            return res.status(400).json({ error: 'Dados incompletos.' });
        }

        let userProgress = await Progress.findOne({ userId, courseId });
        if (!userProgress) {
            userProgress = new Progress({
                userId,
                courseId,
                completedLessons: [],
                quizScores: {}
            });
        }

        if (lessonId === 'final_exam') {
            // Logic for final exam
            // Ensure quizScores matches schema structure (Mixed)
            const newScores = { ...(userProgress.quizScores || {}), final_exam: progress };
            userProgress.quizScores = newScores;

            // Also mark as completed lesson for counting purposes
            const exists = userProgress.completedLessons.some(l => String(l) === 'final_exam');
            if (!exists) {
                userProgress.completedLessons.push('final_exam');
            }

            // Issue Certificate if passed (progress >= 70) and not already issued
            if (progress >= 70) {
                const user = await User.findById(userId);
                if (user) {
                    const certExists = user.certificates?.some(c => c.courseId === courseId);
                    if (!certExists) {
                        const courseCode = courseId.toString().substring(0, 4).toUpperCase();
                        const userCode = userId.toString().substring(0, 8).toUpperCase();
                        const timestamp = Date.now().toString(36).toUpperCase();
                        const uniqueCode = `DVP-${courseCode}-${userCode}-${timestamp}`;

                        if (!user.certificates) user.certificates = [];
                        user.certificates.push({
                            courseId,
                            code: uniqueCode,
                            date: new Date()
                        });
                        await user.save();
                    }
                }
            }

            // Mark as accessed
            userProgress.lastAccessed = Date.now();
        } else {
            // Logic for normal lessons
            // Add to completed list if not exists
            // Convert to string to ensure consistency comparison
            const lid = String(lessonId);
            const exists = userProgress.completedLessons.some(l => String(l) === lid);

            if (!exists) {
                userProgress.completedLessons.push(lid);
            }
            userProgress.lastAccessed = Date.now();
        }

        await userProgress.save();
        res.json({ message: 'Progresso salvo.', progress: userProgress });

    } catch (e) {
        console.error("Error updating progress:", e);
        res.status(500).json({ error: 'Erro ao salvar progresso.' });
    }
});

app.post('/api/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error("Upload Middleware Error:", err);
            return res.status(500).json({ error: 'Erro no upload: ' + err.message });
        }

        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

        // Cloudinary returns file.path as the secure URL automatically (if using Cloudinary)
        let imageUrl = req.file.path;

        // If fallback to local storage (file.path is not http...), construct URL manually
        if (!imageUrl || !imageUrl.startsWith('http')) {
            // Force use of API_URL from env or construct strictly
            const baseUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }

        console.log("Image Uploaded:", imageUrl);
        res.json({ url: imageUrl });
    });
});


app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        const msg = new Message({ name, email, subject, message });
        await msg.save();

        // Send email to admin
        await transporter.sendMail({
            from: `"DevPro Contato" <${process.env.EMAIL_USER}>`,
            to: 'devproacademy@outlook.com',
            subject: `[Contato Site] ${subject}`,
            html: `
                <h3>Nova mensagem de contato</h3>
                <p><strong>Nome:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Assunto:</strong> ${subject}</p>
                <br>
                <p><strong>Mensagem:</strong></p>
                <p>${message}</p>
            `
        });

        res.status(201).json({ message: 'Sent' });
    } catch (e) {
        console.error("Contact Error:", e);
        res.status(500).json({ error: 'Erro.' });
    }
});


// --- COMMENTS ---

app.get('/api/courses', async (req, res) => {
    try {
        const courses = await Course.find({ status: 'published' });
        res.json(courses);
    } catch (e) {
        console.error("Error fetching courses:", e);
        res.status(500).json({ error: 'Erro ao buscar cursos.' });
    }
});









// Validate Certificate
app.get('/api/certificates/validate/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const user = await User.findOne({ 'certificates.code': code });

        if (!user) {
            return res.json({ valid: false });
        }

        const cert = user.certificates.find(c => c.code === code);
        const course = await Course.findById(cert.courseId);

        res.json({
            valid: true,
            studentName: user.name,
            courseTitle: course ? (typeof course.title === 'string' ? course.title : (course.title.pt || course.title.en)) : 'Curso Removido',
            date: cert.date
        });
    } catch (error) {
        console.error("Certificate validation error:", error);
        res.status(500).json({ error: 'Failed to validate certificate' });
    }
});


app.get('/api/courses/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const reviews = await Review.find({ courseId: id }).sort({ createdAt: -1 });


        const total = reviews.length;
        const average = total > 0
            ? (reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1)
            : 0;

        res.json({ reviews, average, total });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
});


app.post('/api/courses/:id/reviews', verifyToken, async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating) return res.status(400).json({ error: 'Nota é obrigatória.' });

    try {
        const user = await User.findById(req.user.id);






        const reviewData = {
            courseId: id,
            userId: user._id,
            userName: user.name,
            userAvatar: user.avatar,
            rating,
            comment,
            createdAt: new Date()
        };


        const review = await Review.findOneAndUpdate(
            { courseId: id, userId: user._id },
            reviewData,
            { new: true, upsert: true }
        );

        res.json(review);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro ao salvar avaliação.' });
    }
});

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

// --- ADMIN FINANCIALS ---
app.get('/api/admin/financials', verifyAdmin, async (req, res) => {
    try {
        const transactions = await Transaction.find().sort({ date: -1 });
        const courses = await Course.find();

        const totalRevenue = transactions
            .filter(t => t.status === 'approved')
            .reduce((acc, t) => acc + (t.amount || 0), 0);

        const activeStudents = await User.countDocuments({ role: 'student' });

        // Mock data if empty (for initial dashboard feel)
        const recentSales = transactions.slice(0, 5).map(t => ({
            id: t._id,
            user: "Student", // In real app, populate user
            amount: t.amount,
            date: t.date,
            status: t.status
        }));

        res.json({
            totalRevenue,
            activeStudents,
            recentSales
        });
    } catch (e) {
        console.error("Financials Error:", e);
        res.status(500).json({ error: 'Failed fetch financials' });
    }
});

// AI Chat Endpoint
// AI Chat Endpoint with Robust Fallback
app.post('/api/ai/chat', async (req, res) => {
    const { message, history, context } = req.body;

    // Função auxiliar para tentar gerar resposta com um modelo específico
    const tryGenerate = async (modelName) => {
        let systemInstructionText = `
            You are the **DevPro Tutor**, the Official Virtual Assistant of **DevPro Academy**.
            You are the **DevPro Tutor**, the Official Virtual Assistant of **DevPro Academy**.
            
            **INTERNAL NOTE**: The founder and lead instructor is **Octavio Schwab**. 
            ⚠️ **IMPORTANT**: Do NOT mention the founder's name unless the user **explicitly asks** who created the platform or who the teacher is.

            ### 🏢 ABOUT DEVPRO ACADEMY
            DevPro Academy is a premium online coding school designed to take students from absolute zero to professional ready.
            **Mission**: To provide high-quality, project-based education that helps students land their first dev job or get a promotion.

            ### 📚 COURSES & TRACKS
            1. **Fullstack Master**: Complete track covering Frontend (React, Tailwind) and Backend (Node.js, Express, MongoDB). Focus on building real web apps.
            2. **Data Science Pro**: Specialized track for Python, Machine Learning, and Data Analysis.
            3. **Soft Skills**: Courses on communication, career planning, and tech leadership ("Além do Código").

            ### ⚙️ HOW IT WORKS (THE PROCESS)
            - **Access**: Immediate access after payment approval.
            - **Certificates**: Users receive a certificate automatically upon completing 100% of a course.
            - **Methodology**: 100% practical, project-based learning. No boring theory without practice.
            - **Support**: We have a community and direct support channels.

            ### 🛡️ POLICIES & GUARANTEES
            - **Refunds**: We offer a **7-day unconditional money-back guarantee**. If the student is not satisfied, they can email us for a full refund.
            - **Payments**: We accept Credit Cards and PIX (via MercadoPago).
            - **Security**: Your data is protected. Use the "Privacy" page for more details.

            ### 📞 OFFICIAL CONTACTS
            - **Email**: devproacademy@outlook.com (Support & Refunds)
            - **WhatsApp**: +55 (19) 92003-3741
            - **Instagram**: https://instagram.com/devproacademy (@devproacademy)
            - **YouTube**: https://youtube.com/@devproacademy
            - **LinkedIn**: https://linkedin.com/company/devproacademy
            - **GitHub**: https://github.com/devproacademy

            ### 🤖 YOUR PERSONALITY
            - You are a **Senior Developer Mentor**: Wise, patient, encouraging, but technical and precise.
            - **Tone**: Professional yet approachable ("Friendly Senior").
            - **Formatting**: Use Markdown (bold for emphasis, code blocks for code, lists for steps).
            - **Language**: ALWAYS reply in the SAME language the user speaks (Portuguese vs English vs Spanish).

            ### 🛑 IMPORTANT RULES
            - **Never** invent features we don't have (like "live classes" if not strictly mentioned).
            - **Never** give personal opinions on politics or sensitive topics.
            - If you don't know something specific (e.g., "what is the date of the next live event?"), suggest checking the official Instagram.
        `;

        // Inject dynamic context (e.g., Lesson content)
        if (context) {
            systemInstructionText += `\n\nCURRENT CONTEXT (The user is viewing this content right now, use it to answer): \n${context}`;
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({
            model: modelName,
            systemInstruction: systemInstructionText
        });

        let chatHistory = history || [];

        // 1. Sanitize History (Ensure correct roles and format)
        chatHistory = chatHistory.map(msg => ({
            role: (msg.role === 'assistant' || msg.role === 'bot') ? 'model' : 'user', // Force valid roles
            parts: msg.parts || [{ text: msg.text || "" }]
        }));

        // 2. Ensure History starts with 'user'
        if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
            // Gemini throws error if history starts with model. Prepend a dummy greeting.
            chatHistory.unshift({ role: 'user', parts: [{ text: "Hello" }] });
        }

        const chat = model.startChat({
            history: chatHistory,
            generationConfig: { maxOutputTokens: 2048 },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        return response.text();
    };

    // Lista de modelos para tentar em ordem (Atualizado com modelos disponíveis na chave)
    const modelsToTry = ["gemini-2.0-flash", "gemini-flash-latest", "gemini-pro-latest"];
    let lastError = null;

    if (process.env.GEMINI_API_KEY) {
        for (const modelName of modelsToTry) {
            try {
                // console.log(`Attempting AI with model: ${modelName}...`);
                const text = await tryGenerate(modelName);
                return res.json({ text }); // Sucesso! Retorna e encerra.
            } catch (e) {
                console.warn(`Model ${modelName} failed:`, e.message);
                lastError = e;
                // Continua para o próximo modelo...
            }
        }
    }

    // SE CHEGOU AQUI: Nenhuma chave configurada OU todos os modelos falharam.
    // Ativar MODO FALLBACK (Simulação) para não quebrar a UI do usuário.

    console.warn("All AI models failed or no key. Using Fallback mode.");


    const lowerMsg = message.toLowerCase();
    let reply = "";

    // Simple language detection for fallback
    const isEnglish = /\b(hello|hi|help|price|cost|course|support|contact)\b/.test(lowerMsg);

    if (isEnglish) {
        if (lowerMsg.includes('price') || lowerMsg.includes('cost') || lowerMsg.includes('value')) {
            reply = "Our courses have varied and affordable prices. We recommend checking the 'Courses' page to see current offers! We have options starting at $29.90.";
        } else if (lowerMsg.includes('course') || lowerMsg.includes('python') || lowerMsg.includes('react')) {
            reply = "We have excellent learning tracks in React, Node.js, Python, and more. All with certificates and practical projects!";
        } else if (lowerMsg.includes('support') || lowerMsg.includes('help') || lowerMsg.includes('contact')) {
            reply = "If you need human support, please email devproacademy@outlook.com or call +55 (19) 92003-3741. You can also find our contacts in the footer.";
        } else if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            reply = "Hello! How can I help you accelerate your dev career today?";
        } else {
            reply = "Sorry, as I am a virtual assistant in training, I don't know how to answer that specific question yet.\n\nPlease contact our admin team directly for help:\n📧 Email: devproacademy@outlook.com\n📱 WhatsApp: +55 (19) 92003-3741";
        }
    } else {
        // Default to Portuguese
        if (lowerMsg.includes('preço') || lowerMsg.includes('valor') || lowerMsg.includes('custo')) {
            reply = "Nossos cursos têm preços variados e acessíveis. Recomendamos dar uma olhada na página 'Cursos' para ver as ofertas atuais! Temos opções a partir de R$ 29,90.";
        } else if (lowerMsg.includes('curso') || lowerMsg.includes('python') || lowerMsg.includes('react')) {
            reply = "Temos excelentes trilhas de aprendizado em React, Node.js, Python e muito mais. Todos com certificados e projetos práticos!";
        } else if (lowerMsg.includes('suporte') || lowerMsg.includes('ajuda') || lowerMsg.includes('contato')) {
            reply = "Se precisa de suporte humano, envie um e-mail para devproacademy@outlook.com ou ligue para +55 (19) 92003-3741. Você também encontra nossos contatos no rodapé da página.";
        } else if (lowerMsg.includes('oi') || lowerMsg.includes('ola') || lowerMsg.includes('olá')) {
            reply = "Olá! Como posso ajudar você a acelerar sua carreira de dev hoje?";
        } else {
            // Fallback genérico para perguntas desconhecidas
            reply = "Desculpe, como sou um assistente virtual em treinamento, não sei responder a essa pergunta específica ainda.\n\nPor favor, entre em contato diretamente com nossa equipe de administração para te ajudar:\n📧 Email: devproacademy@outlook.com\n📱 WhatsApp: +55 (19) 92003-3741";
        }
    }

    // Log para o admin do sistema (console do servidor)
    if (!process.env.GEMINI_API_KEY) {
        console.warn("⚠️ API Key do Gemini não configurada. Respondendo em modo fallback.");
    } else {
        console.warn("⚠️ Falha na API do Gemini. Respondendo em modo fallback.");
        if (lastError) {
            console.error("Erro Final:", lastError.message);
            // console.error("Stack:", lastError.stack);
        }
    }

    res.json({ text: reply });
});

// AI Challenge Correction Endpoint
app.post('/api/ai/correct-challenge', async (req, res) => {
    const { instruction, userAnswer, language } = req.body;
    console.log(`[AI CORRECTION] Analyzing submission...`);

    // 1. Basic Cheating Detection (Copy & Paste)
    const normalizedInstruction = instruction.toLowerCase().replace(/\s+/g, '');
    const normalizedAnswer = userAnswer.toLowerCase().replace(/\s+/g, '');

    if (normalizedAnswer.includes(normalizedInstruction) || normalizedInstruction.includes(normalizedAnswer)) {
        return res.json({
            isCorrect: false,
            feedback: language === 'en' ? "It seems you just copied the instruction. Please write your own solution code." : "Parece que você apenas copiou o enunciado. Por favor, escreva o código da sua solução.",
            isSimulation: !process.env.GEMINI_API_KEY
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        // Fallback simulation if no key
        await new Promise(r => setTimeout(r, 1000));
        return res.json({
            isCorrect: true,
            feedback: language === 'en' ? "Simulated correction (AI Key missing): Good job!" : "Correção simulada (Sem Chave AI): Bom trabalho! A lógica parece correta.",
            isSimulation: true
        });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use flash model for speed
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a programming instructor correcting a student's exercise.
            Language: ${language || 'pt'} (Reply ONLY in this language).
            
            Task Instruction: "${instruction}"
            Student Answer: "${userAnswer}"

            Analyze carefully.
            1. If it's code, check for syntax, logic, and infinite loops.
            2. If it's text/pseudocode, check if it solves the problem logically.
            3. Be constructive.
            4. REJECT IMMEDIATELY if the student just copied the instruction text without solving it.

            You must return a valid JSON object strictly complying to this format (no markdown blocks):
            {
                "isCorrect": boolean,       // true if the answer effectively solves the problem
                "feedback": "string",       // A helpful explanation (max 3 sentences)
                "sugguestion": "string"     // (Optional) A tip to improve
            }
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text().trim();

        // Sanitize markdown if present
        if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '');
        else if (text.startsWith('```')) text = text.replace(/```/g, '');

        const jsonResponse = JSON.parse(text);

        // Log for debug
        console.log(`[AI FEEDBACK] Correct: ${jsonResponse.isCorrect}`);

        res.json(jsonResponse);

    } catch (error) {
        console.error("AI Correction Error:", error);
        // Fallback allow pass
        res.json({
            isCorrect: true,
            feedback: language === 'en' ? "Unable to connect to AI Tutor, but your submission was saved." : "Não foi possível conectar ao Tutor IA no momento, mas sua resposta foi registrada.",
            error: true
        });
    }
});




// Serve Static Files in Production
const distPath = path.join(__dirname, '../dist');
if (fs.existsSync(distPath)) {
    console.log("Serving static files from dist...");
    app.use(express.static(distPath));

    // Handle React Routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
    });
}


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

