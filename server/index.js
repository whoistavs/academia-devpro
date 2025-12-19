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

        const newUser = {
            name,
            email,
            password: hashedPassword,
            createdAt: new Date()
        };

        db.users.insert(newUser, (err, newDoc) => {
            if (err) {
                console.error('DB Make Error:', err);
                return res.status(500).json({ error: 'Erro ao criar usuário.' });
            }
            res.status(201).json({ message: 'Usuário criado com sucesso!' });
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
