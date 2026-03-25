import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle, Send, X, Users, Plus, UserPlus, UserMinus,
  Hash, ChevronRight, ArrowLeft, Loader2, Check, CheckCheck,
  Mic, MicOff, Phone, PhoneOff, Video, MoreVertical, Trash2,
  Star, Reply, Smile, Shield, Radio, Ban, Image as ImageIcon,
  Settings, AlertTriangle, ChevronDown, Volume2, Camera, 
  Forward, Pin, Bell, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { chatAPI } from '../api/index.js';
import { io } from 'socket.io-client';

// ── Voice Recorder Hook ────────────────────────────────────────────
const useVoiceRecorder = (onRecorded) => {
  const [recording, setRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const mediaRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const start = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => onRecorded(reader.result, duration);
        reader.readAsDataURL(blob);
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      setDuration(0);
      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    } catch {
      alert('Microphone access denied');
    }
  }, [onRecorded, duration]);

  const stop = useCallback(() => {
    if (mediaRef.current) { mediaRef.current.stop(); mediaRef.current = null; }
    clearInterval(timerRef.current);
    setRecording(false);
  }, []);

  const cancel = useCallback(() => {
    if (mediaRef.current) {
      mediaRef.current.ondataavailable = null;
      mediaRef.current.onstop = null;
      mediaRef.current.stop();
      mediaRef.current = null;
    }
    clearInterval(timerRef.current);
    chunksRef.current = [];
    setRecording(false);
    setDuration(0);
  }, []);

  return { recording, duration, start, stop, cancel };
};

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

