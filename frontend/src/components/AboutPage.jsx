import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Users, MapPin, Calendar, Award, Shield, Heart,
  MessageSquare, ThumbsUp, Send, Loader2, ChevronDown, Bike, Edit3, Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL;
const authApi = (path, opts = {}) =>
  axios({ url: `${API}${path}`, headers: { Authorization: `Bearer ${localStorage.getItem('ibr_token')}` }, ...opts });
const publicApi = (path, opts = {}) =>
  axios({ url: `${API}${path}`, ...opts });

// ── Star Rating Display ────────────────────────────────────────────────────
const StarDisplay = ({ rating, size = 'sm' }) => {
  const sz = size === 'lg' ? 'w-6 h-6' : size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className={`${sz} ${s <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-700 fill-neutral-700'}`} />
      ))}
    </div>
  );
};

// ── Interactive Star Picker ────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s} type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-125"
        >
          <Star className={`w-8 h-8 transition-colors ${s <= (hover || value) ? 'text-amber-400 fill-amber-400' : 'text-neutral-600 fill-neutral-700'}`} />
        </button>
      ))}
    </div>
  );
};

// ── Rating Distribution Bar ────────────────────────────────────────────────
const RatingBar = ({ star, count, total, pct }) => (
  <div className="flex items-center gap-3">
    <span className="text-xs text-neutral-400 w-4 text-right font-bold">{star}</span>
    <Star className="w-3 h-3 text-amber-400 fill-amber-400 flex-shrink-0" />
    <div className="flex-1 h-2 bg-neutral-800 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="h-full bg-amber-400 rounded-full"
      />
    </div>
    <span className="text-[10px] text-neutral-500 w-6 font-bold">{count}</span>
  </div>
);

// ── Review Form ────────────────────────────────────────────────────────────
const ReviewForm = ({ onSuccess, existingReview, onCancel }) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [title, setTitle] = useState(existingReview?.title || '');
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!rating) return setErr('Please select a star rating.');
    if (!comment.trim()) return setErr('Please write a comment.');
    setErr(''); setLoading(true);
    try {
      await authApi('/reviews', { method: 'POST', data: { rating, title, comment } });
      onSuccess();
    } catch (e) { setErr(e.response?.data?.error || 'Failed to submit review'); }
    setLoading(false);
  };

  return (
    <motion.form onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass border border-white/10 rounded-2xl p-6 space-y-4">
      <h3 className="text-white font-black text-lg">{existingReview ? 'Edit Your Review' : 'Write a Review'}</h3>

      <div>
        <p className="text-xs text-neutral-400 mb-2 font-bold uppercase tracking-widest">Your Rating</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      <input value={title} onChange={e => setTitle(e.target.value)}
        placeholder="Give your review a title (optional)"
        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 placeholder-neutral-600" />

      <textarea value={comment} onChange={e => setComment(e.target.value)}
        placeholder="Share your experience with Indian Bangali Riders..." rows={4}
        className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-amber-500 resize-none placeholder-neutral-600" />

      {err && <p className="text-rose-400 text-xs">{err}</p>}

      <div className="flex gap-3 justify-end">
        {onCancel && (
          <button type="button" onClick={onCancel}
            className="px-5 py-2.5 border border-white/10 text-neutral-400 text-sm rounded-xl font-bold hover:text-white transition">
            Cancel
          </button>
        )}
        <button type="submit" disabled={loading}
          className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black text-sm rounded-xl font-black transition disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          {existingReview ? 'Update Review' : 'Submit Review'}
        </button>
      </div>
    </motion.form>
  );
};

