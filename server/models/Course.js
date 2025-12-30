import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    // Flexible title to support both string (legacy) and object (i18n)
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, required: true },
    level: { type: mongoose.Schema.Types.Mixed, required: true }, // 'Iniciante' or { pt: '...', en: '...' }
    image: { type: String },
    duration: { type: String },
    slug: { type: String, required: true, unique: true },

    // Structure for modules and lessons
    modulos: [{
        id: Number,
        title: String,
        aulas: [{
            id: Number,
            title: String,
            videoUrl: String
        }]
    }],

    // Legacy flat lessons support if needed, or strictly modules
    aulas: [{ type: mongoose.Schema.Types.Mixed }],

    quiz: [{ type: mongoose.Schema.Types.Mixed }], // Array of questions

    authorId: { type: String }, // Can be ObjectId if we link strictly, but String covers "legacy" IDs too
    status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'pending' },

    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Course', courseSchema);