// ── Call Modal ─────────────────────────────────────────────────────
const CallModal = ({ onClose, groupName, memberCount = 0 }) => {
  const [active, setActive] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[2000] bg-black/80 backdrop-blur-xl flex items-center justify-center">
      <motion.div initial={{ scale: 0.85 }} animate={{ scale: 1 }}
        className="bg-[#111118] w-80 rounded-[32px] p-8 text-center border border-white/10 shadow-2xl space-y-6">
        <div className="w-20 h-20 bg-rose-600/20 border-2 border-rose-500/40 rounded-3xl mx-auto flex items-center justify-center">
          <Phone className="w-9 h-9 text-rose-400" />
        </div>
        <div>
          <p className="text-white font-black text-xl">{groupName || 'Voice Call'}</p>
          <p className="text-neutral-500 text-xs mt-1">
            {memberCount > 0 ? `${memberCount} participants` : 'Calling…'}
          </p>
          <p className="text-rose-400 font-mono text-lg mt-2">{fmt(elapsed)}</p>
        </div>
        <div className="flex justify-center gap-6">
          <button onClick={() => setMuted(m => !m)}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition ${muted ? 'bg-rose-700' : 'bg-white/10 hover:bg-white/20'}`}>
            {muted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
          </button>
          <button onClick={onClose} className="w-14 h-14 bg-rose-600 hover:bg-rose-700 rounded-full flex items-center justify-center transition">
            <PhoneOff className="w-6 h-6 text-white" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ── Emoji Picker ─────────────────────────────────────────────────
const QUICK_EMOJIS = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🔥', '🎉', '👑'];
const EmojiPicker = ({ onPick, onClose }) => (
  <motion.div initial={{ opacity: 0, scale: 0.9, y: 8 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
    className="absolute bottom-full right-0 mb-2 bg-[#1a1a2e] border border-white/10 rounded-2xl p-3 shadow-2xl z-50 flex gap-2 flex-wrap min-w-max">
    {QUICK_EMOJIS.map(e => (
      <button key={e} onClick={() => { onPick(e); onClose(); }}
        className="text-xl hover:scale-125 active:scale-110 transition-transform p-1">{e}</button>
    ))}
  </motion.div>
);

// ── Message Bubble ─────────────────────────────────────────────────
const MessageBubble = ({ msg, isMe, isAdmin: userIsAdmin, onReply, onReact, onDelete, onPin, groupId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const isVoice = msg.type === 'voice';
  const isDeleted = msg.isDeleted;

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-1`}>
      <div className={`relative max-w-[78%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Reply preview */}
        {msg.replyTo && (
          <div className="mb-1 px-3 py-1.5 bg-white/5 border-l-2 border-rose-500 rounded-xl text-[10px] text-neutral-500 truncate max-w-full">
            ↩ {msg.replyTo.content || 'Voice message'}
          </div>
        )}
        {/* Username (group) */}
        {!isMe && msg.sender?.username && (
          <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mb-0.5 px-1">{msg.sender.username}</p>
        )}

        <div className={`relative px-4 py-2.5 rounded-2xl ${
          isDeleted ? 'bg-white/5 text-neutral-600 italic' :
          isMe ? 'bg-rose-600 text-white rounded-br-sm' : 'bg-white/8 text-white rounded-bl-sm'
        } group/bubble`}>
          {isVoice && !isDeleted ? (
            <div className="flex items-center gap-3 min-w-[160px]">
              <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Volume2 className="w-4 h-4 text-white" />
              </button>
              <div className="flex-1">
                <audio controls src={msg.voiceUrl} className="h-8 w-full" style={{ minWidth: 140 }} />
              </div>
              <span className="text-[9px] text-white/60">{fmt(msg.voiceDuration || 0)}</span>
            </div>
          ) : (
            <p className="text-sm leading-relaxed break-words">{msg.content}</p>
          )}

          {/* Reactions */}
          {msg.reactions?.length > 0 && (
            <div className="flex gap-1 flex-wrap mt-1.5">
              {Object.entries(
                msg.reactions.reduce((acc, r) => { acc[r.emoji] = (acc[r.emoji] || 0) + 1; return acc; }, {})
              ).map(([emoji, count]) => (
                <span key={emoji} className="bg-white/10 rounded-full px-2 py-0.5 text-xs">{emoji} {count}</span>
              ))}
            </div>
          )}

          {/* Read receipt */}
          {isMe && (
            <div className="flex justify-end mt-0.5">
              <CheckCheck className="w-3 h-3 text-white/40" />
            </div>
          )}
        </div>

        {/* Message actions — show on hover (desktop) / always show button (mobile) */}
        {!isDeleted && (
          <div className={`flex items-center gap-1 mt-1 ${isMe ? 'flex-row-reverse' : 'flex-row'} opacity-0 group-hover:opacity-100 md:opacity-0 opacity-100 transition-opacity`}>
            <button onClick={() => onReply(msg)} className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-white transition">
              <Reply className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <button onClick={() => setShowEmoji(p => !p)} className="p-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-500 hover:text-yellow-400 transition">
                <Smile className="w-3.5 h-3.5" />
              </button>
              <AnimatePresence>
                {showEmoji && <EmojiPicker onPick={e => onReact(msg, e)} onClose={() => setShowEmoji(false)} />}
              </AnimatePresence>
            </div>
            {userIsAdmin && (
              <>
                <button onClick={() => onPin(msg)} className="p-1 rounded-full bg-white/5 hover:bg-amber-600/20 text-neutral-500 hover:text-amber-400 transition" title="Pin">
                  <Pin className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => onDelete(msg)} className="p-1 rounded-full bg-white/5 hover:bg-rose-600/20 text-neutral-500 hover:text-rose-400 transition" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ── Group Settings Panel ───────────────────────────────────────────
const GroupSettings = ({ group, onClose, onUpdate, onDelete, onBanUser, onRemoveMember, availableUsers, onAddMember }) => {
  const [name, setName] = useState(group.name);
  const [mode, setMode] = useState(group.chatMode || 'two-way');
  const [avatarPreview, setAvatarPreview] = useState(group.avatar);
  const [showAddUser, setShowAddUser] = useState(false);
  const fileRef = useRef(null);

  const handleAvatarFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const r = new FileReader();
    r.onloadend = () => { setAvatarPreview(r.result); chatAPI.updateGroupAvatar(group._id, r.result); };
    r.readAsDataURL(file);
  };

  const handleSave = () => {
    onUpdate(group._id, { name, chatMode: mode });
    onClose();
  };

  const notInGroup = availableUsers.filter(u => !group.members?.some(m => (m._id || m) === u._id));

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 p-4 border-b border-white/8">
        <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white"><ArrowLeft className="w-5 h-5" /></button>
        <h3 className="text-white font-black text-sm uppercase tracking-widest">Group Settings</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-rose-500/40 cursor-pointer" onClick={() => fileRef.current?.click()}>
            {avatarPreview?.startsWith('data:image') || avatarPreview?.startsWith('http')
              ? <img src={avatarPreview} className="w-full h-full object-cover" alt="" />
              : <div className="w-full h-full bg-rose-900/30 flex items-center justify-center text-4xl">{avatarPreview || '🏍️'}</div>
            }
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Camera className="w-6 h-6 text-white" />
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarFile} />
          <p className="text-[10px] text-neutral-600 uppercase tracking-widest">Tap to change avatar</p>
        </div>

        {/* Group name */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-1.5 block">Group Name</label>
          <input value={name} onChange={e => setName(e.target.value)}
            className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500"
          />
        </div>

        {/* Chat mode */}
        <div>
          <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600 mb-2 block">Chat Mode</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { val: 'two-way', label: '💬 Two-Way', desc: 'All members can chat' },
              { val: 'one-way', label: '📢 Broadcast', desc: 'Only admin can send' },
            ].map(opt => (
              <button key={opt.val} onClick={() => setMode(opt.val)}
                className={`p-3 rounded-xl border text-left transition ${mode === opt.val ? 'border-rose-500 bg-rose-600/10' : 'border-white/8 bg-white/3 hover:border-white/15'}`}>
                <p className="text-xs font-black text-white">{opt.label}</p>
                <p className="text-[9px] text-neutral-600 mt-0.5">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Members list */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[9px] font-black uppercase tracking-widest text-neutral-600">Members ({group.members?.length})</label>
            <button onClick={() => setShowAddUser(p => !p)}
              className="flex items-center gap-1 text-[9px] font-black text-rose-500 hover:text-rose-400 uppercase tracking-widest">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>

          {/* Add user dropdown */}
          <AnimatePresence>
            {showAddUser && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="mb-3 bg-black/40 border border-white/8 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1">
                {notInGroup.length === 0
                  ? <p className="text-[10px] text-neutral-600 text-center py-2">All members added</p>
                  : notInGroup.map(u => (
                    <button key={u._id} onClick={() => { onAddMember(group._id, u._id); setShowAddUser(false); }}
                      className="w-full flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-xl transition">
                      <div className="w-6 h-6 rounded-full bg-rose-600/20 flex items-center justify-center text-[10px] font-black text-rose-400">
                        {u.username[0]}
                      </div>
                      <span className="text-xs text-white">{u.username}</span>
                    </button>
                  ))
                }
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {group.members?.map(member => {
              const m = member._id ? member : { _id: member, username: member };
              const isGroupAdmin = group.admins?.some(a => (a._id || a).toString() === (m._id || m).toString());
              return (
                <div key={m._id || m} className="flex items-center gap-2 p-2 bg-white/3 rounded-xl">
                  <div className="w-7 h-7 rounded-full bg-rose-600/20 flex items-center justify-center text-[10px] font-black text-rose-400 flex-shrink-0">
                    {(m.username || '?')[0]}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white font-bold">{m.username}</p>
                    {isGroupAdmin && <p className="text-[9px] text-amber-400">Admin</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => onBanUser(m._id || m)}
                      className="p-1 text-neutral-600 hover:text-rose-500 transition" title="Ban user">
                      <Ban className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onRemoveMember(group._id, m._id || m)}
                      className="p-1 text-neutral-600 hover:text-orange-500 transition" title="Remove from group">
                      <UserMinus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Danger zone */}
        <div className="pt-3 border-t border-white/5">
          <p className="text-[9px] font-black uppercase tracking-widest text-red-600 mb-2">Danger Zone</p>
          <button onClick={() => { if (window.confirm('Delete this group?')) onDelete(group._id); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-900/20 border border-red-700/30 rounded-xl text-red-400 hover:bg-red-900/30 transition text-xs font-black uppercase tracking-widest">
            <Trash2 className="w-4 h-4" /> Delete Group
          </button>
        </div>
      </div>
      <div className="p-4 border-t border-white/8">
        <button onClick={handleSave}
          className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition">
          Save Changes
        </button>
      </div>
    </div>
  );
};

// ── Main ChatSystem ────────────────────────────────────────────────
export default function ChatSystem() {
  const { currentUser, isAdmin } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('threads');
  const [groups, setGroups] = useState([]);
  const [dmThread, setDmThread] = useState({ messages: [], admin: null });
  const [dmThreads, setDmThreads] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [activeDMUser, setActiveDMUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const [replyTo, setReplyTo] = useState(null);
  const [createGroup, setCreateGroup] = useState({ name: '', avatar: '🏍️', isPublic: false, chatMode: 'two-way' });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const messagesEndRef = useRef(null);
  const panelRef = useRef(null);
  const constraintsRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleVoiceRecorded = useCallback(async (dataUrl, dur) => {
    if (!dataUrl) return;
    const data = { type: 'voice', voiceUrl: dataUrl, voiceDuration: dur, content: '🎤 Voice message', replyTo: replyTo?._id };
    try {
      let msg;
      if (activeGroup) msg = await chatAPI.sendGroupMessage(activeGroup._id, data);
      else if (activeDMUser || dmThread.admin) {
        msg = await chatAPI.sendDM({ ...data, recipientId: activeDMUser?._id || dmThread.admin?._id });
      }
      if (msg?.data) { setMessages(p => [...p, msg.data]); setReplyTo(null); }
    } catch {}
  }, [activeGroup, activeDMUser, dmThread, replyTo]);

  const { recording, duration: recDuration, start: startRec, stop: stopRec, cancel: cancelRec } = useVoiceRecorder(handleVoiceRecorded);

  // Socket
  useEffect(() => {
    if (!currentUser) return;
    const s = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000', {
      auth: { token: localStorage.getItem('ibr_token') }
    });
    setSocket(s);
    s.emit('join', { userId: currentUser._id, groupIds: [] });

    s.on('new_message', (msg) => {
      setMessages(prev => [...prev, msg]);
      if (!isOpen) setUnread(u => u + 1);
    });
    s.on('new_group_message', (msg) => {
      const gid = msg.group?._id || msg.group;
      if (activeGroup && (gid === activeGroup._id || gid?.toString() === activeGroup._id?.toString())) setMessages(prev => [...prev, msg]);
      else if (!isOpen) setUnread(u => u + 1);
    });
    s.on('message_deleted', ({ messageId }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, isDeleted: true, content: '🚫 Message deleted by admin' } : m));
    });
    s.on('group_deleted', ({ groupId }) => {
      setGroups(prev => prev.filter(g => g._id !== groupId));
      if (activeGroup?._id === groupId) { setActiveGroup(null); setView('threads'); }
    });
    s.on('group_mode_changed', ({ groupId, chatMode }) => {
      setGroups(prev => prev.map(g => g._id === groupId ? { ...g, chatMode } : g));
      if (activeGroup?._id === groupId) setActiveGroup(prev => ({ ...prev, chatMode }));
    });
    s.on('reaction_updated', ({ messageId, reactions }) => {
      setMessages(prev => prev.map(m => m._id === messageId ? { ...m, reactions } : m));
    });
    s.on('account_banned', () => { alert('Your account has been suspended by admin.'); });

    return () => s.disconnect();
  }, [currentUser, isAdmin]);

  // Load
  useEffect(() => {
    if (!currentUser) return;
    chatAPI.getMyGroups().then(r => setGroups(r.data || [])).catch(() => {});
    if (!isAdmin) chatAPI.getMyAdminThread().then(r => setDmThread(r.data || { messages: [], admin: null })).catch(() => {});
    if (isAdmin) chatAPI.getAllDMThreads().then(r => setDmThreads(r.data || [])).catch(() => {});
    chatAPI.getAvailableUsers().then(r => setAvailableUsers(r.data || [])).catch(() => {});
  }, [currentUser, isAdmin]);

  // Load messages on chat open
  useEffect(() => {
    if (activeGroup) {
      chatAPI.getGroupMessages(activeGroup._id).then(r => { setMessages(r.data || []); setView('group'); }).catch(() => {});
      socket?.emit('join_group', activeGroup._id);
    }
  }, [activeGroup]);

  useEffect(() => {
    if (activeDMUser) {
      chatAPI.getDMConversation(activeDMUser._id).then(r => { setMessages(r.data || []); setView('dm'); }).catch(() => {});
    }
  }, [activeDMUser]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Close panel on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setIsOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const data = { content: input, type: 'text', replyTo: replyTo?._id };
    setInput(''); setReplyTo(null);
    try {
      let msg;
      if (activeGroup) msg = await chatAPI.sendGroupMessage(activeGroup._id, data);
      else if (activeDMUser) msg = await chatAPI.sendDM({ ...data, recipientId: activeDMUser._id });
      else if (dmThread.admin) msg = await chatAPI.sendDM({ ...data, recipientId: dmThread.admin._id });
      if (msg?.data) setMessages(p => [...p, msg.data]);
    } catch {}
  };

  const handleReact = async (msg, emoji) => {
    if (!activeGroup) return;
    try { await chatAPI.reactToMessage(activeGroup._id, msg._id, emoji); } catch {}
  };

  const handleDeleteMsg = async (msg) => {
    if (!isAdmin) return;
    try {
      if (activeGroup) await chatAPI.deleteGroupMessage(activeGroup._id, msg._id);
      else await chatAPI.deleteMessage(msg._id);
    } catch {}
  };

  const handlePinMsg = async (msg) => {
    if (!isAdmin || !activeGroup) return;
    try { await chatAPI.pinMessage(activeGroup._id, msg._id); } catch {}
  };

  const handleBanUser = async (userId) => {
    if (!window.confirm('Ban this user?')) return;
    try { await chatAPI.banUser(userId); alert('User banned.'); } catch {}
  };

  const handleGroupUpdate = async (groupId, data) => {
    try {
      const res = await chatAPI.updateGroup(groupId, data);
      setGroups(prev => prev.map(g => g._id === groupId ? res.data : g));
      setActiveGroup(prev => ({ ...prev, ...data }));
      if (data.chatMode) await chatAPI.setGroupMode(groupId, data.chatMode);
    } catch {}
  };

  const handleGroupDelete = async (groupId) => {
    try { await chatAPI.deleteGroup(groupId); setGroups(prev => prev.filter(g => g._id !== groupId)); goBack(); } catch {}
  };

  const handleCreateGroup = async () => {
    if (!createGroup.name.trim()) return;
    try {
      const res = await chatAPI.createGroup({ ...createGroup, members: selectedMembers });
      setGroups(prev => [...prev, res.data]);
      setView('threads'); setCreateGroup({ name: '', avatar: '🏍️', isPublic: false, chatMode: 'two-way' }); setSelectedMembers([]);
    } catch {}
  };

  const goBack = () => { setView('threads'); setActiveGroup(null); setActiveDMUser(null); setMessages([]); setShowGroupSettings(false); setReplyTo(null); };

  const isBroadcastOnly = activeGroup?.chatMode === 'one-way' && !isAdmin &&
    !activeGroup.admins?.some(a => (a._id || a).toString() === currentUser?._id?.toString());

  if (!currentUser) return null;
  const emojis = ['🏍️', '⚡', '🔥', '💨', '🛣️', '🌄', '☠️', '🤝'];

  return (
    <>
      <div ref={constraintsRef} className="fixed inset-0 pointer-events-none z-[790]" />

      {/* Draggable FAB */}
      <motion.div drag dragConstraints={constraintsRef} dragElastic={0.1} dragMomentum={false}
        className="fixed bottom-24 right-6 z-[800] cursor-grab active:cursor-grabbing" style={{ touchAction: 'none' }}>
        <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.95 }}
          onClick={() => { setIsOpen(p => !p); setUnread(0); }}
          className="w-14 h-14 bg-rose-600 rounded-full flex items-center justify-center shadow-2xl shadow-rose-900 relative select-none">
          {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-black text-xs font-black w-5 h-5 rounded-full flex items-center justify-center">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </motion.button>
      </motion.div>

      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div ref={panelRef}
            initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 right-6 z-[800] w-80 sm:w-96 h-[580px] bg-[#111118] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden">

            {/* ── HEADER ── */}
            <div className="flex items-center justify-between p-4 border-b border-white/8 bg-black/40 shrink-0">
              {(view === 'group' || view === 'dm' || view === 'create-group') && (
                <button onClick={goBack} className="p-1 text-neutral-400 hover:text-white mr-2">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                {view === 'threads' && <><MessageCircle className="w-4 h-4 text-rose-500 shrink-0" /><span className="text-white font-black text-sm uppercase tracking-widest">Messages</span></>}
                {view === 'group' && activeGroup && (
                  <>
                    <div className="w-7 h-7 rounded-xl bg-rose-900/40 border border-rose-500/30 flex items-center justify-center text-sm shrink-0 overflow-hidden">
                      {activeGroup.avatar?.startsWith('data:') || activeGroup.avatar?.startsWith('http')
                        ? <img src={activeGroup.avatar} className="w-full h-full object-cover" alt="" />
                        : <span>{activeGroup.avatar || '🏍️'}</span>}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-black text-xs truncate">{activeGroup.name}</p>
                      {activeGroup.chatMode === 'one-way' && (
                        <div className="flex items-center gap-1"><Radio className="w-2.5 h-2.5 text-amber-400" /><span className="text-[8px] text-amber-400 font-bold">BROADCAST</span></div>
                      )}
                    </div>
                  </>
                )}
                {view === 'dm' && activeDMUser && <><span className="text-xs text-neutral-300 font-bold truncate">{activeDMUser.username}</span></>}
                {view === 'dm' && !activeDMUser && <><Shield className="w-4 h-4 text-amber-400 shrink-0" /><span className="text-white font-black text-xs">Admin Messages</span></>}
                {view === 'create-group' && <span className="text-white font-black text-sm">New Group</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {(view === 'group' || (view === 'dm' && activeDMUser)) && (
                  <button onClick={() => setShowCall(true)} className="p-1.5 text-neutral-500 hover:text-green-400 transition">
                    <Phone className="w-4 h-4" />
                  </button>
                )}
                {view === 'group' && isAdmin && (
                  <button onClick={() => setShowGroupSettings(p => !p)} className="p-1.5 text-neutral-500 hover:text-white transition">
                    <Settings className="w-4 h-4" />
                  </button>
                )}
                {view === 'threads' && isAdmin && (
                  <button onClick={() => setView('create-group')} className="p-1.5 text-neutral-500 hover:text-rose-500 transition">
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* ── GROUP SETTINGS OVERLAY ── */}
            {showGroupSettings && activeGroup && (
              <div className="absolute inset-0 bg-[#111118] z-10 flex flex-col">
                <GroupSettings
                  group={activeGroup}
                  onClose={() => setShowGroupSettings(false)}
                  onUpdate={handleGroupUpdate}
                  onDelete={handleGroupDelete}
                  onBanUser={handleBanUser}
                  onRemoveMember={(gid, uid) => chatAPI.removeGroupMember(gid, uid).then(() =>
                    setActiveGroup(prev => ({ ...prev, members: prev.members.filter(m => (m._id || m) !== uid) })))}
                  availableUsers={availableUsers}
                  onAddMember={(gid, uid) => chatAPI.addGroupMember(gid, uid).then(r => setActiveGroup(r.data))}
                />
              </div>
            )}

            {/* ── BODY ── */}
            {view === 'threads' && (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {/* DM: group threads for admin, or single admin chat for user */}
                {isAdmin ? (
                  <>
                    <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-2 mb-1">Direct Messages</p>
                    {dmThreads.length === 0 && <p className="text-center text-neutral-700 py-4 text-xs">No messages yet</p>}
                    {dmThreads.map(t => (
                      <button key={t.user._id} onClick={() => { setActiveDMUser(t.user); setView('dm'); }}
                        className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition text-left active:bg-white/5">
                        <div className="w-9 h-9 rounded-full bg-rose-600/20 border border-rose-500/30 flex items-center justify-center font-black text-rose-400 text-sm shrink-0">
                          {t.user.username?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-bold truncate">{t.user.username}</p>
                          <p className="text-neutral-600 text-[10px] truncate">{t.lastMessage?.content?.slice(0, 40)}</p>
                        </div>
                        {t.unread > 0 && <span className="w-5 h-5 bg-rose-600 rounded-full text-white text-[9px] font-black flex items-center justify-center">{t.unread}</span>}
                      </button>
                    ))}
                  </>
                ) : dmThread.admin && (
                  <button onClick={() => setView('dm')}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition text-left active:bg-white/5 mb-2">
                    <div className="w-9 h-9 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-amber-400 font-black text-xs">Admin Chat</p>
                      <p className="text-neutral-600 text-[10px]">Message the admin</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                  </button>
                )}

                {/* Groups */}
                <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-2 mt-3 mb-1">Group Chats</p>
                {groups.length === 0 && <p className="text-center text-neutral-700 py-2 text-xs">No groups yet</p>}
                {groups.map(g => (
                  <button key={g._id} onClick={() => setActiveGroup(g)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition text-left active:bg-white/5">
                    <div className="w-9 h-9 rounded-xl bg-rose-900/30 border border-rose-500/20 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                      {g.avatar?.startsWith('data:') || g.avatar?.startsWith('http')
                        ? <img src={g.avatar} className="w-full h-full object-cover" alt="" />
                        : <span>{g.avatar || '🏍️'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-white text-xs font-bold truncate">{g.name}</p>
                        {g.chatMode === 'one-way' && <Radio className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                      </div>
                      <p className="text-neutral-600 text-[10px]">{g.members?.length} members</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-neutral-600" />
                  </button>
                ))}
              </div>
            )}

            {/* ── CREATE GROUP ── */}
            {view === 'create-group' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-1.5 block">Group Name *</label>
                  <input value={createGroup.name} onChange={e => setCreateGroup(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Darjeeling Raiders"
                    className="w-full bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-rose-500 transition"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2 block">Avatar</label>
                  <div className="flex flex-wrap gap-2">
                    {emojis.map(e => (
                      <button key={e} onClick={() => setCreateGroup(p => ({ ...p, avatar: e }))}
                        className={`w-10 h-10 rounded-xl border text-lg transition ${createGroup.avatar === e ? 'border-rose-500 bg-rose-600/20' : 'border-white/8 bg-white/3 hover:border-white/20'}`}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2 block">Chat Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[{ val: 'two-way', label: '💬 Two-Way' }, { val: 'one-way', label: '📢 Broadcast' }].map(opt => (
                      <button key={opt.val} onClick={() => setCreateGroup(p => ({ ...p, chatMode: opt.val }))}
                        className={`p-2 rounded-xl border text-xs font-black transition ${createGroup.chatMode === opt.val ? 'border-rose-500 bg-rose-600/10 text-white' : 'border-white/8 text-neutral-500 hover:border-white/15'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-[0.3em] text-neutral-600 mb-2 block">Add Members</label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                    {availableUsers.map(u => (
                      <button key={u._id}
                        onClick={() => setSelectedMembers(p => p.includes(u._id) ? p.filter(id => id !== u._id) : [...p, u._id])}
                        className={`w-full flex items-center gap-2 p-2 rounded-xl border text-left transition ${selectedMembers.includes(u._id) ? 'border-rose-500 bg-rose-600/10' : 'border-white/5 bg-white/3 hover:bg-white/5'}`}>
                        <Check className={`w-3.5 h-3.5 transition ${selectedMembers.includes(u._id) ? 'text-rose-500' : 'text-transparent'}`} />
                        <span className="text-xs text-white">{u.username}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={handleCreateGroup}
                  className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest rounded-xl transition">
                  Create Group
                </button>
              </div>
            )}

            {/* ── MESSAGE VIEW (DM or Group) ── */}
            {(view === 'dm' || view === 'group') && (
              <>
                {/* Broadcast badge */}
                {isBroadcastOnly && (
                  <div className="shrink-0 flex items-center justify-center gap-2 py-2 bg-amber-900/20 border-b border-amber-700/20">
                    <Radio className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] text-amber-300 font-bold">Broadcast mode — only admin can send</span>
                  </div>
                )}

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
                  {messages.length === 0 && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-neutral-700 text-xs uppercase tracking-widest">No messages yet</p>
                    </div>
                  )}
                  {messages.map((msg) => (
                    <MessageBubble
                      key={msg._id}
                      msg={msg}
                      isMe={msg.sender?._id === currentUser._id || msg.sender === currentUser._id}
                      isAdmin={isAdmin}
                      onReply={(m) => setReplyTo(m)}
                      onReact={handleReact}
                      onDelete={handleDeleteMsg}
                      onPin={handlePinMsg}
                      groupId={activeGroup?._id}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Reply preview */}
                {replyTo && (
                  <div className="shrink-0 mx-3 mb-1 flex items-center gap-2 px-3 py-2 bg-rose-900/20 border border-rose-500/20 rounded-xl text-xs">
                    <Reply className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span className="text-neutral-400 truncate flex-1">{replyTo.content || 'Voice message'}</span>
                    <button onClick={() => setReplyTo(null)} className="text-neutral-600 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Input area */}
                {!isBroadcastOnly && (
                  <div className="shrink-0 p-3 border-t border-white/8">
                    {recording ? (
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        <span className="text-rose-400 font-mono text-sm flex-1">{fmt(recDuration)}</span>
                        <button onClick={cancelRec} className="p-2 text-neutral-500 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                        <button onClick={stopRec} className="p-2 bg-rose-600 rounded-xl text-white">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-center">
                        <input
                          value={input}
                          onChange={e => setInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                          placeholder="Type a message…"
                          className="flex-1 bg-white/5 border border-white/8 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-600 outline-none focus:border-rose-500 transition"
                        />
                        <button onClick={startRec} className="p-2 text-neutral-500 hover:text-rose-400 transition active:scale-95" title="Voice message">
                          <Mic className="w-4 h-4" />
                        </button>
                        {input.trim() ? (
                          <button onClick={sendMessage} className="p-2 bg-rose-600 rounded-xl text-white active:scale-95 transition">
                            <Send className="w-4 h-4" />
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Call modal */}
      <AnimatePresence>
        {showCall && (
          <CallModal
            onClose={() => setShowCall(false)}
            groupName={activeGroup?.name || activeDMUser?.username}
            memberCount={activeGroup?.members?.length || 2}
          />
        )}
      </AnimatePresence>
    </>
  );
}
