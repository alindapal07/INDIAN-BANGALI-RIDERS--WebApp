import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, CheckCheck, AlertCircle, MessageSquare, Heart, Megaphone, Image, BookOpen } from 'lucide-react';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext.jsx';

const API = import.meta.env.VITE_API_URL;
const token = () => localStorage.getItem('ibr_token');
const api = (path, opts = {}) => axios({ url: `${API}${path}`, headers: { Authorization: `Bearer ${token()}` }, ...opts });

const TYPE_ICON = {
  like: <Heart className="w-3.5 h-3.5 text-rose-400" />,
  comment: <MessageSquare className="w-3.5 h-3.5 text-blue-400" />,
  message: <MessageSquare className="w-3.5 h-3.5 text-green-400" />,
  group_message: <MessageSquare className="w-3.5 h-3.5 text-purple-400" />,
  story_upload: <Image className="w-3.5 h-3.5 text-amber-400" />,
  post_upload: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
  approval: <CheckCheck className="w-3.5 h-3.5 text-green-400" />,
  announcement: <Megaphone className="w-3.5 h-3.5 text-amber-400" />,
};

const NotificationBell = () => {
  const { currentUser } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const socketRef = useRef(null);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadNotifications = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data } = await api('/notifications');
      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    if (!currentUser) return;
    loadNotifications();

    // Real-time
    const s = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = s;
    s.emit('join', { userId: currentUser._id });
    s.on('notification', (notif) => {
      setNotifications(prev => [notif, ...prev]);
      setUnread(prev => prev + 1);
    });
    return () => s.disconnect();
  }, [currentUser]);

  const markAllRead = async () => {
    try {
      await api('/notifications/read', { method: 'PUT' });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnread(0);
    } catch {}
  };

  if (!currentUser) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={() => { setOpen(p => !p); if (!open) loadNotifications(); }}
        className="relative p-2 md:p-2.5 glass rounded-full border border-white/5 text-neutral-400 hover:text-white transition-all hover:border-rose-500/30">
        <Bell className="w-4 h-4 md:w-5 md:h-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] glass border border-white/10 rounded-2xl shadow-2xl bg-black/95 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/8">
              <p className="text-xs font-black uppercase tracking-widest text-white">Notifications</p>
              <div className="flex items-center gap-2">
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[9px] text-rose-400 hover:text-rose-300 font-bold uppercase tracking-widest">
                    Mark all read
                  </button>
                )}
                <button onClick={() => setOpen(false)} className="text-neutral-600 hover:text-white transition">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8 text-neutral-600">Loading…</div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center py-10 text-neutral-600">
                  <Bell className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-xs">No notifications yet</p>
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n._id} className={`flex items-start gap-3 px-4 py-3 border-b border-white/4 transition hover:bg-white/3 ${!n.isRead ? 'bg-rose-600/5' : ''}`}>
                    <div className="w-7 h-7 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {TYPE_ICON[n.type] || <AlertCircle className="w-3.5 h-3.5 text-neutral-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white leading-snug">{n.title}</p>
                      {n.body && <p className="text-[10px] text-neutral-500 mt-0.5 truncate">{n.body}</p>}
                      <p className="text-[9px] text-neutral-700 mt-1">{new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    {!n.isRead && <div className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" />}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
