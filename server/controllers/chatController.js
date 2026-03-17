import ChatMessage from '../models/ChatMessage.js';

export const getMessages = async (req, res) => {
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
};

export const sendMessage = async (req, res) => {
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
};
