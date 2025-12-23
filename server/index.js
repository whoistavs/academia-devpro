import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './simpleDb.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' }); // Load from root .env

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "chave_secreta_super_segura";

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: process.env.EMAIL_SECURE === 'true', // false for TLS
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify Transporter Connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error verifying email connection:', error);
    } else {
        console.log('Server is ready to take our messages. SMTP Host:', process.env.EMAIL_HOST);
    }
});

const sendVerificationEmail = async (email, token) => {
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'; // Simplification
    // In production user uses Netlify for frontend, so we should allow passing the base URL or hardcode it as requested
    const baseUrl = 'https://devproacademy.netlify.app'; // Requested by user
    const verificationLink = `${baseUrl}/verify?token=${token}`;

    const mailOptions = {
        from: `"DevPro Academy" <devproacademy@outlook.com>`,
        to: email,
        subject: 'Verifique sua conta - DevPro Academy',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; padding-bottom: 20px;">
                    <h1 style="color: #4F46E5;">DevPro Academy</h1>
                </div>
                <div style="padding: 20px; background-color: #f9fafb; border-radius: 8px;">
                    <h2 style="color: #1f2937;">Olá!</h2>
                    <p style="color: #4b5563; line-height: 1.6;">Obrigado por se cadastrar na DevPro Academy. Para confirmar sua conta e começar a aprender, clique no botão abaixo:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Confirmar Cadastro</a>
                    </div>
                    <p style="color: #4b5563; font-size: 14px;">Ou copie e cole o link abaixo no seu navegador:</p>
                    <p style="background-color: #e5e7eb; padding: 10px; border-radius: 4px; word-break: break-all; color: #6b7280; font-size: 12px;">${verificationLink}</p>
                </div>
                <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
                    <p>&copy; ${new Date().getFullYear()} DevPro Academy. Todos os direitos reservados.</p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        return false;
    }
};


// Configurar armazenamento do Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'server/uploads';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('server/uploads')); // Servir arquivos estáticos

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'AcademiaDevPro API is running!' });
});

// Register Endpoint
app.post('/api/cadastro', (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    // Check if user exists
    db.users.findOne({ email }, (err, user) => {
        if (err) {
            console.error('DB Error:', err);
            return res.status(500).json({ error: 'Erro no servidor.' });
        }
        if (user) return res.status(400).json({ error: 'E-mail já cadastrado.' });

        // Hash password
        const hashedPassword = bcrypt.hashSync(password, 8);
        const verificationToken = Math.random().toString(36).substring(2) + Date.now().toString(36);

        const newUser = {
            name,
            email,
            password: hashedPassword,
            role: 'student',
            isVerified: false,
            verificationToken: verificationToken,
            createdAt: new Date()
        };

        db.users.insert(newUser, (err, newDoc) => {
            if (err) {
                console.error('DB Make Error:', err);
                return res.status(500).json({ error: 'Erro ao criar usuário.' });
            }

            // SIMULATE EMAIL SENDING
            // const protocol = req.protocol;
            // const host = req.get('host');
            // const validationLink = `${protocol}://${host}/api/verify-email?token=${verificationToken}`;

            // console.log("\n==================================================");
            // console.log(`[MOCK EMAIL] Para: ${email}`);
            // console.log(`[MOCK EMAIL] Assunto: Verifique sua conta`);
            // console.log(`[MOCK EMAIL] Link: ${validationLink}`);
            // console.log("==================================================\n");

            // REAL EMAIL SENDING
            sendVerificationEmail(email, verificationToken);

            res.status(201).json({ message: 'Cadastro realizado! Verifique seu e-mail para ativar a conta.' });
        });
    });
});

// Test Email Endpoint
app.get('/api/test-email', async (req, res) => {
    const testToken = 'teste123';
    const sent = await sendVerificationEmail(process.env.EMAIL_USER, testToken); // Send to self
    if (sent) {
        res.send('Email enviado com sucesso! Verifique sua caixa de entrada (e spam).');
    } else {
        res.status(500).send('Falha ao enviar email. Verifique o console do servidor.');
    }
});

