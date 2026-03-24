import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, MonitorPlay, Zap, Folder, ThumbsUp, X, Bookmark, Filter, Share2, Check, Sparkles, Loader2, MessageSquare, Send, History, ListVideo, ChevronRight, ChevronLeft } from 'lucide-react';

export default function VideoHub() {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState<'videos' | 'reels' | 'vault' | 'history'>('videos');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentSort, setCurrentSort] = useState('newest');
    const [selectedVideo, setSelectedVideo] = useState<any>(null);
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // Form State
    const [subUrl, setSubUrl] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [subTag, setSubTag] = useState('Network Security');
    const [subDesc, setSubDesc] = useState('');
    
    // --- NEW: Series Form State ---
    const [subSeries, setSubSeries] = useState('');
    const [subSeriesOrder, setSubSeriesOrder] = useState<number | ''>('');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingMeta, setIsFetchingMeta] = useState(false);

    // Comment State
    const [newComment, setNewComment] = useState('');
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);

    const [dbVideos, setDbVideos] = useState<any[]>([]);
    const [myVaultIds, setMyVaultIds] = useState<string[]>([]);
    const [myUpvotedIds, setMyUpvotedIds] = useState<string[]>([]);
    const [myHistoryIds, setMyHistoryIds] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/videos')
            .then(res => res.json())
            .then(data => { 
                if(Array.isArray(data)) {
                    setDbVideos(data);
                    const params = new URLSearchParams(window.location.search);
                    const videoIdParam = params.get('v');
                    if (videoIdParam) {
                        const videoToOpen = data.find(v => v.video_id === videoIdParam);
                        if (videoToOpen) setSelectedVideo(videoToOpen);
                    }
                }
            })
            .catch(err => console.error("Error fetching videos:", err));

        setMyVaultIds(JSON.parse(localStorage.getItem('cyberShield_vault') || '[]'));
        setMyUpvotedIds(JSON.parse(localStorage.getItem('cyberShield_upvotes') || '[]'));
        setMyHistoryIds(JSON.parse(localStorage.getItem('cyberShield_history') || '[]'));
    }, []);

    const handleOpenVideo = (video: any) => {
        setSelectedVideo(video);
        window.history.pushState(null, '', `?v=${video.video_id}`);

        setMyHistoryIds(prev => {
            const filtered = prev.filter(id => id !== video.video_id);
            const updated = [video.video_id, ...filtered].slice(0, 20);
            localStorage.setItem('cyberShield_history', JSON.stringify(updated));
            return updated;
        });
    };

    const handleCloseVideo = () => {
        setSelectedVideo(null);
        setCopied(false);
        setNewComment('');
        window.history.pushState(null, '', window.location.pathname);
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFetchMeta = async () => {
        if (!subUrl) return alert("Please paste a URL first!");
        
        setIsFetchingMeta(true);
        try {
            let videoId = null;
            if (subUrl.includes('/shorts/')) {
                videoId = subUrl.split('/shorts/')[1].substring(0, 11);
            } else {
                const match = subUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                videoId = (match && match[2].length === 11) ? match[2] : null;
            }

            if (!videoId) throw new Error("Invalid URL");

            const res = await fetch(`http://localhost:5000/api/videos/meta/${videoId}`);
            if (res.ok) {
                const data = await res.json();
                setSubTitle(data.title);
                if (!subDesc) setSubDesc(`Video by ${data.author}`);
            } else {
                alert("Could not fetch video data. Is it private?");
            }
        } catch (err) {
            alert("Invalid YouTube URL format.");
        } finally {
            setIsFetchingMeta(false);
        }
    };

    const handleVideoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Please sign in first.");
        
        setIsSubmitting(true);
        let videoId = null;
        let isShort = false;

        if (subUrl.includes('/shorts/')) {
            isShort = true;
            videoId = subUrl.split('/shorts/')[1].substring(0, 11);
        } else {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = subUrl.match(regExp);
            videoId = (match && match[2].length === 11) ? match[2] : null;
        }

        if (!videoId || videoId.length !== 11) {
            setIsSubmitting(false);
            return alert("Invalid YouTube URL.");
        }

        const newVideo: any = {
            video_id: videoId,
            category: isShort ? "Reel" : "Tutorial", 
            tag: subTag,
            title: subTitle,
            description: subDesc,
            author: user.displayName || user.email?.split('@')[0] || 'Student',
            author_id: user.uid,
            date: new Date().toISOString()
        };

        // Attach series logic if provided
        if (subSeries.trim()) {
            newVideo.series = subSeries.trim();
            newVideo.seriesOrder = subSeriesOrder === '' ? 1 : Number(subSeriesOrder);
        }

        try {
            const response = await fetch('http://localhost:5000/api/videos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newVideo)
            });

            if (response.ok) {
                const savedVideo = await response.json();
                setDbVideos([savedVideo, ...dbVideos]);
                setIsSubmitModalOpen(false);
                setSubUrl(''); setSubTitle(''); setSubDesc(''); setSubSeries(''); setSubSeriesOrder('');
            }
        } catch (error) {
            alert("Server connection error.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Please sign in to join the discussion.");
        if (!newComment.trim()) return;

        setIsSubmittingComment(true);
        try {
            const response = await fetch(`http://localhost:5000/api/videos/${selectedVideo.video_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.uid,
                    userName: user.displayName || user.email?.split('@')[0] || 'Student',
                    text: newComment
                })
            });

            if (response.ok) {
                const updatedVideo = await response.json();
                setSelectedVideo(updatedVideo); 
                setDbVideos(dbVideos.map(v => v.video_id === updatedVideo.video_id ? updatedVideo : v)); 
                setNewComment(''); 
            } else {
                alert("Failed to post comment.");
            }
        } catch (error) {
            console.error("Error posting comment:", error);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const toggleVault = (id: string) => {
        const updated = myVaultIds.includes(id) ? myVaultIds.filter(v => v !== id) : [...myVaultIds, id];
        setMyVaultIds(updated);
        localStorage.setItem('cyberShield_vault', JSON.stringify(updated));
    };

    const handleUpvote = async (videoId: string) => {
        if (!user) return alert("Please sign in to upvote.");
        const hasUpvoted = myUpvotedIds.includes(videoId);
        const updatedUpvotes = hasUpvoted ? myUpvotedIds.filter(id => id !== videoId) : [...myUpvotedIds, videoId];
        setMyUpvotedIds(updatedUpvotes);
        localStorage.setItem('cyberShield_upvotes', JSON.stringify(updatedUpvotes));

        try {
            await fetch(`http://localhost:5000/api/videos/${videoId}/upvote`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.uid, action: hasUpvoted ? 'remove' : 'add' })
            });
        } catch (error) {
            console.error("Failed to sync upvote", error);
        }
    };

    const getTotalUpvotes = (video: any) => {
        return myUpvotedIds.includes(video.video_id) ? (video.base_upvotes || 0) + 1 : (video.base_upvotes || 0);
    };

    const filteredVideos = dbVideos.filter(video => {
        if (video.status === 'pending') return false; 
        if (currentView === 'vault' && !myVaultIds.includes(video.video_id)) return false;
        if (currentView === 'history' && !myHistoryIds.includes(video.video_id)) return false;
        if (currentView === 'videos' && video.category !== 'Tutorial') return false;
        if (currentView === 'reels' && video.category !== 'Reel') return false;
        if (searchQuery && !`${video.title} ${video.tag} ${video.author} ${video.series || ''}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    }).sort((a, b) => {
        if (currentView === 'history') return myHistoryIds.indexOf(a.video_id) - myHistoryIds.indexOf(b.video_id);
        if (currentSort === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
        return getTotalUpvotes(b) - getTotalUpvotes(a);
    });

    // --- NEW: Calculate Series Navigation logic if a video is open ---
    let seriesVideos: any[] = [];
    let prevInSeries = null;
    let nextInSeries = null;

    if (selectedVideo?.series) {
        seriesVideos = dbVideos
            .filter(v => v.series === selectedVideo.series && v.status !== 'pending')
            .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
        
        const currentIndex = seriesVideos.findIndex(v => v.video_id === selectedVideo.video_id);
        if (currentIndex > 0) prevInSeries = seriesVideos[currentIndex - 1];
        if (currentIndex < seriesVideos.length - 1) nextInSeries = seriesVideos[currentIndex + 1];
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6 text-white min-h-[80vh]">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6 border-b border-gray-800 pb-4">
                
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${currentView === 'videos' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`} onClick={() => setCurrentView('videos')}><MonitorPlay className="w-4 h-4" /> Videos</button>
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${currentView === 'reels' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`} onClick={() => setCurrentView('reels')}><Zap className="w-4 h-4" /> Shorts</button>
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${currentView === 'vault' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`} onClick={() => setCurrentView('vault')}><Folder className="w-4 h-4" /> Vault</button>
                    <button className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-colors border-b-2 ${currentView === 'history' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-500 hover:text-gray-300'}`} onClick={() => setCurrentView('history')}><History className="w-4 h-4" /> History</button>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-200 focus:border-cyan-500 focus:outline-none placeholder-gray-500" placeholder="Search videos or series..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                        <select className="bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-8 py-2 text-sm text-gray-200 focus:border-cyan-500 focus:outline-none appearance-none cursor-pointer" value={currentSort} onChange={(e) => setCurrentSort(e.target.value)}>
                            <option value="newest">Newest</option>
                            <option value="top">Top Rated</option>
                        </select>
                    </div>

                    <button className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors" onClick={() => user ? setIsSubmitModalOpen(true) : alert("Please sign in to submit a video.")}>
                        <Plus className="w-4 h-4" /> Submit Video
                    </button>
                </div>
            </div>

            {filteredVideos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                    {currentView === 'history' ? (
                        <><History className="w-12 h-12 mb-4 opacity-20" /><p className="text-lg font-medium text-gray-400">Your watch history is empty.</p></>
                    ) : (
                        <><MonitorPlay className="w-12 h-12 mb-4 opacity-20" /><p className="text-lg font-medium text-gray-400">No videos found.</p></>
                    )}
                </div>
            ) : (
                <div className={`grid gap-6 mb-16 ${currentView === 'reels' ? 'grid-cols-[repeat(auto-fill,minmax(220px,1fr))]' : 'grid-cols-[repeat(auto-fill,minmax(320px,1fr))]'}`}>
                    {filteredVideos.map((video, idx) => (
                        <div className="group bg-gray-900/60 border border-gray-800 hover:border-gray-700 rounded-xl overflow-hidden cursor-pointer transition-all hover:-translate-y-1" key={idx} onClick={() => handleOpenVideo(video)}>
                            <div className={`relative overflow-hidden bg-black border-b border-gray-800 ${currentView === 'reels' ? 'aspect-[9/16]' : 'aspect-video'}`}>
                                <img src={`https://img.youtube.com/vi/${video.video_id}/maxresdefault.jpg`} alt="thumbnail" className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-300" />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div className="bg-cyan-500/20 p-3 rounded-full backdrop-blur-sm border border-cyan-500/50">
                                        <MonitorPlay className="w-6 h-6 text-cyan-400" />
                                    </div>
                                </div>
                                {/* --- NEW: Series Badge on Thumbnail --- */}
                                {video.series && (
                                    <div className="absolute top-2 left-2 bg-black/80 backdrop-blur border border-gray-700 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1.5">
                                        <ListVideo className="w-3 h-3 text-cyan-400" />
                                        Part {video.seriesOrder}
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] uppercase tracking-wider text-cyan-400 font-bold bg-cyan-900/30 px-2 py-0.5 rounded border border-cyan-800/50">{video.tag}</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1"><ThumbsUp className="w-3 h-3" />{getTotalUpvotes(video)}</span>
                                </div>
                                <h3 className="text-base font-bold mb-1 text-gray-100 line-clamp-2 leading-tight">{video.title}</h3>
                                <p className="text-xs text-gray-500">{video.author}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedVideo && (
                <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) handleCloseVideo(); }}>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-4xl overflow-hidden shadow-2xl my-8">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-800">
                            <h2 className="text-lg font-bold text-gray-200 truncate pr-4">{selectedVideo.title}</h2>
                            <button className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors" onClick={handleCloseVideo}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video bg-black">
                            <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo.video_id}?autoplay=1`} allowFullScreen></iframe>
                        </div>
                        
                        {/* --- NEW: The Series Navigation Strip --- */}
                        {selectedVideo.series && (
                            <div className="bg-gray-900 border-b border-gray-800 px-5 py-3 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <span className="flex items-center gap-1.5 text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-0.5">
                                        <ListVideo className="w-3 h-3" /> Learning Series
                                    </span>
                                    <h4 className="text-sm font-bold text-gray-200">{selectedVideo.series} <span className="text-gray-500 font-normal ml-1">(Part {selectedVideo.seriesOrder})</span></h4>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => prevInSeries && handleOpenVideo(prevInSeries)}
                                        disabled={!prevInSeries}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Previous
                                    </button>
                                    <button 
                                        onClick={() => nextInSeries && handleOpenVideo(nextInSeries)}
                                        disabled={!nextInSeries}
                                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-800 border border-gray-700 hover:bg-gray-700 disabled:opacity-30 transition-colors"
                                    >
                                        Next <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="p-5">
                            <p className="text-sm text-gray-400 mb-6 leading-relaxed">{selectedVideo.description}</p>
                            
                            <div className="flex flex-wrap gap-3 mb-8">
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${myUpvotedIds.includes(selectedVideo.video_id) ? 'bg-cyan-900/30 border-cyan-500/50 text-cyan-400' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'}`} onClick={() => handleUpvote(selectedVideo.video_id)}>
                                    <ThumbsUp className={`w-4 h-4 ${myUpvotedIds.includes(selectedVideo.video_id) ? 'fill-current' : ''}`} /> {myUpvotedIds.includes(selectedVideo.video_id) ? 'Upvoted' : 'Upvote'} ({getTotalUpvotes(selectedVideo)})
                                </button>
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${myVaultIds.includes(selectedVideo.video_id) ? 'bg-purple-900/30 border-purple-500/50 text-purple-400' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'}`} onClick={() => toggleVault(selectedVideo.video_id)}>
                                    <Bookmark className={`w-4 h-4 ${myVaultIds.includes(selectedVideo.video_id) ? 'fill-current' : ''}`} /> {myVaultIds.includes(selectedVideo.video_id) ? 'Saved' : 'Save to Vault'}
                                </button>
                                <div className="flex-1"></div>
                                <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${copied ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800'}`} onClick={handleCopyLink}>
                                    {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />} {copied ? 'Link Copied!' : 'Copy Link'}
                                </button>
                            </div>

                            {/* Discussion Thread */}
                            <div className="border-t border-gray-800 pt-6">
                                <h3 className="text-sm font-bold text-gray-200 mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4 text-cyan-500" /> Discussion ({selectedVideo.comments?.length || 0})
                                </h3>
                                <form onSubmit={handleCommentSubmit} className="flex gap-3 mb-6">
                                    <input type="text" placeholder={user ? "Ask a question or share a thought..." : "Sign in to join the discussion..."} disabled={!user || isSubmittingComment} value={newComment} onChange={e => setNewComment(e.target.value)} className="flex-1 bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-200 focus:outline-none focus:border-cyan-500 disabled:opacity-50" />
                                    <button type="submit" disabled={!user || !newComment.trim() || isSubmittingComment} className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 text-sm font-medium">
                                        {isSubmittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Post
                                    </button>
                                </form>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                    {(!selectedVideo.comments || selectedVideo.comments.length === 0) ? (
                                        <div className="text-center py-6 text-gray-500 text-sm italic">No comments yet. Be the first to start the discussion!</div>
                                    ) : (
                                        [...selectedVideo.comments].reverse().map((comment: any, i: number) => (
                                            <div key={i} className="bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-xs font-bold text-cyan-400">{comment.userName}</span>
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{new Date(comment.date).toLocaleDateString()}</span>
                                                </div>
                                                <p className="text-sm text-gray-300 leading-relaxed">{comment.text}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Submit Modal */}
            {isSubmitModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex justify-center items-center p-4 backdrop-blur-sm overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget && !isSubmitting) setIsSubmitModalOpen(false); }}>
                    <div className="bg-gray-950 border border-gray-800 rounded-xl w-full max-w-lg p-6 shadow-2xl my-8">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
                                <MonitorPlay className="w-5 h-5 text-cyan-500" /> Submit Video
                            </h2>
                            <button className="text-gray-400 hover:text-white" onClick={() => setIsSubmitModalOpen(false)} disabled={isSubmitting}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleVideoSubmit} className="flex flex-col gap-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">YouTube URL</label>
                                <div className="flex gap-2">
                                    <input type="url" required placeholder="https://youtube.com/watch?v=..." className="flex-1 p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200" value={subUrl} onChange={e => setSubUrl(e.target.value)} disabled={isSubmitting || isFetchingMeta} />
                                    <button type="button" onClick={handleFetchMeta} disabled={!subUrl || isFetchingMeta} className="flex items-center gap-1.5 px-3 py-2 bg-purple-900/30 text-purple-400 border border-purple-500/50 rounded-lg hover:bg-purple-900/50 transition-colors disabled:opacity-50 text-sm font-semibold">
                                        {isFetchingMeta ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Auto-Fill
                                    </button>
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Video Title</label>
                                <input type="text" required placeholder="Enter a clear, descriptive title..." className="w-full p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200" value={subTitle} onChange={e => setSubTitle(e.target.value)} disabled={isSubmitting} />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Topic / Category</label>
                                <select className="w-full p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200" value={subTag} onChange={e => setSubTag(e.target.value)} disabled={isSubmitting}>
                                    <option value="Network Security">Network Security</option>
                                    <option value="Web App Security">Web App Security</option>
                                    <option value="Cryptography">Cryptography</option>
                                    <option value="Reverse Engineering">Reverse Engineering</option>
                                    <option value="Forensics">Forensics</option>
                                    <option value="General IT">General IT/Networking</option>
                                </select>
                            </div>

                            {/* --- NEW: Series Inputs --- */}
                            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Optional: Add to Series</label>
                                <div className="flex gap-2">
                                    <input type="text" placeholder="Series Name (e.g. Linux Basics)" className="flex-2 w-full p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200" value={subSeries} onChange={e => setSubSeries(e.target.value)} disabled={isSubmitting} />
                                    <input type="number" min="1" placeholder="Part #" className="flex-1 w-24 p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200" value={subSeriesOrder} onChange={e => setSubSeriesOrder(e.target.value === '' ? '' : Number(e.target.value))} disabled={isSubmitting} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
                                <textarea required rows={3} placeholder="What will viewers learn from this video?" className="w-full p-2.5 rounded-lg bg-gray-900 border border-gray-800 focus:border-cyan-500 focus:outline-none text-sm text-gray-200 resize-none" value={subDesc} onChange={e => setSubDesc(e.target.value)} disabled={isSubmitting}></textarea>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium" onClick={() => setIsSubmitModalOpen(false)} disabled={isSubmitting}>Cancel</button>
                                <button type="submit" className="flex-1 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white transition-colors text-sm font-medium disabled:opacity-50" disabled={isSubmitting}>
                                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}