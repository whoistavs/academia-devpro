import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String }, 
    fileUrl: { type: String },
    fileType: { type: String }, 
    fileName: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ChatMessage', chatMessageSchema);