// Verify Email Endpoint
app.get('/api/verify-email', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token inválido.");

    db.users.findOne({ verificationToken: token }, (err, user) => {
        if (err || !user) return res.status(400).send("Link inválido ou expirado.");

        db.users.update({ _id: user._id }, { $set: { isVerified: true, verificationToken: null } }, {}, (err) => {
            if (err) return res.status(500).send("Erro ao ativar conta.");

            res.send(`
                <h1>Conta verificada com sucesso!</h1>
                <p>Você já pode fechar esta janela e fazer login no site.</p>
                <script>setTimeout(() => window.close(), 3000);</script>
            `);
        });
    });
});

// Login Endpoint
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
    }

    db.users.findOne({ email }, (err, user) => {
        if (err) return res.status(500).json({ error: 'Erro no servidor.' });
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) return res.status(401).json({ error: 'Senha incorreta.' });

        // CHECK VERIFICATION
        // For legacy users (created before this feature), isVerified might be undefined. Treat as true?
        // Or users created now have isVerified: false.
        // Let's be strict: if isVerified === false explicitly, block.
        if (user.isVerified === false) {
            return res.status(403).json({ error: 'Conta não verificada. Cheque seu e-mail (ou o console do servidor).' });
        }

        const token = jwt.sign({ id: user._id, role: user.role || 'student' }, SECRET_KEY, {
            expiresIn: 86400 // 24 hours
        });

        res.status(200).json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role || 'student',
            avatar: user.avatar,
            accessToken: token
        });
    });
});

// Google Auth Endpoint
app.post('/api/auth/google', async (req, res) => {
    const { access_token } = req.body;

    if (!access_token) {
        return res.status(400).json({ error: 'Token de acesso é obrigatório.' });
    }

    try {
        // Verify token with Google
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        if (!googleResponse.ok) {
            return res.status(401).json({ error: 'Token do Google inválido.' });
        }

        const googleUser = await googleResponse.json();
        const { email, name, picture } = googleUser;

        db.users.findOne({ email }, (err, user) => {
            if (err) return res.status(500).json({ error: 'Erro no servidor.' });

            if (user) {
                // Login existing user
                const token = jwt.sign({ id: user._id, role: user.role || 'student' }, SECRET_KEY, { expiresIn: 86400 });
                res.status(200).json({
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role || 'student',
                    avatar: user.avatar,
                    accessToken: token
                });
            } else {
                // Register new user
                const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
                const hashedPassword = bcrypt.hashSync(randomPassword, 8);

                const newUser = {
                    name,
                    email,
                    password: hashedPassword,
                    role: 'student',
                    isVerified: true, // Google verified
                    avatar: picture,
                    createdAt: new Date(),
                    authProvider: 'google'
                };

                db.users.insert(newUser, (err, newDoc) => {
                    if (err) return res.status(500).json({ error: 'Erro ao criar usuário Google.' });

                    const token = jwt.sign({ id: newDoc._id, role: 'student' }, SECRET_KEY, { expiresIn: 86400 });
                    res.status(201).json({
                        id: newDoc._id,
                        name: newDoc.name,
                        email: newDoc.email,
                        role: 'student',
                        avatar: newDoc.avatar,
                        accessToken: token
                    });
                });
            }
        });

    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ error: 'Falha na autenticação com Google.' });
    }
});


// Contact Endpoint
app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    const newMessage = {
        name,
        email,
        subject,
        message,
        read: false
    };

    db.messages.insert(newMessage, (err, savedMessage) => {
        if (err) return res.status(500).json({ error: 'Erro ao salvar mensagem.' });

        console.log(`[CONTACT] Nova mensagem de ${email}: ${subject}`);
        res.status(201).json({ message: 'Mensagem enviada com sucesso!' });
    });
});

// Admin Middleware
const verifyAdmin = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });

        if (decoded.role !== 'admin') {
            return res.status(403).json({ error: 'Acesso negado. Requer privilégios de administrador.' });
        }

        req.user = decoded;
        next();
    });
};

