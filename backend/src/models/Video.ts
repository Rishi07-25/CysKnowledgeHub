import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const videoSchema = new mongoose.Schema({
    video_id: { type: String, required: true },
    category: { type: String, required: true, enum: ['Tutorial', 'Reel'] },
    tag: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    author: { type: String, required: true },
    author_id: { type: String, required: true },
    date: { type: String, required: true },
    base_upvotes: { type: Number, default: 0 },
    status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending' },
    comments: [commentSchema],
    
    // --- NEW: Optional Series Tracking ---
    series: { type: String, required: false },
    seriesOrder: { type: Number, required: false }
});

export default mongoose.model('Video', videoSchema);