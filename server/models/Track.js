import mongoose from 'mongoose';

const trackSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // slug-like ID (e.g. 'fullstack-master')
    title: { type: String, required: true },
    description: { type: String },
    icon: { type: String }, // Store SVG string or URL
    gradient: { type: String }, // Tailwind classes e.g. "from-indigo-500 to-purple-600"
    modules: [{
        type: String, // Storing Course IDs directly as strings for now, or could be refs
        ref: 'Course'
    }],
    price: { type: Number, default: 0 }, // Individual sum (optional/calculated)
    bundlePrice: { type: Number, required: true },
    duration: { type: String },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Track', trackSchema);
