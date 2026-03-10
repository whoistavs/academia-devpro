import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { calculateBadges } from '../utils/badgeSystem.js';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SECRET_KEY = process.env.JWT_SECRET || "chave_secreta_super_segura";

const mailConfig = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    family: 4,
    connectionTimeout: 10000,
    greetingTimeout: 5000,
    socketTimeout: 10000,
    tls: { rejectUnauthorized: false }
};

const transporter = nodemailer.createTransport(mailConfig);

export const sendVerificationEmail = async (email, token, language = 'pt') => {
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
    } catch (error) {
        console.error("Email sending failed:", error);
    }
};

export const registerUser = async (req, res) => {
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
            name, email, username,
            password: hashedPassword,
            role: role === 'professor' ? 'professor' : 'student',
            verificationToken,
            profileCompleted: false
        });

        // Initial Badge Check for new user
        newUser.badges = calculateBadges(newUser);

        await newUser.save();

        try {
            const usersPath = path.join(__dirname, '../users.json');
            if (fs.existsSync(usersPath)) {
                let users = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
                if (!users.some(u => u.email === newUser.email)) {
                    let userObj = newUser.toObject();
                    if (userObj._id) userObj._id = userObj._id.toString();
                    users.push(userObj);
                    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
                    console.log("PERSISTENCE SUCCESS: New user added to users.json");
                }
            }
        } catch (err) {
            console.error("Failed to persist new user:", err);
        }

        sendVerificationEmail(email, verificationToken, language);
        res.status(201).json({ message: 'Cadastro realizado! Verifique seu email.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Erro no servidor.' });
    }
};

export const verifyEmail = async (req, res) => {
    const { token } = req.body;
    try {
        const user = await User.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).json({ error: 'Token inválido ou expirado.' });
        }
        user.isVerified = true;
        user.verificationToken = crypto.randomBytes(20).toString('hex');
            
        // Initial Badge Check (might get first_100_xp if they had some admin-assigned stats)
        user.badges = calculateBadges(user);

        await user.save();
        res.json({ message: 'Email verificado com sucesso!' });
    } catch (e) {
        console.error("Verification error:", e);
        res.status(500).json({ error: 'Erro ao verificar email.' });
    }
};

export const resendVerification = async (req, res) => {
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
};

export const loginUser = async (req, res) => {
    const { email, password, rememberMe } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta.' });

        if (!user.isVerified) return res.status(403).json({ error: 'Email não verificado. Cheque sua caixa de entrada.' });

        // Gamification: Streak logic
        const targetDateLocaleOptions = { timeZone: 'America/Sao_Paulo' };
        // Normalize today's date to midnight
        const todayStr = new Date().toLocaleString('en-US', targetDateLocaleOptions);
        const todayNum = new Date(todayStr);
        todayNum.setHours(0, 0, 0, 0);

        if (user.lastLoginDate) {
            const lastLoginStr = new Date(user.lastLoginDate).toLocaleString('en-US', targetDateLocaleOptions);
            const lastLoginNum = new Date(lastLoginStr);
            lastLoginNum.setHours(0, 0, 0, 0);
            
            const diffTime = Math.abs(todayNum - lastLoginNum);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Logged in yesterday, increment
                user.streak = (user.streak || 0) + 1;
            } else if (diffDays > 1) {
                // Missed a day
                user.streak = 1;
            }
            // If diffDays === 0, they already logged in today, do nothing to streak
        } else {
            // First time logic
            user.streak = 1;
        }

        user.lastLoginDate = new Date(); // Save new login timestamp

        // Recalculate Badges based on updated streak, xp, etc.
        user.badges = calculateBadges(user);

        await user.save();

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
            bankAccount: user.bankAccount,
            streak: user.streak || 0,
            badges: user.badges || [],
            accessToken: token
        });
    } catch (e) {
        res.status(500).json({ error: 'Erro no login.' });
    }
};

export const verifyPassword = async (req, res) => {
    const { password } = req.body;
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (user.authProvider === 'google') {
            return res.status(400).json({ error: 'Usuários Google não possuem senha definida. Ação não permitida.' });
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ error: 'Senha incorreta.' });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao verificar senha.' });
    }
};
