// server/controllers/adminController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import Payout from '../models/Payout.js';
import Coupon from '../models/Coupon.js';
import Course from '../models/Course.js';
import { tracks } from '../tracks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getFinancials = async (req, res) => {
    try {
        const transactions = await Transaction.find({ status: 'approved' });

        const totalSales = transactions.reduce((acc, t) => acc + (t.amount || 0), 0);
        const totalFees = transactions.reduce((acc, t) => acc + (t.platformFee || 0), 0);
        const totalPayouts = transactions.reduce((acc, t) => acc + (t.sellerNet || 0), 0);
        
        // availableBalance for admin is totalFees
        const availableBalance = totalFees;

        const recentSales = await Transaction.find()
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            summary: {
                totalSales,
                totalFees,
                availableBalance,
                totalPayouts
            },
            recentSales
        });
    } catch (e) {
        console.error("Financials Error:", e);
        res.status(500).json({ error: 'Failed fetch financials' });
    }
}

export const getDebts = async (req, res) => {
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
}

export const registerManualPayout = async (req, res) => {
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
}

export const getApprovals = async (req, res) => {
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
}

export const approveTransaction = async (req, res) => {
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
                const usersPath = path.join(__dirname, '../users.json');
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
}

export const rejectTransaction = async (req, res) => {
    try {
        const tx = await Transaction.findById(req.params.id);
        if (!tx) return res.status(404).json({ error: 'Transação não encontrada.' });

        tx.status = 'rejected';
        await tx.save();

        res.json({ message: 'Transação rejeitada.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao rejeitar.' });
    }
}

export const getCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find().sort({ createdAt: -1 });
        res.json(coupons);
    } catch (e) {
        res.status(500).json({ error: 'Erro ao buscar cupons.' });
    }
}

export const createCoupon = async (req, res) => {
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
}

export const deleteCoupon = async (req, res) => {
    try {
        await Coupon.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cupom removido.' });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao remover cupom.' });
    }
}

export const updateCoupon = async (req, res) => {
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
}

export const getUsers = async (req, res) => {
    console.log("[API] GET /api/users called");
    try {
        const users = await User.find({}, '-password'); // Exclude password
        res.json(users);
    } catch (e) {
        res.status(500).json({ error: 'Erro.' });
    }
}

export const deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (deletedUser) {
            // Also remove from users.json to prevent reappearance on restart
            const usersPath = path.join(__dirname, '../users.json');
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
}

export const updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });

        if (!updatedUser) return res.status(404).json({ error: 'Usuário não encontrado.' });

        res.json({ message: 'Role updated', user: updatedUser });
    } catch (e) {
        console.error("Error updating role:", e);
        res.status(500).json({ error: e.message || 'Erro ao atualizar função.' });
    }
}

