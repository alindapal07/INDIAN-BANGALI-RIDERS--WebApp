import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, MessageCircle, Share2, MoreHorizontal, Plus, Image, Type,
  Megaphone, BarChart2, Bike, Pin, Trash2, Send, ChevronDown,
  Loader2, Film, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import io from 'socket.io-client';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('ibr_token');
const api = (path, opts = {}) => axios({ url: `${API}${path}`, headers: { Authorization: `Bearer ${token()}` }, ...opts });

const REACTIONS = [
  { key: 'like', emoji: '❤️', label: 'Love' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'ride', emoji: '🏍️', label: 'Ride' },
  { key: 'wow', emoji: '😮', label: 'Wow' },
  { key: 'clap', emoji: '👏', label: 'Clap' },
];

const BG_THEMES = [
  { label: 'Default', value: '', text: '#FFFFFF', preview: 'bg-neutral-900' },
  { label: 'Flame', value: 'linear-gradient(135deg,#e11d48,#fb923c)', text: '#FFFFFF', preview: 'bg-gradient-to-br from-rose-600 to-orange-400' },
  { label: 'Night', value: 'linear-gradient(135deg,#1e1b4b,#312e81)', text: '#e9d5ff', preview: 'bg-gradient-to-br from-indigo-900 to-purple-900' },
  { label: 'Forest', value: 'linear-gradient(135deg,#14532d,#166534)', text: '#bbf7d0', preview: 'bg-gradient-to-br from-green-900 to-green-700' },
  { label: 'Midnight', value: 'linear-gradient(135deg,#000000,#1c1c1c)', text: '#F5F5F5', preview: 'bg-black' },
  { label: 'Gold', value: 'linear-gradient(135deg,#713f12,#ca8a04)', text: '#fef9c3', preview: 'bg-gradient-to-br from-yellow-900 to-yellow-600' },
];

