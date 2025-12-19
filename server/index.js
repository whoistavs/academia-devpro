const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./simpleDb');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_KEY = "chave_secreta_super_segura"; // Em produção, usar .env

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
            const protocol = req.protocol;
            const host = req.get('host');
            const validationLink = `${protocol}://${host}/api/verify-email?token=${verificationToken}`;

            console.log("\n==================================================");
            console.log(`[MOCK EMAIL] Para: ${email}`);
            console.log(`[MOCK EMAIL] Assunto: Verifique sua conta`);
            console.log(`[MOCK EMAIL] Link: ${validationLink}`);
            console.log("==================================================\n");

            res.status(201).json({ message: 'Cadastro realizado! Verifique seu console (ou email simulado) para ativar a conta.' });
        });
    });
});

// Verify Email Endpoint
app.get('/api/verify-email', (req, res) => {
    const { token } = req.query;
    if (!token) return res.status(400).send("Token inválido.");

    db.users.findOne({ verificationToken: token }, (err, user) => {
        if (err || !user) return res.status(400).send("Link inválido ou expirado.");

        db.users.update({ _id: user._id }, { $set: { isVerified: true, verificationToken: null } }, {}, (err) => {
            if (err) return res.status(500).send("Erro ao ativar conta.");

            // Redirect to frontend Login
            // We need to know where the frontend is. Assuming common setups or using Referer if possible, 
            // but for separated frontend/backend, we usually set a FRONTEND_URL env.
            // For now, I'll redirect to a generic success page or try to guess.
            // Since User uses Vercel/Netlify, hard to guess. 
            // I will return a HTML page with a link to login if I can't redirect automatically, 
            // OR I will send a simple "Verified!" message.
            // Better: Redirect to the REFERER's origin if available, or just send a HTML success.

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
            if (!numRemoved) return res.status(404).json({ error: 'Usuário não encontrado.' });

            res.status(200).json({ message: 'Conta excluída com sucesso.' });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