// ── Single Review Card ─────────────────────────────────────────────────────
const ReviewCard = ({ review, currentUser, isAdmin, onHelpful, onDelete }) => {
  const [helpfulCount, setHelpfulCount] = useState(review.helpful?.length || 0);
  const isHelpful = currentUser && review.helpful?.includes(currentUser._id);

  const handleHelpful = async () => {
    if (!currentUser) return;
    try {
      const { data } = await authApi(`/reviews/${review._id}/helpful`, { method: 'POST' });
      setHelpfulCount(data.helpful);
      onHelpful();
    } catch {}
  };

  const timeAgo = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="glass border border-white/8 rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-600/20 flex items-center justify-center font-black text-amber-400 text-sm flex-shrink-0">
            {review.authorName?.[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-white text-sm font-black">{review.authorName}</p>
            <p className="text-neutral-600 text-[10px]">{timeAgo(review.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StarDisplay rating={review.rating} />
          {(isAdmin || (currentUser && review.author === currentUser._id)) && (
            <button onClick={() => onDelete(review._id)}
              className="ml-2 text-neutral-600 hover:text-rose-400 transition">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {review.title && (
        <p className="text-white font-black text-sm mb-1">{review.title}</p>
      )}
      <p className="text-neutral-400 text-sm leading-relaxed">{review.comment}</p>

      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
        <button onClick={handleHelpful}
          className={`flex items-center gap-1.5 text-xs font-bold transition ${isHelpful ? 'text-amber-400' : 'text-neutral-600 hover:text-amber-400'}`}>
          <ThumbsUp className="w-3.5 h-3.5" />
          Helpful ({helpfulCount})
        </button>
        <div className="flex items-center gap-1 ml-auto">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`w-1.5 h-1.5 rounded-full ${s <= review.rating ? 'bg-amber-400' : 'bg-neutral-700'}`} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ── Main About Page ────────────────────────────────────────────────────────
const AboutPage = () => {
  const { currentUser, isAdmin } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);
  const [total, setTotal] = useState(0);
  const [distribution, setDistribution] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStar, setFilterStar] = useState(0);
  const [sortBy, setSortBy] = useState('newest');

  const loadReviews = useCallback(async () => {
    try {
      const { data } = await publicApi('/reviews');
      setReviews(data.reviews || []);
      setAvg(data.avg || 0);
      setTotal(data.total || 0);
      setDistribution(data.distribution || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    try { await authApi(`/reviews/${id}`, { method: 'DELETE' }); loadReviews(); } catch {}
  };

  const myReview = currentUser && reviews.find(r => r.author === currentUser._id || r.author?._id === currentUser._id);

  const filteredReviews = reviews
    .filter(r => filterStar === 0 || r.rating === filterStar)
    .sort((a, b) => {
      if (sortBy === 'helpful') return (b.helpful?.length || 0) - (a.helpful?.length || 0);
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  const stats = [
    { icon: Users, label: 'Active Riders', value: '120+', color: 'text-rose-400' },
    { icon: MapPin, label: 'Expeditions', value: '50+', color: 'text-amber-400' },
    { icon: Calendar, label: 'Est. Year', value: '2023', color: 'text-blue-400' },
    { icon: Bike, label: 'KMs Covered', value: '1L+', color: 'text-green-400' },
  ];

  const milestones = [
    { year: '2023', event: 'IBR founded in Kolkata by a group of passionate Bengali riders who shared a dream — to ride, explore, and bond.' },
    { year: '2024', event: 'First major expedition to the Himalayas. 20 members, 2000+ km, memories for a lifetime.' },
    { year: '2024', event: 'Community grew past 80 members. Launched local city rides and meetups.' },
    { year: '2025', event: 'IBR goes digital — our official platform launched for booking, updates, and community.' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* Hero Banner */}
      <div className="relative overflow-hidden py-24 px-6"
        style={{ background: 'linear-gradient(135deg, #0A0A0F 0%, #1a0a0a 50%, #0A0A0F 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, #e11d48 0%, transparent 60%), radial-gradient(circle at 70% 50%, #f59e0b 0%, transparent 60%)' }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="inline-flex items-center gap-2 bg-amber-600/10 border border-amber-600/20 rounded-full px-4 py-1.5 mb-6">
              <Bike className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] text-amber-400 font-black uppercase tracking-widest">Kolkata's Bengali Rider Community</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black italic uppercase tracking-tight text-white mb-4">
              𝑰𝑵𝑫𝑰𝑨𝑵 বাঙালী{' '}
              <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #e11d48, #f59e0b)' }}>RIDERS</span>
            </h1>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed">
              একদল পথপ্রেমী রাইডারের বন্ধন — যাদের কাছে রাইড মানে শুধু গন্তব্য নয়, পুরো যাত্রাটাই আসল।
            </p>
            <p className="text-neutral-500 text-sm mt-2">A bond of road-loving riders — for whom a ride is not just a destination, but the entire journey.</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-24 space-y-20">

        {/* Stats */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 -mt-8">
          {stats.map(s => (
            <div key={s.label} className="glass border border-white/8 rounded-2xl p-5 text-center">
              <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </motion.div>

        {/* About Section */}
        <section className="grid md:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-rose-600/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-400">Who We Are</span>
              <div className="h-px flex-1 bg-rose-600/30" />
            </div>
            <h2 className="text-3xl font-black italic uppercase text-white">Our Story</h2>
            <p className="text-neutral-400 leading-relaxed">
              <strong className="text-white">Indian Bangali Riders (IBR)</strong> is a passionate motorcycle club based in Kolkata, West Bengal — built by Bengali riders, for riders who live for the road.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              We believe riding is more than a hobby — it's a lifestyle. On <strong className="text-white">Indian soil</strong>, we explore mountains, plains, coastal roads, and everything in between, together as a pack.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              From night rides through the city to week-long Himalayan expeditions, IBR is where the road meets brotherhood.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="https://www.facebook.com/profile.php?id=61585515701817" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600/20 border border-blue-600/30 text-blue-400 rounded-xl text-sm font-bold hover:bg-blue-600/30 transition">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Follow on Facebook
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px flex-1 bg-amber-600/30" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Our Values</span>
              <div className="h-px flex-1 bg-amber-600/30" />
            </div>
            {[
              { icon: Shield, title: 'Safety First', desc: 'Every ride is planned with safety protocols and helmets are mandatory.', color: 'text-rose-400 bg-rose-600/10 border-rose-600/20' },
              { icon: Heart, title: 'Brotherhood', desc: 'We ride as one. No rider left behind — on road or off it.', color: 'text-amber-400 bg-amber-600/10 border-amber-600/20' },
              { icon: Award, title: 'Explore Fearlessly', desc: 'From Sundarbans to Sikkim — no road is too far for IBR.', color: 'text-green-400 bg-green-600/10 border-green-600/20' },
            ].map(v => (
              <div key={v.title} className={`flex gap-4 p-4 rounded-xl border ${v.color}`}>
                <v.icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${v.color.split(' ')[0]}`} />
                <div>
                  <p className="text-white font-black text-sm">{v.title}</p>
                  <p className="text-neutral-500 text-xs mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-500">Our Journey</span>
            <h2 className="text-3xl font-black italic uppercase text-white mt-2">Milestones</h2>
          </div>
          <div className="relative pl-8 border-l border-white/10 space-y-8">
            {milestones.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                className="relative">
                <div className="absolute -left-10 w-4 h-4 rounded-full bg-rose-600 border-2 border-[#0A0A0F] top-1" />
                <div className="glass border border-white/8 rounded-xl p-4">
                  <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{m.year}</span>
                  <p className="text-neutral-300 text-sm mt-1">{m.event}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════════
            REVIEWS SECTION (Amazon/Flipkart style)
        ═══════════════════════════════════════════════════════════ */}
        <section>
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-400">Member Experiences</span>
            <h2 className="text-3xl font-black italic uppercase text-white mt-2">Community Reviews</h2>
            <p className="text-neutral-500 text-sm mt-1">Real opinions from real riders</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin w-8 h-8 text-amber-400" /></div>
          ) : (
            <>
              {/* Summary Card */}
              <div className="glass border border-amber-600/20 rounded-2xl p-6 md:p-8 mb-8">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  {/* Left: Big number */}
                  <div className="text-center">
                    <div className="text-8xl font-black text-white mb-2">{avg || '—'}</div>
                    <StarDisplay rating={Math.round(avg)} size="lg" />
                    <p className="text-neutral-500 text-sm mt-2">{total} {total === 1 ? 'review' : 'reviews'}</p>
                  </div>
                  {/* Right: Distribution bars */}
                  <div className="space-y-2">
                    {distribution.map(d => (
                      <RatingBar key={d.star} star={d.star} count={d.count} total={total} pct={d.pct} />
                    ))}
                  </div>
                </div>
              </div>

              {/* CTA to write review */}
              {currentUser ? (
                !myReview ? (
                  !showForm && (
                    <button onClick={() => setShowForm(true)}
                      className="flex items-center gap-2 mb-6 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black text-sm rounded-xl transition">
                      <Edit3 className="w-4 h-4" /> Write a Review
                    </button>
                  )
                ) : null
              ) : (
                <div className="mb-6 glass border border-white/8 rounded-xl p-4 text-center">
                  <MessageSquare className="w-6 h-6 text-amber-400 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm">Sign in or register to leave a review</p>
                </div>
              )}

              {/* Review form */}
              <AnimatePresence>
                {showForm && !myReview && (
                  <div className="mb-8">
                    <ReviewForm onSuccess={() => { setShowForm(false); loadReviews(); }} onCancel={() => setShowForm(false)} />
                  </div>
                )}
              </AnimatePresence>

              {/* Edit own review */}
              {myReview && (
                <div className="mb-6">
                  {showForm ? (
                    <ReviewForm existingReview={myReview} onSuccess={() => { setShowForm(false); loadReviews(); }} onCancel={() => setShowForm(false)} />
                  ) : (
                    <div className="flex items-center gap-3 px-4 py-3 bg-amber-600/10 border border-amber-600/20 rounded-xl">
                      <Edit3 className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 text-sm font-bold">You've reviewed IBR</span>
                      <StarDisplay rating={myReview.rating} />
                      <button onClick={() => setShowForm(true)} className="ml-auto text-xs text-amber-400 hover:text-amber-300 font-bold">Edit</button>
                    </div>
                  )}
                </div>
              )}

              {/* Filter & Sort Controls */}
              {reviews.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                  <span className="text-xs text-neutral-500 font-bold">Filter:</span>
                  {[0, 5, 4, 3, 2, 1].map(s => (
                    <button key={s} onClick={() => setFilterStar(s)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold transition ${filterStar === s ? 'bg-amber-500 text-black' : 'bg-white/5 text-neutral-400 hover:text-white'}`}>
                      {s === 0 ? 'All' : `${s} ⭐`}
                    </button>
                  ))}
                  <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-neutral-500 font-bold">Sort:</span>
                    <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                      className="bg-neutral-900 border border-neutral-700 text-neutral-300 text-xs rounded-lg px-2 py-1.5 outline-none">
                      <option value="newest">Newest</option>
                      <option value="helpful">Most Helpful</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Review Cards */}
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12 glass border border-white/5 rounded-2xl">
                  <Star className="w-10 h-10 text-neutral-700 mx-auto mb-3" />
                  <p className="text-neutral-500 text-sm">
                    {filterStar > 0 ? `No ${filterStar}-star reviews yet` : 'No reviews yet. Be the first!'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReviews.map(review => (
                    <ReviewCard
                      key={review._id}
                      review={review}
                      currentUser={currentUser}
                      isAdmin={isAdmin}
                      onHelpful={loadReviews}
                      onDelete={deleteReview}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
