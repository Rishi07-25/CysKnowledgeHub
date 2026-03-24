import express from 'express';
import Video from '../models/Video';

const router = express.Router();

// Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().sort({ date: -1 });
        res.json(videos);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

// Submit a new video
router.post('/', async (req, res) => {
    try {
        const newVideo = new Video({ ...req.body, status: 'pending' });
        const savedVideo = await newVideo.save();
        res.status(201).json(savedVideo);
    } catch (err) {
        res.status(400).json({ message: 'Error submitting video' });
    }
});

// Admin: Update status
router.patch('/:id/status', async (req, res) => {
    try {
        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id, 
            { status: req.body.status }, 
            { new: true }
        );
        res.json(updatedVideo);
    } catch (err) {
        res.status(500).json({ message: 'Error updating status' });
    }
});

// User: Handle Upvotes
router.patch('/:id/upvote', async (req, res) => {
    try {
        const { action } = req.body; // 'add' or 'remove'
        const increment = action === 'add' ? 1 : -1;
        const updatedVideo = await Video.findByIdAndUpdate(
            req.params.id,
            { $inc: { base_upvotes: increment } },
            { new: true }
        );
        res.json(updatedVideo);
    } catch (err) {
        res.status(500).json({ message: 'Error syncing upvote' });
    }
});
// Auto-Fetch YouTube Metadata (No API Key Required!)
router.get('/meta/:videoId', async (req, res) => {
    try {
        // We use YouTube's public oEmbed endpoint
        const response = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${req.params.videoId}&format=json`);
        
        if (!response.ok) throw new Error('YouTube API error');
        
        // Tell TypeScript exactly what shape this data will have!
        const data = await response.json() as { title: string; author_name: string };
        
        res.json({ 
            title: data.title, 
            author: data.author_name 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching metadata' });
    }
});

// Post a new comment
router.post('/:id/comments', async (req, res) => {
    try {
        const { userId, userName, text } = req.body;
        
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const updatedVideo = await Video.findOneAndUpdate(
            { video_id: req.params.id }, // Find by the YouTube ID
            { 
                $push: { 
                    comments: { userId, userName, text, date: new Date() } 
                } 
            },
            { new: true }
        );

        if (!updatedVideo) return res.status(404).json({ message: 'Video not found' });
        
        res.status(201).json(updatedVideo);
    } catch (err) {
        res.status(500).json({ message: 'Error posting comment' });
    }
});
export default router;