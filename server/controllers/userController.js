import User from '../models/User.js';

export const getPublicProfile = async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username, isPublic: true }).select('-password -email -cpf -rg -bankAccount -resetPasswordToken -resetPasswordExpires -verificationToken');
        
        if (!user) {
            return res.status(404).json({ error: 'Perfil não encontrado ou privado.' });
        }

        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar perfil: ' + e.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { bio, socialLinks, isPublic, username, avatar } = req.body;

        const updateData = { bio, socialLinks, isPublic, avatar };
        
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: userId } });
            if (existingUser) {
                return res.status(400).json({ error: 'Nome de usuário já em uso.' });
            }
            updateData.username = username;
        }

        const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
        res.json(user);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao atualizar perfil: ' + e.message });
    }
};
