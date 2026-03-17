import express from 'express';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/upload', (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            console.error("Upload Middleware Error:", err);
            return res.status(500).json({ error: 'Erro no upload: ' + err.message });
        }
        if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado.' });

        let imageUrl = req.file.path;
        if (!imageUrl || !imageUrl.startsWith('http')) {
            const baseUrl = process.env.VITE_API_URL ? process.env.VITE_API_URL.replace('/api', '') : 'http://localhost:3000';
            imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
        }
        res.json({ url: imageUrl });
    });
});

export default router;
