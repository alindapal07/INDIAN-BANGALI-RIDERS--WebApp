import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, X, LayoutGrid, Clapperboard, Smartphone,
  MapPin, Folder, ChevronLeft, Send, User as UserIcon, Share2,
  Instagram, Twitter, Facebook, Link as LinkIcon, Bookmark,
  MoreHorizontal, ZoomIn, ChevronRight, Trash2
} from 'lucide-react';
import { postsAPI, commentsAPI, placesAPI } from '../api/index.js';

// ── Post Card ─────────────────────────────────────────────────
const PostCard = ({ post, onClick, onShare, onLike, isLiked, currentUser }) => {
  const isVideo = post.type === 'video' || post.type === 'reel';
  const [liked, setLiked] = useState(isLiked);
  const [likeCount, setLikeCount] = useState(post.likes || 0);
  const [likeBurst, setLikeBurst] = useState(false);

  // Sync from parent
  useEffect(() => { setLiked(isLiked); }, [isLiked]);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!currentUser) { return; }
    const newLiked = !liked;
    setLiked(newLiked);
    setLikeCount(c => newLiked ? c + 1 : c - 1);
    setLikeBurst(true);
    setTimeout(() => setLikeBurst(false), 500);
    try { await postsAPI.toggleLike(post._id || post.id); onLike?.(); } catch { setLiked(!newLiked); setLikeCount(c => newLiked ? c - 1 : c + 1); }
  };

  return (
    <motion.div
      onClick={onClick}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ scale: 1.02 }}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${post.type === 'reel' ? 'aspect-[9/16]' : 'aspect-square'}`}
      style={{ background: '#111' }}
    >
      {isVideo
        ? <video src={post.imageUrl} muted loop playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        : <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={post.description} loading="lazy" />
      }

      {/* Hover overlay — desktop */}
      <div className="hidden md:flex absolute inset-0 bg-black/60 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="flex gap-6 text-white">
          <span className="flex items-center gap-2 font-black text-sm"><Heart className="w-5 h-5 fill-white" /> {likeCount}</span>
          <span className="flex items-center gap-2 font-black text-sm"><MessageCircle className="w-5 h-5" /> {post.comments || 0}</span>
        </div>
      </div>

      {/* Mobile: always-visible bottom strip */}
      <div className="flex md:hidden absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent items-center justify-between">
        <div className="flex gap-3 text-white">
          <button
            onClick={handleLike}
            className="flex items-center gap-1 text-[10px] font-black active:scale-110 transition-transform"
          >
            <Heart className={`w-3.5 h-3.5 transition-all ${liked ? 'fill-rose-500 text-rose-500 scale-125' : 'text-white'}`} />
            {likeCount}
          </button>
          <span className="flex items-center gap-1 text-[10px] font-black text-white/70">
            <MessageCircle className="w-3.5 h-3.5" /> {post.comments || 0}
          </span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onShare(e, post); }} className="p-1 glass rounded-lg active:scale-95 transition-transform">
          <Share2 className="w-3 h-3 text-white" />
        </button>
      </div>

      {/* Double-tap heart burst (mobile) */}
      {likeBurst && (
        <motion.div
          initial={{ scale: 0.5, opacity: 1 }} animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <Heart className="w-16 h-16 text-rose-500 fill-rose-500" />
        </motion.div>
      )}
    </motion.div>
  );
};

// ── MediaVault ────────────────────────────────────────────────
const MediaVault = ({ posts, isAdmin, currentUser, onRegisterPrompt, onRefresh }) => {
  const [filter, setFilter] = useState('photo');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedPost, setSelectedPost] = useState(null);
  const [showShareOptions, setShowShareOptions] = useState(null);
  const [places, setPlaces] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [localLikes, setLocalLikes] = useState({});
  const overlayRef = useRef(null);
  const shareRef = useRef(null);

  useEffect(() => {
    placesAPI.getAll().then(res => setPlaces(res.data || [])).catch(() => {});
  }, []);

  // Click outside to close post viewer
  useEffect(() => {
    const handler = (e) => {
      if (selectedPost && overlayRef.current && e.target === overlayRef.current) setSelectedPost(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [selectedPost]);

  // Click outside to close share options
  useEffect(() => {
    const handler = (e) => {
      if (showShareOptions && shareRef.current && e.target === shareRef.current) setShowShareOptions(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showShareOptions]);

  // ESC key to close
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') { setSelectedPost(null); setShowShareOptions(null); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const filteredPosts = posts.filter(p => {
    if (selectedPlace) return p.placeId === selectedPlace._id || p.placeId === selectedPlace.id;
    if (filter === 'place') return false;
    return p.type === filter;
  });

  const loadComments = async (postId) => {
    try { const res = await commentsAPI.getByPost(postId); setComments(res.data || []); } catch {}
  };

  const handlePostClick = (post) => { setSelectedPost(post); loadComments(post._id || post.id); };

  const handleLike = useCallback(async (postId) => {
    if (!currentUser) { onRegisterPrompt(); return; }
    setLikedPosts(prev => {
      const next = new Set(prev);
      next.has(postId) ? next.delete(postId) : next.add(postId);
      return next;
    });
    setLocalLikes(prev => ({ ...prev, [postId]: (prev[postId] ?? 0) + (likedPosts.has(postId) ? -1 : 1) }));
    try { await postsAPI.toggleLike(postId); onRefresh(); } catch {}
  }, [currentUser, likedPosts, onRefresh, onRegisterPrompt]);

  const handleAddComment = async () => {
    if (!currentUser) { onRegisterPrompt(); return; }
    if (!selectedPost || !newComment.trim()) return;
    const postId = selectedPost._id || selectedPost.id;
    await commentsAPI.create({ postId, text: newComment });
    setNewComment('');
    loadComments(postId);
    onRefresh();
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAdmin) return;
    try {
      await commentsAPI.delete(commentId);
      setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));
    } catch {}
  };

  const shareLinks = (post) => [
    { name: 'X / Twitter', icon: Twitter, color: 'bg-neutral-800', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.description)}&url=${encodeURIComponent(post.imageUrl)}` },
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-600', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.imageUrl)}` },
    { name: 'Instagram', icon: Instagram, color: 'bg-gradient-to-br from-purple-500 via-rose-500 to-amber-500', url: 'https://instagram.com' },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const tabs = [
    { id: 'photo', icon: LayoutGrid, label: 'POSTS' },
    { id: 'reel', icon: Smartphone, label: 'REELS' },
    { id: 'video', icon: Clapperboard, label: 'VIDEOS' },
    { id: 'place', icon: MapPin, label: 'PLACES' },
  ];

  return (
    <div className="space-y-10">
      {/* Tab bar */}
      <div className="flex justify-center border-t border-white/5">
        <div className="flex gap-8 md:gap-12 relative overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => { setFilter(tab.id); setSelectedPlace(null); }}
              className={`relative py-5 flex items-center gap-2 transition-all flex-shrink-0 ${filter === tab.id ? 'text-white' : 'text-neutral-500 hover:text-neutral-300 active:text-neutral-100'}`}
            >
              <tab.icon className={`w-3.5 h-3.5 ${filter === tab.id ? 'text-rose-500' : ''}`} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase">{tab.label}</span>
              {filter === tab.id && <motion.div layoutId="vault-tab" className="absolute top-0 left-0 right-0 h-0.5 bg-rose-600 shadow-[0_0_15px_#e11d48]" />}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {filter === 'place' && !selectedPlace ? (
          <motion.div key="places" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {places.map(place => (
                <motion.div
                  key={place._id || place.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => setSelectedPlace(place)}
                  className="relative aspect-video rounded-3xl overflow-hidden cursor-pointer group border border-white/5"
                >
                  <img src={place.coverImage} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={place.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:via-rose-900/30 transition-all" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2"><Folder className="w-5 h-5 text-rose-500" /></div>
                    <h4 className="text-2xl font-black uppercase italic tracking-tighter text-white">{place.name}</h4>
                    <p className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest mt-1">{place.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div key="vault" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {selectedPlace && (
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setSelectedPlace(null)} className="p-3 glass rounded-xl text-rose-500 hover:bg-rose-600 hover:text-white transition-all border border-white/5 active:scale-95">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-2xl font-black uppercase italic text-white leading-none">{selectedPlace.name}</h3>
                  <p className="text-[10px] text-neutral-500 font-black uppercase tracking-widest mt-1">Location Archive</p>
                </div>
              </div>
            )}

            {/* Instagram-style grid */}
            <div className={`grid gap-1 md:gap-2 ${filter === 'reel' ? 'grid-cols-3 md:grid-cols-4' : 'grid-cols-3 md:grid-cols-3'}`}>
              {filteredPosts.map((post, idx) => {
                // Featured post: every 7th post spans 2 cols
                const isFeatured = idx % 7 === 0 && filter === 'photo';
                return (
                  <div key={post._id || post.id} className={isFeatured ? 'col-span-2 row-span-2' : ''}>
                    <PostCard
                      post={post}
                      onClick={() => handlePostClick(post)}
                      onShare={(e, p) => { e.stopPropagation(); setShowShareOptions(p); }}
                      onLike={() => handleLike(post._id || post.id)}
                      isLiked={likedPosts.has(post._id || post.id)}
                      currentUser={currentUser}
                    />
                  </div>
                );
              })}
            </div>

            {filteredPosts.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-neutral-600 uppercase font-black tracking-[0.5em]">No Assets Found In This Sector</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post Detail Lightbox ───────────────────────────── */}
      <AnimatePresence>
        {selectedPost && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-5xl h-[90vh] flex flex-col lg:flex-row bg-[#0A0A0F] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl"
            >
              {/* Media */}
              <div className="flex-1 bg-black relative flex items-center justify-center min-h-56">
                {selectedPost.type === 'photo'
                  ? <img src={selectedPost.imageUrl} className="w-full h-full object-contain" alt="" />
                  : <video src={selectedPost.imageUrl} controls autoPlay className="w-full h-full object-contain" />
                }
                <button onClick={() => setSelectedPost(null)} className="absolute top-4 left-4 p-2.5 glass rounded-full text-white hover:bg-rose-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Sidebar */}
              <div className="lg:w-[400px] flex flex-col border-l border-white/5 max-h-[40vh] lg:max-h-full">
                {/* Author row */}
                <div className="flex items-center gap-3 p-4 border-b border-white/5">
                  <div className="w-9 h-9 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-rose-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-xs font-bold">{selectedPost.author || 'IBR Member'}</p>
                    <p className="text-neutral-600 text-[10px]">Indian Bangali Riders</p>
                  </div>
                  <button onClick={() => setShowShareOptions(selectedPost)} className="p-2 text-neutral-500 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Caption */}
                {selectedPost.description && (
                  <div className="p-4 border-b border-white/5">
                    <p className="text-neutral-300 text-sm leading-relaxed">"{selectedPost.description}"</p>
                  </div>
                )}

                {/* Comments */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {comments.length > 0 ? comments.map(c => (
                    <div key={c._id || c.id} className="flex gap-3 group/comment">
                      <div className="w-7 h-7 rounded-full bg-rose-600/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-3.5 h-3.5 text-rose-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-white">{c.username}</span>
                        <p className="text-sm text-neutral-400 leading-relaxed break-words">{c.text}</p>
                      </div>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteComment(c._id || c.id)}
                          className="ml-auto p-1.5 rounded-xl text-neutral-700 hover:text-rose-500 hover:bg-rose-600/10 transition opacity-0 group-hover/comment:opacity-100 flex-shrink-0"
                          title="Delete comment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )) : (
                    <p className="text-neutral-700 text-xs uppercase tracking-widest text-center py-4">No comments yet</p>
                  )}
                </div>

                {/* Actions bar */}
                <div className="p-4 border-t border-white/5 space-y-3">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleLike(selectedPost._id || selectedPost.id)}
                      className="flex items-center gap-2 text-sm font-bold active:scale-110 transition-transform"
                    >
                      <Heart className={`w-5 h-5 transition-all ${likedPosts.has(selectedPost._id || selectedPost.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-neutral-400'}`} />
                      <span className="text-neutral-400 text-xs">{(selectedPost.likes || 0) + (localLikes[selectedPost._id || selectedPost.id] || 0)}</span>
                    </button>
                    <button className="flex items-center gap-2 text-neutral-400 active:scale-110 transition-transform">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs">{comments.length}</span>
                    </button>
                    <button onClick={() => setShowShareOptions(selectedPost)} className="flex items-center gap-2 text-neutral-400 active:scale-110 transition-transform ml-auto">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Comment input */}
                  <div className="flex gap-2">
                    <input
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                      placeholder={currentUser ? "Add a comment…" : "Login to comment"}
                      className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-rose-500 transition-colors"
                    />
                    <button onClick={handleAddComment} className="px-3 py-2 bg-rose-600 rounded-xl text-white active:scale-95 transition-transform">
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Share Options Modal ────────────────────────────── */}
      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            ref={shareRef}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/80 flex items-end sm:items-center justify-center p-4 backdrop-blur-xl"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 60, opacity: 0 }}
              className="bg-[#111118] w-full max-w-sm rounded-t-[32px] sm:rounded-[32px] p-8 border border-white/10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <Share2 className="w-5 h-5 text-rose-500" />
                  <h3 className="text-white font-black uppercase text-sm">Share</h3>
                </div>
                <button onClick={() => setShowShareOptions(null)} className="p-2 text-neutral-500 hover:text-white transition-colors active:scale-95">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {shareLinks(showShareOptions).map(s => (
                  <a key={s.name} href={s.url} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-3 p-4 rounded-2xl ${s.color} text-white hover:opacity-90 active:scale-95 transition-all`}
                  >
                    <s.icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{s.name}</span>
                  </a>
                ))}
                <button
                  onClick={() => { copyToClipboard(showShareOptions.imageUrl); setShowShareOptions(null); }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-neutral-800 hover:bg-neutral-700 active:scale-95 transition-all"
                >
                  <LinkIcon className="w-5 h-5 text-neutral-300" />
                  <span className="text-xs font-bold text-neutral-300">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MediaVault;
