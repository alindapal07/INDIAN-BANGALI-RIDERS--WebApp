import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Terminal, Users, Image, BookOpen, Bike, MapPin, Layout, Calendar,
  Trash2, Plus, BarChart3, Loader2, Zap, Eye, EyeOff, Upload, Grid,
  Settings, Globe, ChevronDown, RefreshCw, Check, X, Edit3, Shield,
  UserCheck, UserX, Clock, MessageSquare, LogOut, Home, ChevronRight, KeySquare, Lock, Mail
} from 'lucide-react';
import {
  aiAPI, ridersAPI, journeysAPI, postsAPI, placesAPI,
  heroSlidesAPI, bookingsAPI, storiesAPI, highlightsAPI, authAPI, chatAPI
} from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import ChatSystem from './ChatSystem.jsx';


const Req = () => <span className="text-rose-500 ml-0.5">*</span>;

const AdminDashboard = ({ onRefresh, user, onLogout }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({});
  const [members, setMembers] = useState({ pending: [], approved: [], rejected: [], total: 0 });
  const [memberFilter, setMemberFilter] = useState('pending');
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [uiSettings, setUiSettings] = useState({
    showHero: true, showGallery: true, showStories: true,
    showHighlights: true, showMembers: true, showJourneys: true,
  });
  const { logout } = useAuth();

  // Admin MPIN Recovery state
  const [recoveryStep, setRecoveryStep] = useState(0);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ otp: '', newPassword: '', newMpin: '' });
  const [recoveryMsg, setRecoveryMsg] = useState('');

  const tabs = [
    { id: 'analytics', label: t('analytics'), icon: BarChart3 },
    { id: 'members', label: 'Members', icon: Users, badge: members.pending?.length || 0 },
    { id: 'riders', label: t('riders'), icon: Bike },
    { id: 'journeys', label: t('journey_tab'), icon: Calendar },
    { id: 'posts', label: t('posts'), icon: Image },
    { id: 'places', label: t('places'), icon: MapPin },
    { id: 'hero', label: t('hero_slides'), icon: Layout },
    { id: 'bookings', label: t('bookings'), icon: BookOpen },
    { id: 'stories', label: t('stories'), icon: Zap },
    { id: 'highlights', label: t('highlights'), icon: Eye },
    { id: 'group-chat', label: 'Group Chat', icon: MessageSquare },
    { id: 'ui-settings', label: t('ui_settings'), icon: Settings },
    { id: 'security', label: 'Security', icon: KeySquare },
  ];

  // Admin Recovery Handlers
  const handleAdminRequestOTP = async () => {
    setRecoveryLoading(true); setRecoveryMsg('');
    try {
      await authAPI.requestRecoveryOTP(user?.email);
      setRecoveryStep(1);
      setRecoveryMsg('✅ Recovery OTP sent to your email!');
    } catch (err) {
      setRecoveryMsg('❌ ' + (err.response?.data?.error || 'Failed to send OTP'));
    }
    setRecoveryLoading(false);
  };

  const handleAdminResetCredentials = async () => {
    if (!recoveryForm.otp) { setRecoveryMsg('❌ Please enter the OTP'); return; }
    if (!recoveryForm.newPassword && !recoveryForm.newMpin) { setRecoveryMsg('❌ Enter a new password or MPIN'); return; }
    if (recoveryForm.newMpin && (recoveryForm.newMpin.length !== 6 || !/^\d+$/.test(recoveryForm.newMpin))) {
      setRecoveryMsg('❌ MPIN must be exactly 6 digits'); return;
    }
    setRecoveryLoading(true); setRecoveryMsg('');
    try {
      await authAPI.resetCredentials({
        email: user?.email,
        otp: recoveryForm.otp,
        newPassword: recoveryForm.newPassword || undefined,
        newMpin: recoveryForm.newMpin || undefined
      });
      setRecoveryStep(2);
      setRecoveryMsg('✅ Credentials updated! Please re-login.');
      setRecoveryForm({ otp: '', newPassword: '', newMpin: '' });
    } catch (err) {
      setRecoveryMsg('❌ ' + (err.response?.data?.error || 'Reset failed'));
    }
    setRecoveryLoading(false);
  };

  const loadMembers = useCallback(async () => {
    try { const res = await authAPI.getMembers(); setMembers(res.data); } catch {}
  }, []);

  const handleApprove = useCallback(async (userId) => {
    try { await authAPI.approveUser(userId); await loadMembers(); } catch {}
  }, [loadMembers]);

  const handleBan = useCallback(async (userId) => {
    if (!window.confirm('Are you sure you want to ban this member?')) return;
    try { await authAPI.banMember(userId); await loadMembers(); } catch {}
  }, [loadMembers]);

  const handleRemoveMember = useCallback(async (userId, username) => {
    if (!window.confirm(`Permanently DELETE "${username}"? This cannot be undone and will remove all their data.`)) return;
    try {
      await authAPI.removeMember(userId);
      alert(`Member "${username}" has been permanently deleted.`);
      await loadMembers();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  }, [loadMembers]);

  const handleReject = useCallback(async () => {
    if (!rejectTarget) return;
    try {
      await authAPI.rejectUser(rejectTarget, rejectReason);
      setRejectTarget(null); setRejectReason('');
      await loadMembers();
    } catch {}
  }, [rejectTarget, rejectReason, loadMembers]);

  useEffect(() => {
    if (activeTab === 'analytics') {
      loadAnalytics();
      const interval = setInterval(loadAnalytics, 15000);
      return () => clearInterval(interval);
    } else if (activeTab === 'members') {
      loadMembers();
    } else if (activeTab !== 'ui-settings') {
      loadItems();
    }
  }, [activeTab, loadMembers]);


  // Load saved UI settings from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ibr_ui_settings') || '{}');
      if (Object.keys(saved).length > 0) setUiSettings(prev => ({ ...prev, ...saved }));
    } catch {}
  }, []);

  const saveUiSettings = (settings) => {
    localStorage.setItem('ibr_ui_settings', JSON.stringify(settings));
    // dispatch custom event so App.jsx can react dynamically
    window.dispatchEvent(new CustomEvent('ibr-ui-settings', { detail: settings }));
  };

  const toggleUiSetting = (key) => {
    const next = { ...uiSettings, [key]: !uiSettings[key] };
    setUiSettings(next);
    saveUiSettings(next);
  };

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const res = await aiAPI.getAnalytics();
      setAnalytics(res.data);
    } catch {}
    setLoading(false);
  };

  const loadItems = async () => {
    setLoading(true);
    try {
      const apis = {
        riders: ridersAPI.getAll,
        journeys: journeysAPI.getAll,
        posts: postsAPI.getAll,
        places: placesAPI.getAll,
        hero: heroSlidesAPI.getAll,
        bookings: bookingsAPI.getAll,
        stories: storiesAPI.getAll,
        highlights: highlightsAPI.getAll,
      };
      const res = await apis[activeTab]();
      setItems(res.data || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirm_delete'))) return;
    const apis = {
      riders: ridersAPI.delete,
      journeys: journeysAPI.delete,
      posts: postsAPI.delete,
      places: placesAPI.delete,
      hero: heroSlidesAPI.delete,
      bookings: bookingsAPI.delete,
      stories: storiesAPI.delete,
      highlights: highlightsAPI.delete,
    };
    try {
      await apis[activeTab](id);
      loadItems();
      onRefresh();
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAdd = async () => {
    setLoading(true);
    try {
      const creators = {
        riders: () => ridersAPI.create({
          name: form.name,
          bike: form.bike,
          image: form.image || `https://picsum.photos/seed/${Date.now()}/400/500`,
          category: form.category || 'community'
        }),
        journeys: () => journeysAPI.create({
          title: form.title,
          date: form.date,
          route: form.route,
          description: form.description || '',
          price: form.price || '0',
          coverPhoto: form.coverPhoto || '',
          photos: form.photos || []
        }),

        posts: () => postsAPI.create({
          type: form.type || 'photo',
          imageUrl: form.imageUrl,
          description: form.description || ''
        }),
        places: () => placesAPI.create({
          name: form.name,
          description: form.description || '',
          coverImage: form.coverImage || `https://picsum.photos/seed/${Date.now()}/800/600`
        }),
        hero: () => heroSlidesAPI.create({
          image: form.image,
          title: form.title || 'OWN THE ROAD',
          subtitle: form.subtitle || 'IBR PACK'
        }),
        stories: () => storiesAPI.create({
          type: form.type || 'image',
          url: form.url,
          thumbnail: form.thumbnail || form.url
        }),
        highlights: () => highlightsAPI.create({
          image: form.image,
          title: form.title,
          link: form.link || '#'
        }),
      };
      if (creators[activeTab]) await creators[activeTab]();
      setForm({});
      loadItems();
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || t('add_failed'));
    }
    setLoading(false);
  };

  const inp = 'bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-rose-500 text-white w-full placeholder-neutral-600 transition-colors';
  const sel = 'bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-3.5 text-sm font-bold outline-none focus:border-rose-500 text-white w-full transition-colors';

  const statCards = analytics ? [
    { label: t('pack_members'), value: analytics.riders ?? 0, icon: Users, color: 'from-rose-600 to-rose-900' },
    { label: t('expeditions'), value: analytics.journeys ?? 0, icon: Calendar, color: 'from-blue-600 to-blue-900' },
    { label: t('media_posts'), value: analytics.posts ?? 0, icon: Image, color: 'from-purple-600 to-purple-900' },
    { label: t('bookings'), value: analytics.bookings ?? 0, icon: BookOpen, color: 'from-amber-600 to-amber-900' },
    { label: t('stories'), value: analytics.stories ?? 0, icon: Zap, color: 'from-green-600 to-green-900' },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <p className="text-rose-500 text-[10px] uppercase tracking-[0.5em] font-black">{t('authorized_only')}</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">{t('command_center')}</h2>
          <p className="text-neutral-500 text-sm mt-2">
            {t('logged_in_as')} <span className="text-rose-400 font-bold">{user?.username}</span>
            <span className="ml-3 text-[9px] px-2 py-0.5 rounded-full bg-rose-600/20 text-rose-400 font-black uppercase tracking-widest">Admin</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAnalytics}
            className="p-3 glass border border-white/5 rounded-full text-neutral-500 hover:text-white hover:border-rose-500/30 transition-all"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => { logout(); onLogout?.(); }}
            className="px-8 py-3 border border-rose-600/40 text-rose-500 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
          >
            {t('logout')}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-12 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${
              activeTab === tab.id
                ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'glass text-neutral-500 hover:text-white border border-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />{tab.label}
            {tab.badge > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 text-black text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {tab.badge > 9 ? '9+' : tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>


      {/* Members / Approval Tab */}
      {activeTab === 'members' && (
        <div>
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Pending', count: members.pending?.length, color: 'from-amber-600 to-amber-900', icon: Clock, id: 'pending' },
              { label: 'Approved', count: members.approved?.length, color: 'from-green-600 to-green-900', icon: UserCheck, id: 'approved' },
              { label: 'Rejected', count: members.rejected?.length, color: 'from-neutral-700 to-neutral-900', icon: UserX, id: 'rejected' },
              { label: 'Banned', count: members.banned?.length, color: 'from-red-600 to-red-900', icon: Shield, id: 'banned' },
            ].map(s => (
              <motion.button key={s.id} whileHover={{ y: -4 }} onClick={() => setMemberFilter(s.id)}
                className={`bg-gradient-to-br ${s.color} rounded-2xl p-6 text-white text-left relative border-2 transition-all ${memberFilter === s.id ? 'border-white/30' : 'border-transparent'}`}>
                <s.icon className="w-6 h-6 mb-3 opacity-70" />
                <div className="text-4xl font-black">{s.count || 0}</div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70 mt-1">{s.label}</div>
              </motion.button>
            ))}
          </div>

          {/* User List */}
          <div className="space-y-3">
            {(members[memberFilter] || []).length === 0 ? (
              <div className="text-center py-16 text-neutral-600">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>No {memberFilter} members</p>
              </div>
            ) : (members[memberFilter] || []).map(u => (
              <motion.div key={u._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className="glass border border-white/8 rounded-2xl p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-rose-600/20 border border-rose-600/40 flex items-center justify-center text-rose-400 text-lg font-black flex-shrink-0">
                  {u.username?.[0]?.toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{u.username}</p>
                  <p className="text-neutral-500 text-xs truncate">{u.email}</p>
                  <p className="text-neutral-700 text-[10px] mt-0.5">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                  u.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                  u.status === 'rejected' ? 'bg-neutral-800 text-neutral-500' :
                  'bg-amber-600/20 text-amber-400'
                }`}>{u.status}</div>
                <div className="flex gap-2 flex-shrink-0">
                  {memberFilter === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(u._id)}
                        className="w-9 h-9 bg-green-600/20 hover:bg-green-600 border border-green-600/40 rounded-xl flex items-center justify-center transition group" title="Approve">
                        <UserCheck className="w-4 h-4 text-green-400 group-hover:text-white" />
                      </button>
                      <button onClick={() => setRejectTarget(u._id)}
                        className="w-9 h-9 bg-red-600/20 hover:bg-red-600 border border-red-600/40 rounded-xl flex items-center justify-center transition group" title="Reject">
                        <UserX className="w-4 h-4 text-red-400 group-hover:text-white" />
                      </button>
                    </>
                  )}
                  {memberFilter === 'approved' && (
                    <button onClick={() => handleBan(u._id)}
                      className="w-9 h-9 bg-amber-600/20 hover:bg-amber-600 border border-amber-600/40 rounded-xl flex items-center justify-center transition group" title="Ban Member">
                      <Shield className="w-4 h-4 text-amber-400 group-hover:text-white" />
                    </button>
                  )}
                  {memberFilter === 'banned' && (
                    <button onClick={() => handleApprove(u._id)}
                      className="w-9 h-9 bg-green-600/20 hover:bg-green-600 border border-green-600/40 rounded-xl flex items-center justify-center transition group" title="Unban Member">
                      <UserCheck className="w-4 h-4 text-green-400 group-hover:text-white" />
                    </button>
                  )}
                  <button onClick={() => handleRemoveMember(u._id, u.username)}
                    className="w-9 h-9 bg-rose-600/20 hover:bg-rose-600 border border-rose-600/40 rounded-xl flex items-center justify-center transition group" title="Permanently Delete Member">
                    <Trash2 className="w-4 h-4 text-rose-400 group-hover:text-white" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Reject Reason Modal */}
          <AnimatePresence>
            {rejectTarget && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
                onClick={() => setRejectTarget(null)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                  className="bg-[#111118] border border-white/10 rounded-3xl p-8 max-w-md w-full" onClick={e => e.stopPropagation()}>
                  <h3 className="text-xl font-black text-white mb-2">Reject Member</h3>
                  <p className="text-neutral-500 text-sm mb-6">An email will be sent to the user explaining the rejection.</p>
                  <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                    placeholder="Reason for rejection (optional)"
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white resize-none outline-none focus:border-rose-500 mb-4" />
                  <div className="flex gap-3">
                    <button onClick={() => setRejectTarget(null)} className="flex-1 py-3 border border-white/10 rounded-xl text-neutral-400 text-sm font-bold hover:text-white transition">Cancel</button>
                    <button onClick={handleReject} className="flex-1 py-3 bg-red-600 hover:bg-red-700 rounded-xl text-white text-sm font-bold transition">Reject & Notify</button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-rose-600" /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-12">
                {statCards.map(card => (
                  <motion.div key={card.label} whileHover={{ y: -6, scale: 1.02 }} className={`bg-gradient-to-br ${card.color} rounded-3xl p-8 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                    <card.icon className="w-8 h-8 mb-4 opacity-70" />
                    <div className="text-5xl font-black mb-2">{card.value}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest opacity-70">{card.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Quick Admin Info */}
              <div className="glass rounded-3xl p-8 border border-white/5">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6">— ADMIN QUICK CONTROLS</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { label: 'Manage Riders', tab: 'riders', icon: Bike },
                    { label: 'Manage Journeys', tab: 'journeys', icon: Calendar },
                    { label: 'Upload Stories', tab: 'stories', icon: Upload },
                    { label: 'Edit Hero Slides', tab: 'hero', icon: Layout },
                    { label: 'View Bookings', tab: 'bookings', icon: BookOpen },
                    { label: 'UI Settings', tab: 'ui-settings', icon: Settings },
                  ].map(({ label, tab, icon: Icon }) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className="glass rounded-2xl p-5 text-left border border-white/5 hover:border-rose-500/40 hover:bg-rose-600/5 transition-all group">
                      <Icon className="w-6 h-6 text-rose-500 mb-3 group-hover:scale-110 transition-transform" />
                      <p className="text-[11px] font-black uppercase tracking-widest text-neutral-300">{label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* UI Settings Tab */}
      {activeTab === 'ui-settings' && (
        <div className="space-y-6">
          <div className="glass rounded-3xl p-8 border border-white/5">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6">— SECTION VISIBILITY CONTROL</p>
            <p className="text-neutral-500 text-xs mb-8">Toggle which sections are visible on the main landing page. Changes take effect immediately for all users.</p>
            <div className="space-y-4">
              {Object.entries(uiSettings).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-5 glass rounded-2xl border border-white/5">
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest">
                      {key.replace('show', '').replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-bold mt-1">Show/hide this section on the main page</p>
                  </div>
                  <button
                    onClick={() => toggleUiSetting(key)}
                    className={`w-14 h-7 rounded-full transition-all relative ${val ? 'bg-rose-600' : 'bg-neutral-700'}`}
                  >
                    <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-all ${val ? 'left-7' : 'left-0.5'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Table Tabs */}
      {activeTab !== 'analytics' && activeTab !== 'ui-settings' && activeTab !== 'members' && activeTab !== 'group-chat' && (
        <div>
          {/* Smart Add Form */}
          {activeTab !== 'bookings' && (
            <div className="glass rounded-3xl p-8 border border-white/5 mb-8">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6">
                — {t('add_new')} {activeTab.toUpperCase()}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeTab === 'riders' && <>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('name')}<Req/></label>
                    <input placeholder={t('name')} value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('bike_model')}<Req/></label>
                    <input placeholder={t('bike_model')} value={form.bike || ''} onChange={e => setForm({...form, bike: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('image_url')}</label>
                    <input placeholder={t('image_url')} value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('category')}<Req/></label>
                    <select value={form.category || 'community'} onChange={e => setForm({...form, category: e.target.value})} className={sel}>
                      <option value="founder">{t('founder')}</option>
                      <option value="elite">{t('elite')}</option>
                      <option value="community">{t('community')}</option>
                    </select>
                  </div>
                </>}

                {activeTab === 'journeys' && <>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('journey_title')}<Req/></label>
                    <input placeholder={t('journey_title')} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('date')}<Req/></label>
                    <input placeholder="YYYY-MM-DD" type="date" value={form.date || ''} onChange={e => setForm({...form, date: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('route')}<Req/></label>
                    <input placeholder="e.g. Kolkata-Darjeeling" value={form.route || ''} onChange={e => setForm({...form, route: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('price_inr')}</label>
                    <input placeholder="0" type="number" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} className={inp} />
                  </div>
                  <div className="md:col-span-2"><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('description')}</label>
                    <input placeholder={t('description')} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className={inp} />
                  </div>
                  {/* ── Journey Photo Upload ── */}
                  <div className="md:col-span-3">
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-2 block">Journey Photos <span className="text-neutral-700">(optional — upload from device)</span></label>
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-dashed border-white/20 hover:border-rose-500/50 rounded-xl cursor-pointer text-neutral-500 hover:text-rose-400 text-[10px] font-black uppercase tracking-widest transition-all">
                        <Upload className="w-4 h-4" /> Upload Photos
                        <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          const readers = files.map(f => new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(f); }));
                          const srcs = await Promise.all(readers);
                          setForm(prev => ({ ...prev, photos: [...(prev.photos || []), ...srcs], coverPhoto: prev.coverPhoto || srcs[0] }));
                        }} />
                      </label>
                      {(form.photos || []).map((p, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white/10 group/ph cursor-pointer" onClick={() => setForm(prev => ({ ...prev, coverPhoto: p }))}>
                          <img src={p} className="w-full h-full object-cover" alt="" />
                          <button onClick={ev => { ev.stopPropagation(); setForm(prev => ({ ...prev, photos: prev.photos.filter((_, j) => j !== i), coverPhoto: prev.coverPhoto === p ? (prev.photos[0] || '') : prev.coverPhoto })); }}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-600 rounded-full items-center justify-center hidden group-hover/ph:flex z-10">
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                          {form.coverPhoto === p && (
                            <div className="absolute bottom-0 inset-x-0 bg-amber-600/80 text-[7px] text-center font-black uppercase text-white py-0.5">Cover</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>}

                {activeTab === 'posts' && <>
                  <div className="md:col-span-2"><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('image_video_url')}<Req/></label>
                    <input placeholder={t('image_video_url')} value={form.imageUrl || ''} onChange={e => setForm({...form, imageUrl: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('caption')}</label>
                    <input placeholder={t('caption')} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('status')}<Req/></label>
                    <select value={form.type || 'photo'} onChange={e => setForm({...form, type: e.target.value})} className={sel}>
                      <option value="photo">{t('photo')}</option>
                      <option value="video">{t('video')}</option>
                      <option value="reel">{t('reel')}</option>
                    </select>
                  </div>
                </>}

                {activeTab === 'places' && <>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('place_name')}<Req/></label>
                    <input placeholder={t('place_name')} value={form.name || ''} onChange={e => setForm({...form, name: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('description')}</label>
                    <input placeholder={t('description')} value={form.description || ''} onChange={e => setForm({...form, description: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('cover_image_url')}</label>
                    <input placeholder={t('cover_image_url')} value={form.coverImage || ''} onChange={e => setForm({...form, coverImage: e.target.value})} className={inp} />
                  </div>
                </>}

                {activeTab === 'hero' && <>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('slide_image_url')}<Req/></label>
                    <input placeholder={t('slide_image_url')} value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('title')}<Req/></label>
                    <input placeholder={t('title')} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('subtitle')}</label>
                    <input placeholder={t('subtitle')} value={form.subtitle || ''} onChange={e => setForm({...form, subtitle: e.target.value})} className={inp} />
                  </div>
                </>}

                {activeTab === 'stories' && <>
                  <div className="md:col-span-2"><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('image_video_url')}<Req/></label>
                    <input placeholder={t('image_video_url')} value={form.url || ''} onChange={e => setForm({...form, url: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('thumbnail_url')}</label>
                    <input placeholder={t('thumbnail_url')} value={form.thumbnail || ''} onChange={e => setForm({...form, thumbnail: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('status')}<Req/></label>
                    <select value={form.type || 'image'} onChange={e => setForm({...form, type: e.target.value})} className={sel}>
                      <option value="image">{t('image')}</option>
                      <option value="video">{t('video')}</option>
                    </select>
                  </div>
                </>}

                {activeTab === 'highlights' && <>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('highlight_title')}<Req/></label>
                    <input placeholder={t('highlight_title')} value={form.title || ''} onChange={e => setForm({...form, title: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('image_url')}<Req/></label>
                    <input placeholder={t('image_url')} value={form.image || ''} onChange={e => setForm({...form, image: e.target.value})} className={inp} />
                  </div>
                  <div><label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('click_link')}</label>
                    <input placeholder="#" value={form.link || ''} onChange={e => setForm({...form, link: e.target.value})} className={inp} />
                  </div>
                </>}

                <div className="flex items-end">
                  <button
                    onClick={handleAdd}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 w-full"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Plus className="w-5 h-5" />}
                    {t('add')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* List */}
          <div className="space-y-3">
            {loading ? (
              <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-rose-600" /></div>
            ) : items.length === 0 ? (
              <div className="glass rounded-3xl p-12 text-center border border-white/5">
                <p className="text-neutral-500 text-sm">No items yet. Add some above!</p>
              </div>
            ) : (
              items.map(item => (
                <motion.div
                  key={item._id || item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass flex items-center justify-between rounded-2xl p-5 border border-white/5 gap-4 hover:border-rose-500/20 transition-all group"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {/* Journey photos strip or single image */}
                    {activeTab === 'journeys' && (item.coverPhoto || (item.photos?.length > 0)) ? (
                      <div className="flex gap-1 shrink-0">
                        {[item.coverPhoto, ...(item.photos || [])].filter(Boolean).slice(0,3).map((ph, i) => (
                          <img key={i} src={ph} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" onError={e => e.target.style.display='none'} />
                        ))}
                        {item.photos?.length > 3 && <span className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[9px] text-neutral-500 font-black">+{item.photos.length - 3}</span>}
                      </div>
                    ) : (item.imageUrl || item.image || item.url) ? (
                      <img
                        src={item.imageUrl || item.image || item.url}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-white/5"
                        alt=""
                        onError={e => e.target.style.display='none'}
                      />
                    ) : null}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 min-w-0">
                      {['name', 'title', 'bike', 'route', 'type', 'username', 'email'].filter(k => item[k]).map(k => (
                        <span key={k} className="text-[11px] font-black text-white uppercase">{item[k]}</span>
                      ))}
                      {item.date && <span className="text-[10px] text-neutral-500 font-black">{item.date}</span>}
                      {item.price && <span className="text-[10px] text-green-400 font-black">₹{item.price}</span>}
                      {item.status && (
                        <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase ${
                          item.status === 'upcoming' ? 'bg-rose-600/20 text-rose-400' :
                          item.status === 'active' ? 'bg-green-600/20 text-green-400' :
                          'bg-neutral-800 text-neutral-500'
                        }`}>{item.status}</span>
                      )}
                      {item.url && <span className="text-[9px] text-neutral-600 font-bold truncate max-w-[200px]">{item.url.slice(0, 60)}...</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Journey: add more photos to existing item */}
                    {activeTab === 'journeys' && (
                      <label className="p-2 glass rounded-xl text-neutral-600 hover:text-amber-400 hover:bg-amber-600/10 transition-all border border-white/5 cursor-pointer" title="Upload photos">
                        <Image className="w-4 h-4" />
                        <input type="file" accept="image/*" multiple className="hidden" onChange={async (e) => {
                          const files = Array.from(e.target.files);
                          const srcs = await Promise.all(files.map(f => new Promise(res => { const r = new FileReader(); r.onloadend = () => res(r.result); r.readAsDataURL(f); })));
                          try {
                            await journeysAPI.addPhotos(item._id, { photos: srcs, coverPhoto: item.coverPhoto || srcs[0] });
                            loadItems();
                          } catch {}
                        }} />
                      </label>
                    )}
                    <button
                      onClick={() => handleDelete(item._id || item.id)}
                      className="p-3 glass rounded-xl text-neutral-600 hover:text-rose-500 hover:bg-rose-600/10 transition-all border border-white/5 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
      {/* ── BOOKINGS TAB — enriched rendering ─────────────────────── */}
      {activeTab === 'bookings' && (
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-6">— JOURNEY BOOKINGS ({items.length})</p>
          {loading ? (
            <div className="flex justify-center py-20"><Loader2 className="animate-spin w-10 h-10 text-rose-600" /></div>
          ) : items.length === 0 ? (
            <div className="glass rounded-3xl p-12 text-center border border-white/5">
              <BookOpen className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <p className="text-neutral-500 text-sm">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((b, i) => (
                <motion.div key={b._id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass border border-white/8 rounded-2xl p-6 hover:border-rose-500/20 transition group">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-black text-base">{b.name}</span>
                        {b.userDetails?.status && (
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${
                            b.userDetails.status === 'approved' ? 'bg-green-600/20 text-green-400' :
                            b.userDetails.status === 'pending' ? 'bg-amber-600/20 text-amber-400' :
                            'bg-neutral-800 text-neutral-500'
                          }`}>{b.userDetails.status}</span>
                        )}
                      </div>
                      <p className="text-neutral-500 text-xs">{b.email} · {b.phone}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-neutral-600">{new Date(b.timestamp || b.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                      <button onClick={() => handleDelete(b._id)} className="mt-2 p-1.5 text-neutral-700 hover:text-rose-500 transition opacity-0 group-hover:opacity-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold mb-1">Journey</p>
                      <p className="text-white text-xs font-bold truncate">{b.journeyDetails?.title || b.journeyTitle || '—'}</p>
                      {b.journeyDetails?.date && <p className="text-neutral-500 text-[10px]">{b.journeyDetails.date}</p>}
                    </div>
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold mb-1">Route</p>
                      <p className="text-white text-xs font-bold truncate">{b.journeyDetails?.route || '—'}</p>
                      {b.journeyDetails?.price && <p className="text-green-400 text-[10px] font-bold">₹{b.journeyDetails.price}</p>}
                    </div>
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold mb-1">Bike</p>
                      <p className="text-white text-xs font-bold truncate">{b.bikeModel}</p>
                      <p className="text-neutral-500 text-[10px] truncate">{b.location}</p>
                    </div>
                    <div className="bg-white/3 rounded-xl p-3">
                      <p className="text-[9px] text-neutral-600 uppercase tracking-widest font-bold mb-1">Availability</p>
                      <p className="text-white text-xs font-bold">{b.availability}</p>
                      {b.details && <p className="text-neutral-500 text-[10px] truncate">{b.details}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GROUP CHAT TAB ─────────────────────────────────────────── */}
      {activeTab === 'group-chat' && <GroupChatPanel />}

      {/* ── ADMIN SECURITY / MPIN RECOVERY TAB ────────────────────── */}
      {activeTab === 'security' && (
        <div className="max-w-2xl">
          <div className="glass rounded-[32px] p-8 md:p-10 border border-white/5">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
                <KeySquare className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Admin Recovery</h3>
                <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Reset your Password or MPIN</p>
              </div>
            </div>

            {recoveryStep === 0 && (
              <div className="space-y-6">
                <div className="glass rounded-2xl p-6 border border-white/5">
                  <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                    Need to reset your <span className="text-rose-400 font-bold">MPIN</span> or <span className="text-rose-400 font-bold">Password</span>?
                    A verification OTP will be sent to <span className="text-white font-bold">{user?.email}</span>.
                  </p>
                  <button
                    onClick={handleAdminRequestOTP}
                    disabled={recoveryLoading}
                    className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                  >
                    {recoveryLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
                    Send Recovery OTP
                  </button>
                </div>
                {recoveryMsg && <p className="text-sm font-bold">{recoveryMsg}</p>}
              </div>
            )}

            {recoveryStep === 1 && (
              <div className="space-y-5">
                <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                  <div className="flex items-center gap-2 mb-3">
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">OTP Sent to {user?.email}</p>
                  </div>
                  <p className="text-neutral-400 text-xs">Enter the 6-digit code and set your new credentials below.</p>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">OTP *</label>
                  <input type="text" maxLength={6} placeholder="Enter 6-digit OTP" value={recoveryForm.otp}
                    onChange={e => setRecoveryForm({ ...recoveryForm, otp: e.target.value })}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 text-lg font-black tracking-[0.5em] text-center outline-none focus:border-rose-500 text-white" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">New Password (optional)</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="password" placeholder="Enter new password" value={recoveryForm.newPassword}
                      onChange={e => setRecoveryForm({ ...recoveryForm, newPassword: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">New 6-Digit MPIN (optional)</label>
                  <div className="relative">
                    <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input type="password" maxLength={6} placeholder="Enter new 6-digit MPIN" value={recoveryForm.newMpin}
                      onChange={e => setRecoveryForm({ ...recoveryForm, newMpin: e.target.value })}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                  </div>
                </div>
                <button onClick={handleAdminResetCredentials} disabled={recoveryLoading}
                  className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2">
                  {recoveryLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                  Update Credentials
                </button>
                <button onClick={() => { setRecoveryStep(0); setRecoveryMsg(''); setRecoveryForm({ otp: '', newPassword: '', newMpin: '' }); }}
                  className="w-full text-center text-[10px] text-neutral-500 font-black uppercase tracking-widest hover:text-white transition-colors mt-2">Cancel</button>
                {recoveryMsg && <p className="text-sm font-bold text-center">{recoveryMsg}</p>}
              </div>
            )}

            {recoveryStep === 2 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-600/40 flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-green-400" />
                </div>
                <h4 className="text-2xl font-black text-green-400">Credentials Updated!</h4>
                <p className="text-neutral-400 text-sm max-w-sm mx-auto">Your credentials have been reset. Use them on your next login.</p>
                <button onClick={() => { setRecoveryStep(0); setRecoveryMsg(''); }}
                  className="px-8 py-3 border border-white/10 text-neutral-400 rounded-full text-[11px] font-black uppercase tracking-widest hover:text-white transition-all">Done</button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

// Group Chat Panel for Admin Dashboard
const GroupChatPanel = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', avatar: '🏍️', isPublic: false });
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const emojis = ['🏍️', '⚡', '🔥', '💨', '🛣️', '🌄', '☠️', '🤝', '🏔️', '🦅'];

  const loadGroups = async () => {
    setLoading(true);
    try { const res = await chatAPI.getMyGroups(); setGroups(res.data || []); } catch {}
    setLoading(false);
  };

  const loadUsers = async () => {
    try { const res = await chatAPI.getAvailableUsers(); setAvailableUsers(res.data || []); } catch {}
  };

  useEffect(() => { loadGroups(); }, []);

  const handleCreate = async () => {
    if (!form.name.trim()) return;
    try {
      await chatAPI.createGroup({ ...form, members: selectedMembers });
      setForm({ name: '', avatar: '🏍️', isPublic: false });
      setSelectedMembers([]);
      setShowCreate(false);
      loadGroups();
    } catch {}
  };

  const handleRemoveMember = async (groupId, userId) => {
    try { await chatAPI.removeGroupMember(groupId, userId); loadGroups(); } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500">— GROUP CHATS ({groups.length})</p>
        <button onClick={() => { setShowCreate(p => !p); if (!showCreate) loadUsers(); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition">
          <Plus className="w-4 h-4" /> {showCreate ? 'Cancel' : 'Create Group'}
        </button>
      </div>

      {/* Create Group Form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            className="glass border border-white/10 rounded-2xl p-6 overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-2 block">Group Name *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Darjeeling Run 2026"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-rose-500" />
              </div>
              <div>
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-2 block">Avatar</label>
                <div className="flex flex-wrap gap-2">
                  {emojis.map(e => (
                    <button key={e} onClick={() => setForm(p => ({ ...p, avatar: e }))}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition ${form.avatar === e ? 'bg-rose-600/30 ring-2 ring-rose-500' : 'bg-white/5 hover:bg-white/10'}`}>
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <div onClick={() => setForm(p => ({ ...p, isPublic: !p.isPublic }))}
                className={`w-10 h-5 rounded-full transition-colors ${form.isPublic ? 'bg-rose-600' : 'bg-white/10'} relative`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${form.isPublic ? 'left-5' : 'left-0.5'}`} />
              </div>
              <span className="text-xs text-neutral-400">Public group (all approved members can see and join)</span>
            </label>
            {availableUsers.length > 0 && (
              <div className="mb-4">
                <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-2 block">Add Members ({selectedMembers.length} selected)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {availableUsers.map(u => (
                    <button key={u._id} onClick={() => setSelectedMembers(p => p.includes(u._id) ? p.filter(x => x !== u._id) : [...p, u._id])}
                      className={`flex items-center gap-2 p-2 rounded-xl text-left transition text-xs ${selectedMembers.includes(u._id) ? 'bg-rose-600/20 border border-rose-600/40 text-white' : 'bg-white/3 border border-white/5 text-neutral-400 hover:text-white'}`}>
                      <div className="w-6 h-6 rounded-full bg-rose-600/30 flex items-center justify-center text-xs font-bold text-rose-400">
                        {u.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="truncate">{u.username}</span>
                      {selectedMembers.includes(u._id) && <Check className="w-3 h-3 ml-auto text-rose-400 flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button onClick={handleCreate} className="w-full py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-white font-black text-sm uppercase tracking-widest transition">
              🏍️ Create Group
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Groups List */}
      {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin w-8 h-8 text-rose-600" /></div> : (
        <div className="space-y-4">
          {groups.length === 0 ? (
            <div className="glass rounded-2xl p-10 text-center border border-white/5">
              <p className="text-neutral-500 text-sm">No groups yet. Create one above!</p>
            </div>
          ) : groups.map(g => (
            <motion.div key={g._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-2xl">{g.avatar || '🏍️'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white font-black">{g.name}</p>
                    {g.isPublic && <span className="text-[9px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">PUBLIC</span>}
                  </div>
                  <p className="text-neutral-500 text-xs">{g.members?.length || 0} members · Created {new Date(g.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {g.members?.map(m => (
                  <div key={m._id} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5 text-xs group/member">
                    <div className="w-5 h-5 rounded-full bg-rose-600/30 flex items-center justify-center text-[9px] font-bold text-rose-400">
                      {m.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-neutral-300">{m.username}</span>
                    {m.role !== 'admin' && (
                      <button onClick={() => handleRemoveMember(g._id, m._id)} className="opacity-0 group-hover/member:opacity-100 ml-1 text-neutral-600 hover:text-rose-500 transition">
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