// ─── Post Composer ──────────────────────────────────────────────────────────
const PostComposer = ({ currentUser, onPost }) => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState('text');
  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [bgTheme, setBgTheme] = useState(BG_THEMES[0]);
  const [pollQ, setPollQ] = useState('');
  const [pollOpts, setPollOpts] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState('');

  const handleSubmit = async () => {
    if (!content.trim() && !mediaUrl && !(type === 'poll' && pollQ)) return;
    setLoading(true);
    try {
      const payload = {
        type,
        content: content.trim(),
        mediaUrl: mediaUrl.trim(),
        backgroundColor: bgTheme.value,
        textColor: bgTheme.text,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        ...(type === 'poll' && { poll: { question: pollQ, options: pollOpts.filter(Boolean).map(o => ({ text: o, votes: [] })) } }),
      };
      const { data } = await api('/timeline', { method: 'POST', data: payload });
      onPost(data);
      setOpen(false); setContent(''); setMediaUrl(''); setPollQ(''); setPollOpts(['', '']); setTags('');
    } catch (e) { alert(e.response?.data?.error || 'Failed to post'); }
    setLoading(false);
  };

  const typeButtons = [
    { id: 'text', icon: Type, label: 'Write' },
    { id: 'photo', icon: Image, label: 'Photo' },
    { id: 'video', icon: Film, label: 'Video' },
    { id: 'announcement', icon: Megaphone, label: 'Announce' },
    { id: 'ride_update', icon: Bike, label: 'Ride Update' },
    { id: 'poll', icon: BarChart2, label: 'Poll' },
  ];

  return (
    <div className="glass border border-white/8 rounded-2xl mb-6 overflow-hidden">
      {/* Collapsed trigger */}
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-rose-600/30 flex items-center justify-center font-black text-rose-400 text-sm flex-shrink-0">
          {currentUser?.username?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-neutral-500 text-sm flex-1">Share your ride story, update or announcement…</span>
        <Plus className={`w-4 h-4 text-neutral-500 transition-transform ${open ? 'rotate-45' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden border-t border-white/5">
            <div className="p-4 space-y-4">
              {/* Type selector */}
              <div className="flex flex-wrap gap-2">
                {typeButtons.map(b => (
                  <button key={b.id} onClick={() => setType(b.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition ${type === b.id ? 'bg-rose-600 text-white' : 'bg-white/5 text-neutral-400 hover:text-white'}`}>
                    <b.icon className="w-3 h-3" /> {b.label}
                  </button>
                ))}
              </div>

              {/* Announcement bg picker */}
              {(type === 'announcement' || type === 'ride_update') && (
                <div>
                  <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-2 font-bold">Background Theme</p>
                  <div className="flex flex-wrap gap-2">
                    {BG_THEMES.map(t => (
                      <button key={t.label} onClick={() => setBgTheme(t)}
                        className={`w-8 h-8 rounded-lg ${t.preview} border-2 transition ${bgTheme.label === t.label ? 'border-rose-500 scale-110' : 'border-transparent'}`} />
                    ))}
                  </div>
                </div>
              )}

              {/* Content */}
              {type !== 'poll' && (
                <div
                  style={bgTheme.value ? { background: bgTheme.value, color: bgTheme.text } : {}}
                  className={`rounded-xl overflow-hidden ${!bgTheme.value ? 'bg-neutral-900' : ''}`}>
                  <textarea
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    placeholder={
                      type === 'announcement' ? 'Write your announcement here...' :
                      type === 'ride_update' ? 'Share your ride update...' :
                      type === 'photo' ? 'Add a caption...' :
                      'What\'s on your mind, rider?'
                    }
                    rows={4}
                    className="w-full bg-transparent p-4 text-sm resize-none outline-none placeholder-current placeholder-opacity-40"
                  />
                </div>
              )}

              {/* Media URL */}
              {(type === 'photo' || type === 'video') && (
                <input value={mediaUrl} onChange={e => setMediaUrl(e.target.value)}
                  placeholder={type === 'photo' ? 'Paste image URL...' : 'Paste video URL...'}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-rose-500" />
              )}

              {/* Poll */}
              {type === 'poll' && (
                <div className="space-y-3">
                  <input value={pollQ} onChange={e => setPollQ(e.target.value)}
                    placeholder="Poll question..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 outline-none focus:border-rose-500" />
                  {pollOpts.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <input value={opt} onChange={e => setPollOpts(p => p.map((x, j) => j === i ? e.target.value : x))}
                        placeholder={`Option ${i + 1}`}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 outline-none focus:border-rose-500" />
                      {pollOpts.length > 2 && (
                        <button onClick={() => setPollOpts(p => p.filter((_, j) => j !== i))} className="text-neutral-600 hover:text-rose-500 transition px-2">✕</button>
                      )}
                    </div>
                  ))}
                  {pollOpts.length < 6 && (
                    <button onClick={() => setPollOpts(p => [...p, ''])} className="text-xs text-rose-400 font-bold flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Add option
                    </button>
                  )}
                </div>
              )}

              {/* Tags */}
              <input value={tags} onChange={e => setTags(e.target.value)}
                placeholder="Tags: rides, darjeeling (comma separated)"
                className="w-full bg-neutral-900/50 border border-neutral-800/50 rounded-xl px-4 py-2 text-xs text-neutral-400 placeholder-neutral-700 outline-none focus:border-rose-500/40" />

              <div className="flex justify-end">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-black text-xs uppercase tracking-widest transition">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  POST
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Reaction Bar ────────────────────────────────────────────────────────────
const ReactionBar = ({ reactions = {}, onReact, currentUserId }) => {
  const [show, setShow] = useState(false);
  const myReaction = currentUserId ? reactions[currentUserId] : null;
  const myEmoji = myReaction ? REACTIONS.find(r => r.key === myReaction)?.emoji : null;

  // Count reactions
  const counts = {};
  Object.values(reactions).forEach(r => { counts[r] = (counts[r] || 0) + 1; });
  const total = Object.keys(reactions).length;

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onClick={() => onReact(myReaction ? null : 'like')}
        onTouchStart={() => setShow(p => !p)}
        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${myReaction ? 'text-rose-400' : 'text-neutral-500 hover:text-rose-400 active:text-rose-400'}`}
      >
        <span className="text-base leading-none">{myEmoji || '❤️'}</span>
        <span>{total || 0}</span>
      </button>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.9 }}
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
            className="absolute bottom-full left-0 mb-2 flex gap-1 bg-black/90 border border-white/10 rounded-2xl p-2 shadow-2xl z-30"
          >
            {REACTIONS.map(r => (
              <button
                key={r.key}
                onClick={() => { onReact(myReaction === r.key ? null : r.key); setShow(false); }}
                title={r.label}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-transform hover:scale-125 active:scale-125 ${myReaction === r.key ? 'bg-rose-600/20 ring-1 ring-rose-500' : 'hover:bg-white/10'}`}
              >
                {r.emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ─── Isolated Reply Input (own state – no shared-state bug) ──────────────────
const ReplyInput = ({ parentName, postId, parentId, onDone, onCancel }) => {
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  const submit = async () => {
    if (!replyText.trim()) return;
    setLoading(true);
    try {
      await api(`/timeline/${postId}/comment`, { method: 'POST', data: { content: replyText, parentComment: parentId } });
      setReplyText(''); onDone();
    } catch {}
    setLoading(false);
  };
  return (
    <div className="ml-9 flex gap-2 items-center">
      <input value={replyText} onChange={e => setReplyText(e.target.value)}
        placeholder={`Replying to ${parentName}…`} autoFocus
        onKeyDown={e => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
        className="flex-1 bg-white/5 border border-rose-500/40 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-rose-500 placeholder-neutral-600" />
      <button onClick={submit} disabled={loading || !replyText.trim()}
        className="px-3 py-2 bg-rose-600 rounded-xl text-xs text-white font-bold transition hover:bg-rose-700 disabled:opacity-40">
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
      </button>
      <button onClick={onCancel} className="text-[10px] text-neutral-500 hover:text-red-400 font-bold px-1">✕</button>
    </div>
  );
};

// ─── Comment Thread ──────────────────────────────────────────────────────────
const CommentThread = ({ comments = [], postId, currentUser, onRefresh }) => {
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState(null); // stores commentId being replied to
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const topComments = comments.filter(c => !c.parentComment);
  const visible = showAll ? topComments : topComments.slice(0, 3);

  const submitMain = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      await api(`/timeline/${postId}/comment`, { method: 'POST', data: { content: text } });
      setText(''); onRefresh();
    } catch {}
    setLoading(false);
  };

  const likeComment = async (cid) => {
    try { await api(`/timeline/${postId}/comment/${cid}/like`, { method: 'POST' }); onRefresh(); } catch {}
  };

  return (
    <div className="space-y-3">
      {visible.map(c => (
        <div key={c._id} className="space-y-2">
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-rose-600/20 flex items-center justify-center text-xs font-black text-rose-400 flex-shrink-0">
              {c.authorName?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="bg-white/4 rounded-2xl px-3 py-2.5">
                <p className="text-[10px] font-black text-rose-400 mb-0.5">{c.authorName}</p>
                <p className="text-xs text-neutral-300">{c.content}</p>
              </div>
              <div className="flex items-center gap-4 mt-1 pl-2">
                <button onClick={() => likeComment(c._id)} className="text-[10px] text-neutral-600 hover:text-rose-400 active:text-rose-400 font-bold transition">
                  ❤️ {c.likes?.length || 0}
                </button>
                {currentUser && (
                  <button
                    onClick={() => setReplyTo(replyTo === c._id ? null : c._id)}
                    className={`text-[10px] font-bold transition ${replyTo === c._id ? 'text-rose-400' : 'text-neutral-600 hover:text-white'}`}
                  >
                    {replyTo === c._id ? 'Cancel' : 'Reply'}
                  </button>
                )}
                <span className="text-[9px] text-neutral-700">{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          {/* Nested Replies */}
          {comments.filter(r => r.parentComment?.toString() === c._id?.toString()).map(r => (
            <div key={r._id} className="ml-9 flex gap-2 items-start">
              <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-black text-neutral-400 flex-shrink-0 mt-0.5">
                {r.authorName?.[0]?.toUpperCase()}
              </div>
              <div className="bg-white/3 rounded-xl px-3 py-2 flex-1">
                <p className="text-[9px] font-black text-neutral-400 mb-0.5">{r.authorName}</p>
                <p className="text-[11px] text-neutral-400">{r.content}</p>
              </div>
            </div>
          ))}
          {/* Isolated reply input – has its own state, never pollutes main input */}
          {replyTo === c._id && (
            <ReplyInput
              parentName={c.authorName}
              postId={postId}
              parentId={c._id}
              onDone={() => { setReplyTo(null); onRefresh(); }}
              onCancel={() => setReplyTo(null)}
            />
          )}
        </div>
      ))}

      {topComments.length > 3 && !showAll && (
        <button onClick={() => setShowAll(true)} className="text-[10px] text-neutral-500 hover:text-white flex items-center gap-1 font-bold">
          <ChevronDown className="w-3 h-3" /> View {topComments.length - 3} more comments
        </button>
      )}

      {/* Main comment input */}
      {currentUser && (
        <div className="flex gap-2.5 pt-1">
          <div className="w-7 h-7 rounded-full bg-rose-600/20 flex items-center justify-center text-xs font-black text-rose-400 flex-shrink-0">
            {currentUser.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 flex gap-2">
            <input value={text} onChange={e => setText(e.target.value)}
              placeholder="Write a comment…"
              onKeyDown={e => e.key === 'Enter' && submitMain()}
              className="flex-1 bg-white/5 border border-white/8 rounded-full px-4 py-2 text-xs text-white outline-none focus:border-rose-500 placeholder-neutral-600" />
            <button onClick={submitMain} disabled={loading || !text.trim()} className="w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center text-white disabled:opacity-40 transition hover:bg-rose-700 flex-shrink-0">
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Single Post Card ────────────────────────────────────────────────────────
const PostCard = ({ post, currentUser, isAdmin, onRefresh, onDelete }) => {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const canDelete = isAdmin || post.author === currentUser?._id || post.author?._id === currentUser?._id;

  const react = async (reaction) => {
    try {
      await api(`/timeline/${post._id}/react`, { method: 'POST', data: { reaction } });
      onRefresh();
    } catch {}
  };

  const pinPost = async () => {
    try { await api(`/timeline/${post._id}/pin`, { method: 'PATCH' }); onRefresh(); } catch {}
  };

  const typeLabel = {
    announcement: { icon: '📢', color: 'text-amber-400', bg: 'bg-amber-600/10 border-amber-600/20' },
    ride_update: { icon: '🏍️', color: 'text-rose-400', bg: 'bg-rose-600/10 border-rose-600/20' },
    poll: { icon: '📊', color: 'text-blue-400', bg: 'bg-blue-600/10 border-blue-600/20' },
    photo: { icon: '📸', color: 'text-green-400', bg: '' },
    video: { icon: '🎬', color: 'text-purple-400', bg: '' },
    text: { icon: null, color: '', bg: '' },
  }[post.type] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass border rounded-2xl overflow-hidden mb-4 ${post.isPinned ? 'border-amber-600/30' : 'border-white/8'}`}
    >
      {post.isPinned && (
        <div className="flex items-center gap-2 px-4 pt-3 pb-0">
          <Pin className="w-3 h-3 text-amber-500" />
          <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest">Pinned Post</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
            post.authorRole === 'admin' ? 'bg-amber-600/30 text-amber-400' : 'bg-rose-600/20 text-rose-400'
          }`}>
            {post.authorPhoto
              ? <img src={post.authorPhoto} className="w-full h-full object-cover rounded-full" alt="" />
              : post.authorName?.[0]?.toUpperCase()
            }
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-white text-sm font-black">{post.authorName}</p>
              {post.authorRole === 'admin' && (
                <span className="text-[8px] bg-amber-600/20 text-amber-400 px-1.5 py-0.5 rounded-full font-black">ADMIN</span>
              )}
              {typeLabel.icon && (
                <span className={`text-[9px] px-2 py-0.5 border rounded-full font-bold ${typeLabel.bg} ${typeLabel.color}`}>
                  {typeLabel.icon} {post.type.replace('_', ' ').toUpperCase()}
                </span>
              )}
            </div>
            <p className="text-[10px] text-neutral-600">{new Date(post.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(p => !p)} className="p-2 text-neutral-600 hover:text-white transition rounded-lg hover:bg-white/5 active:bg-white/5">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                className="absolute right-0 top-full mt-1 bg-black/95 border border-white/10 rounded-xl p-1 shadow-2xl z-30 min-w-[140px]">
                {isAdmin && (
                  <button onClick={() => { pinPost(); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg">
                    <Pin className="w-3 h-3" /> {post.isPinned ? 'Unpin' : 'Pin'}
                  </button>
                )}
                {canDelete && (
                  <button onClick={() => { onDelete(post._id); setShowMenu(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-xs text-rose-400 hover:bg-rose-600/10 rounded-lg">
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <div
          className="px-4 pb-3 text-sm leading-relaxed"
          style={post.backgroundColor ? {
            background: post.backgroundColor, color: post.textColor,
            margin: '0 16px 12px', padding: '16px', borderRadius: '16px',
            fontWeight: post.type === 'announcement' ? '700' : '400'
          } : { color: '#e5e5e5' }}
        >
          {post.content}
        </div>
      )}

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {post.tags.map(t => <span key={t} className="text-[10px] text-rose-400 bg-rose-600/10 px-2 py-0.5 rounded-full font-bold">#{t}</span>)}
        </div>
      )}

      {/* Photo/Video */}
      {post.mediaUrl && (
        <div className="px-4 pb-3">
          {post.type === 'video' ? (
            <video src={post.mediaUrl} controls className="w-full rounded-xl max-h-80 object-cover" />
          ) : (
            <img src={post.mediaUrl} alt="" className="w-full rounded-xl max-h-80 object-cover"
              onError={e => e.target.style.display = 'none'} />
          )}
        </div>
      )}

      {/* Poll */}
      {post.type === 'poll' && post.poll?.question && (
        <div className="px-4 pb-4">
          <p className="text-sm font-black text-white mb-3">{post.poll.question}</p>
          <div className="space-y-2">
            {post.poll.options?.map((opt, i) => {
              const total = post.poll.options.reduce((s, o) => s + (o.votes?.length || 0), 0);
              const pct = total ? Math.round((opt.votes?.length || 0) / total * 100) : 0;
              const voted = currentUser && opt.votes?.some(v => v === currentUser._id || v?._id === currentUser._id);
              return (
                <button key={i} onClick={() => currentUser && api(`/timeline/${post._id}/poll/vote`, { method: 'POST', data: { optionIndex: i } }).then(onRefresh)}
                  disabled={!currentUser}
                  className={`w-full relative overflow-hidden rounded-xl border p-3 text-left transition ${voted ? 'border-rose-500/40' : 'border-white/8 hover:border-white/20 active:border-white/20'}`}>
                  <div className="absolute inset-0 bg-rose-600/20 transition-all" style={{ width: `${pct}%` }} />
                  <div className="relative flex items-center justify-between">
                    <span className="text-sm text-white font-medium">{opt.text}</span>
                    <span className="text-xs text-neutral-400 font-black">{pct}% ({opt.votes?.length || 0})</span>
                  </div>
                </button>
              );
            })}
            <p className="text-[10px] text-neutral-600">{post.poll.options?.reduce((s, o) => s + (o.votes?.length || 0), 0)} votes</p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-4 px-4 py-3 border-t border-white/5">
        <ReactionBar
          reactions={post.reactions || {}}
          currentUserId={currentUser?._id}
          onReact={react}
        />
        <button
          onClick={() => setShowComments(p => !p)}
          className={`flex items-center gap-1.5 text-xs font-bold transition ${showComments ? 'text-blue-400' : 'text-neutral-500 hover:text-blue-400 active:text-blue-400'}`}
        >
          <MessageCircle className="w-4 h-4" />
          {post.comments?.length || 0}
        </button>
        <button className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-white active:text-white transition ml-auto">
          <Share2 className="w-3.5 h-3.5" />
          Share
        </button>
      </div>

      {/* Comments */}
      <AnimatePresence>
        {showComments && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 border-t border-white/5 pt-3">
              <CommentThread
                comments={post.comments || []}
                postId={post._id}
                currentUser={currentUser}
                onRefresh={onRefresh}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Main Timeline Feed ──────────────────────────────────────────────────────
const TimelineFeed = ({ currentUser, isAdmin }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const socketRef = useRef(null);

  const loadPosts = useCallback(async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await api(`/timeline?page=${p}&limit=10`);
      setPosts(prev => append ? [...prev, ...(data.posts || [])] : (data.posts || []));
      setHasMore(p < (data.pages || 1));
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(1); }, [loadPosts]);

  // Live socket updates
  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = s;
    s.on('timeline:new_post', (post) => setPosts(prev => [post, ...prev]));
    s.on('timeline:delete_post', ({ postId }) => setPosts(prev => prev.filter(p => p._id !== postId)));
    s.on('timeline:reaction', ({ postId, reactions }) => setPosts(prev => prev.map(p => p._id === postId ? { ...p, reactions } : p)));
    s.on('timeline:comment', ({ postId }) => loadPosts(1));
    return () => s.disconnect();
  }, [loadPosts]);

  const handleNewPost = (post) => setPosts(prev => [post, ...prev]);

  const handleDelete = async (id) => {
    try { await api(`/timeline/${id}`, { method: 'DELETE' }); setPosts(prev => prev.filter(p => p._id !== id)); } catch {}
  };

  const loadMore = () => { const next = page + 1; setPage(next); loadPosts(next, true); };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-px flex-1 bg-white/5" />
        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500">Community Feed</h2>
        <div className="h-px flex-1 bg-white/5" />
      </div>

      {isAdmin && (
        <PostComposer currentUser={currentUser} onPost={handleNewPost} />
      )}

      {loading && posts.length === 0 ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-rose-600" /></div>
      ) : posts.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center border border-white/5">
          <p className="text-neutral-500 text-sm">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <>
          {posts.map(post => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onRefresh={() => loadPosts(1)}
              onDelete={handleDelete}
            />
          ))}
          {hasMore && (
            <div className="flex justify-center mt-6">
              <button onClick={loadMore} disabled={loading}
                className="px-8 py-3 border border-white/10 rounded-full text-sm text-neutral-400 hover:text-white hover:border-white/20 transition font-bold">
                {loading ? <Loader2 className="w-4 h-4 animate-spin inline mr-2" /> : null} Load More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TimelineFeed;
