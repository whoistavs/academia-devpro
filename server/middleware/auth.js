import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || "chave_secreta_super_segura";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Token não fornecido.' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(403).json({ error: 'Token inválido.' });
        req.user = decoded;
        next();
    });
};

export const verifyAdmin = (req, res, next) => {
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