// Admin Endpoints

// List all users
app.get('/api/users', verifyAdmin, (req, res) => {
    db.users.find({}, (err, users) => {
        if (err) return res.status(500).json({ error: 'Erro ao buscar usuários.' });
        // Sanitize passwords
        const safeUsers = users.map(u => ({ id: u._id, name: u.name, email: u.email, role: u.role || 'student', avatar: u.avatar }));
        res.json(safeUsers);
    });
});

// Endpoint para upload de imagem
app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }
    const protocol = req.protocol;
    const host = req.get('host');
    const imageUrl = `${protocol}://${host}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

// Endpoint para atualizar perfil (com autenticação)
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

app.patch('/api/users/me', verifyToken, (req, res) => {
    const userId = req.user.id;
    const updates = req.body;

    // Apenas permitir atualização de campos seguros
    const allowedUpdates = ['name', 'avatar'];
    const safeUpdates = {};

    Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
            safeUpdates[key] = updates[key];
        }
    });

    db.users.findOne({ _id: userId }, (err, user) => {
        if (err || !user) return res.status(404).json({ error: 'Usuário não encontrado.' });

        const updatedUser = { ...user, ...safeUpdates };

        db.users.remove({ _id: userId }, (err) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar.' });

            db.users.insert(updatedUser, (err, newDoc) => {
                if (err) return res.status(500).json({ error: 'Erro ao salvar atualização.' });

                // Gerar novo token com dados atualizados (opcional, mas bom pra manter o frontend sync)
                const newToken = jwt.sign({ id: newDoc._id, role: newDoc.role || 'student' }, SECRET_KEY, { expiresIn: 86400 });

                res.json({
                    message: 'Perfil atualizado com sucesso.',
                    user: { id: newDoc._id, name: newDoc.name, email: newDoc.email, role: newDoc.role, avatar: newDoc.avatar },
                    token: newToken
                });
            });
        });
    });
});

// Delete Account Endpoint
app.delete('/api/users/me', (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });

        const userId = decoded.id;

        db.users.remove({ _id: userId }, (err, numRemoved) => {
            if (err) return res.status(500).json({ error: 'Erro ao excluir conta.' });
            // For Google users or just redundant checks, sometimes numRemoved might be 0 if ID is odd,
            // but usually it works. If not, we might need to debug.
            // But let's assume it works now that route is reachable.
            if (!numRemoved) return res.status(404).json({ error: 'Usuário não encontrado.' });

            res.status(200).json({ message: 'Conta excluída com sucesso.' });
        });
    });
});

// Delete user by ID (Admin)
app.delete('/api/users/:id', verifyAdmin, (req, res) => {
    const userId = req.params.id;
    db.users.remove({ _id: userId }, (err, numRemoved) => {
        if (err) return res.status(500).json({ error: 'Erro ao excluir usuário.' });
        if (!numRemoved) return res.status(404).json({ error: 'Usuário não encontrado.' });
        res.json({ message: 'Usuário excluído com sucesso.' });
    });
});

// Update user role (Admin)
// Update user role (Admin)
app.patch('/api/users/:id/role', verifyAdmin, (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;
    const PROTECTED_EMAIL = "octavio.marvel2018@gmail.com";

    if (!['admin', 'student'].includes(role)) {
        return res.status(400).json({ error: 'Função inválida.' });
    }

    db.users.findOne({ _id: userId }, (err, targetUser) => {
        if (err || !targetUser) return res.status(404).json({ error: 'Usuário não encontrado.' });

        if (targetUser.email === PROTECTED_EMAIL) {
            return res.status(403).json({ error: 'Não é permitido alterar o nível deste usuário mestre.' });
        }

        db.users.update({ _id: userId }, { $set: { role } }, {}, (err, numReplaced) => {
            if (err) return res.status(500).json({ error: 'Erro ao atualizar função.' });
            res.json({ message: `Função atualizada para ${role}.` });
        });
    });
});



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
