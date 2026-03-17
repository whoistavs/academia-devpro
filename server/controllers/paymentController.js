import Track from '../models/Track.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Coupon from '../models/Coupon.js';
import Transaction from '../models/Transaction.js';
import { Pix } from '../utils/pix.js';

export const checkout = async (req, res) => {
    const { courseId, trackId, couponCode } = req.body;
    try {
        let title, price;

        if (trackId) {
            const track = await Track.findOne({ id: trackId });
            if (!track) return res.status(404).json({ error: 'Trilha não encontrada' });

            title = `Trilha: ${track.title}`;
            price = track.bundlePrice || track.price;
        } else {
            const course = await Course.findById(courseId);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            title = typeof course.title === 'string' ? course.title : (course.title.pt || 'Curso');
            price = Number(course.price);
        }

        const admin = await User.findOne({ role: 'admin' });
        if (!admin || !admin.bankAccount || !admin.bankAccount.pixKey) {
            return res.status(400).json({ error: 'Chave Pix do sistema não configurada.' });
        }

        const pixKey = admin.bankAccount.pixKey;
        const name = admin.name.substring(0, 20);
        const city = 'SaoPaulo';

        let amount = Number(price);
        let discount = 0;

        if (couponCode) {
            const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
            if (!coupon) return res.status(400).json({ error: 'Cupom inválido.' });

            const now = new Date();
            if (coupon.validUntil && now > new Date(coupon.validUntil)) return res.status(400).json({ error: 'Cupom expirado.' });
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Cupom esgotado.' });

            discount = (amount * coupon.discountPercentage) / 100;
            amount = amount - discount;
            if (amount < 0) amount = 0;
        }

        const txId = `CRS${Date.now().toString().slice(-10)}`;
        const pix = new Pix(pixKey, name, city, amount, txId);
        
        res.json({
            mode: 'pix_direct',
            payload: pix.getPayload(),
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
};

export const confirmManualPayment = async (req, res) => {
    const { courseId, trackId, txId, couponCode } = req.body;
    try {
        let price = 0;
        let sellerId = null;

        if (trackId) {
            const track = await Track.findOne({ id: trackId });
            if (!track) return res.status(404).json({ error: 'Trilha não encontrada' });
            price = track.bundlePrice || track.price;
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
                const userUses = coupon.usedBy.filter(id => id === req.user.id).length;
                const isUserExhausted = coupon.maxUsesPerUser && userUses >= coupon.maxUsesPerUser;

                if (!isExpired && !isExhausted && !isUserExhausted) {
                    discount = (price * coupon.discountPercentage) / 100;
                    price = price - discount;
                    finalCode = coupon.code;
                    coupon.usedCount += 1;
                    coupon.usedBy.push(req.user.id);
                    await coupon.save();
                }
            }
        }

        await Transaction.create({
            courseId, trackId,
            buyerId: req.user.id,
            sellerId,
            amount: price,
            platformFee: 0,
            sellerNet: 0,
            mpPaymentId: `PIX-MANUAL-${txId}`,
            status: 'pending_approval',
            couponCode: finalCode,
            discountAmount: discount
        });

        res.json({ status: 'pending', message: 'Pagamento enviado para análise.' });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Manual confirm failed' });
    }
};

export const validateCoupon = async (req, res) => {
    try {
        const { code, userId } = req.body;
        if (!code) return res.status(400).json({ error: 'Código obrigatório.' });

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (!coupon) return res.status(404).json({ error: 'Cupom inválido.' });

        if (coupon.validUntil && new Date() > new Date(coupon.validUntil)) return res.status(400).json({ error: 'Cupom expirado.' });
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Cupom esgotado.' });

        if (userId && coupon.maxUsesPerUser) {
            const userUses = coupon.usedBy.filter(id => id === userId).length;
            if (userUses >= coupon.maxUsesPerUser) return res.status(400).json({ error: 'Limite de uso por usuário atingido.' });
        }

        res.json({ valid: true, discountPercentage: coupon.discountPercentage, code: coupon.code });
    } catch (e) {
        res.status(500).json({ error: 'Erro ao validar cupom.' });
    }
};
