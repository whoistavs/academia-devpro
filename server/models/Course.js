import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    // Flexible title to support both string (legacy) and object (i18n)
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, required: true },
    level: { type: mongoose.Schema.Types.Mixed, required: true }, // 'Iniciante' or { pt: '...', en: '...' }
    image: { type: String },
    duration: { type: String },
    price: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true },

    // Flexible modules to prevent seeding crashes
    modulos: [{ type: mongoose.Schema.Types.Mixed }],

    // Legacy flat lessons support if needed, or strictly modules
    aulas: [{ type: mongoose.Schema.Types.Mixed }],

    quiz: [{ type: mongoose.Schema.Types.Mixed }], // Array of questions

    authorId: { type: String }, // Can be ObjectId if we link strictly, but String covers "legacy" IDs too
    status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'pending' },

    createdAt: { type: Date, default: Date.now },
    language: { type: String, default: 'pt', index: true }
});

export default mongoose.model('Course', courseSchema);
