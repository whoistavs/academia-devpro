
const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    courseSlug: { type: String, required: true },
    lessonIndex: { type: Number, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String },
    userAvatar: { type: String },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Comment', commentSchema);
