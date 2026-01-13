import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    
    title: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: mongoose.Schema.Types.Mixed, required: true },
    category: { type: String, required: true },
    level: { type: mongoose.Schema.Types.Mixed, required: true }, 
    image: { type: String },
    duration: { type: String },
    price: { type: Number, default: 0 },
    slug: { type: String, required: true, unique: true },

    
    modulos: [{ type: mongoose.Schema.Types.Mixed }],

    
    aulas: [{ type: mongoose.Schema.Types.Mixed }],

    quiz: [{ type: mongoose.Schema.Types.Mixed }], 

    authorId: { type: String }, 
    status: { type: String, enum: ['draft', 'pending', 'published', 'rejected'], default: 'pending' },

    createdAt: { type: Date, default: Date.now },
    language: { type: String, default: 'pt', index: true }
});

export default mongoose.model('Course', courseSchema);
