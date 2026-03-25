import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar, User, MapPin, Bike, LogOut, Loader2, ArrowRight,
  Heart, Activity, CreditCard, Clock, CheckCircle, Star, Zap,
  Mail, Shield, Trophy, TrendingUp, Bell, ChevronRight, Home, XCircle, KeySquare, RefreshCcw, Lock
} from 'lucide-react';
import { bookingsAPI, postsAPI, authAPI } from '../api/index.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';

const UserDashboard = ({ user, onLogout, onNavigate }) => {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journeys');

  // MPIN Recovery state
  const [recoveryStep, setRecoveryStep] = useState(0); // 0=idle, 1=OTP sent, 2=done
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryForm, setRecoveryForm] = useState({ otp: '', newPassword: '', newMpin: '' });
  const [recoveryMsg, setRecoveryMsg] = useState('');
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const bookRes = await bookingsAPI.getMyBookings();
      setBookings(bookRes.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    onLogout?.();
    navigate('/');
  };

  const totalSpent = bookings.reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
  const confirmedBookings = bookings.filter(b => b.status !== 'cancelled');
  const memberYear = user?.createdAt ? new Date(user.createdAt).getFullYear() : new Date().getFullYear();

  const tabs = [
    { id: 'journeys', label: t('my_expeditions'), icon: Calendar },
    { id: 'activity', label: t('my_activity'), icon: Activity },
    { id: 'transactions', label: t('transactions'), icon: CreditCard },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // Recovery Handlers
  const handleRequestRecoveryOTP = async () => {
    setRecoveryLoading(true);
    setRecoveryMsg('');
    try {
      await authAPI.requestRecoveryOTP(user?.email);
      setRecoveryStep(1);
      setRecoveryMsg('✅ OTP sent to your email!');
    } catch (err) {
      setRecoveryMsg('❌ ' + (err.response?.data?.error || 'Failed to send OTP'));
    }
    setRecoveryLoading(false);
  };

  const handleResetCredentials = async () => {
    if (!recoveryForm.otp) { setRecoveryMsg('❌ Please enter the OTP'); return; }
    if (!recoveryForm.newPassword && !recoveryForm.newMpin) { setRecoveryMsg('❌ Enter a new password or MPIN'); return; }
    if (recoveryForm.newMpin && (recoveryForm.newMpin.length !== 6 || !/^\d+$/.test(recoveryForm.newMpin))) {
      setRecoveryMsg('❌ MPIN must be exactly 6 digits'); return;
    }
    setRecoveryLoading(true);
    setRecoveryMsg('');
    try {
      await authAPI.resetCredentials({
        email: user?.email,
        otp: recoveryForm.otp,
        newPassword: recoveryForm.newPassword || undefined,
        newMpin: recoveryForm.newMpin || undefined
      });
      setRecoveryStep(2);
      setRecoveryMsg('✅ Credentials updated successfully! Please re-login.');
      setRecoveryForm({ otp: '', newPassword: '', newMpin: '' });
    } catch (err) {
      setRecoveryMsg('❌ ' + (err.response?.data?.error || 'Reset failed'));
    }
    setRecoveryLoading(false);
  };

  // ── Pending State ────────────────────────────────────────────
  if (user?.status === 'pending') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center px-6">
          <div className="w-24 h-24 rounded-full bg-amber-600/20 border-2 border-amber-600/40 flex items-center justify-center mx-auto mb-8">
            <Clock className="w-10 h-10 text-amber-500" />
          </div>
          <div className="inline-flex items-center gap-2 bg-amber-600/10 border border-amber-600/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
            <span className="text-amber-400 text-xs font-black uppercase tracking-widest">Awaiting Admin Approval</span>
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tight text-white mb-4">
            Application Under Review
          </h1>
          <p className="text-neutral-400 text-base mb-8 leading-relaxed">
            Your membership request has been received! 🏍️ The IBR admin team will review your application and you'll receive an email once approved.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-10">
            {[
              { step: '1', label: 'Registered', done: true, icon: CheckCircle },
              { step: '2', label: 'Under Review', active: true, icon: Clock },
              { step: '3', label: 'Full Access', icon: Shield },
            ].map(s => (
              <div key={s.step} className={`rounded-2xl p-4 border ${s.done ? 'bg-green-600/20 border-green-600/40' : s.active ? 'bg-amber-600/20 border-amber-600/40' : 'bg-white/3 border-white/8'}`}>
                <s.icon className={`w-5 h-5 mx-auto mb-2 ${s.done ? 'text-green-400' : s.active ? 'text-amber-400' : 'text-neutral-600'}`} />
                <p className={`text-[10px] font-black uppercase tracking-wider ${s.done ? 'text-green-300' : s.active ? 'text-amber-300' : 'text-neutral-600'}`}>{s.label}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-neutral-400 hover:text-white text-sm font-bold transition">
              <Home className="w-4 h-4" /> Back to Home
            </button>
            <button onClick={handleLogout} className="px-6 py-3 border border-rose-600/40 text-rose-500 rounded-full text-sm font-bold hover:bg-rose-600 hover:text-white transition">
              <LogOut className="w-4 h-4 inline mr-2" />Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Rejected State ───────────────────────────────────────────
  if (user?.status === 'rejected' || user?.status === 'banned') {
    const isBanned = user?.status === 'banned';
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto text-center px-6">
          <div className="w-24 h-24 rounded-full bg-red-900/30 border-2 border-red-700/40 flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-4xl font-black italic uppercase tracking-tight text-white mb-4">
            {isBanned ? 'Account Restricted' : 'Application Not Approved'}
          </h1>
          <p className="text-neutral-400 text-base mb-6 leading-relaxed">
            {isBanned
              ? 'Your account has been restricted by the administrator. Access to the IBR platform is currently disabled.'
              : 'Your membership application was not approved at this time. You may have received an email with more details.'}
          </p>
          <p className="text-neutral-600 text-sm mb-8">
            For any queries, contact <span className="text-rose-400">admin@ibriders.in</span>
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-6 py-3 border border-white/10 rounded-full text-neutral-400 hover:text-white text-sm font-bold transition">
              <Home className="w-4 h-4" /> Back to Home
            </button>
            <button onClick={handleLogout} className="px-6 py-3 border border-rose-600/40 text-rose-500 rounded-full text-sm font-bold hover:bg-rose-600 hover:text-white transition">
              Logout
            </button>
          </div>
        </motion.div>
      </div>
    );
  }


  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-rose-500" />
            <p className="text-rose-500 text-[10px] uppercase tracking-[0.4em] font-black">{t('authorized_access')}</p>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-neutral-900 dark:text-white">{t('rider_profile')}</h2>
          <p className="text-neutral-500 text-sm mt-2">
            {t('welcome_back')} <span className="text-white font-bold">{user?.username}</span>
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="px-6 py-3 border border-white/10 text-neutral-400 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-all flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" /> {t('logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card (Left Column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Avatar + Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[32px] p-8 border border-white/5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-bl-full" />
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-rose-900 mx-auto flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(225,29,72,0.35)] ring-4 ring-rose-600/20">
                <span className="text-3xl font-black text-white">{(user?.username || 'U')[0].toUpperCase()}</span>
              </div>
              <h3 className="text-2xl font-black text-center mb-1">{user?.username}</h3>
              <p className="text-center text-sm mb-1 text-neutral-400 flex items-center justify-center gap-1">
                <Mail className="w-3.5 h-3.5" />{user?.email}
              </p>
              <div className="flex justify-center mt-3 mb-6">
                <span className="text-[9px] px-3 py-1 bg-green-500/20 text-green-400 rounded-full font-black uppercase tracking-widest flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {t('verified')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('member_since')}</span>
                  <span className="text-sm font-bold text-white">{memberYear}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/5">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('total_bookings')}</span>
                  <span className="text-lg font-black text-rose-400">{bookings.length}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-neutral-500">{t('account_status')}</span>
                  <span className="text-[10px] px-3 py-1 bg-rose-600/20 text-rose-400 rounded-full font-black uppercase tracking-widest">Pack</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: t('expeditions'), value: confirmedBookings.length, icon: Bike, color: 'from-rose-600 to-rose-900' },
              { label: t('amount'), value: totalSpent > 0 ? `₹${totalSpent}` : t('free'), icon: CreditCard, color: 'from-blue-600 to-blue-900' },
            ].map(s => (
              <motion.div key={s.label} whileHover={{ scale: 1.02 }} className={`bg-gradient-to-br ${s.color} rounded-2xl p-5 text-white relative overflow-hidden`}>
                <s.icon className="w-5 h-5 mb-3 opacity-70" />
                <div className="text-2xl font-black">{s.value}</div>
                <div className="text-[9px] font-black uppercase tracking-widest opacity-70 mt-1">{s.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-3xl p-6 border border-white/5 space-y-3">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-4">Quick Actions</p>
            {[
              {
                label: t('explore_journeys'),
                icon: Zap,
                action: () => onNavigate ? onNavigate('next-journey') : document.getElementById('next-journey')?.scrollIntoView({ behavior: 'smooth' })
              },
              {
                label: t('contact_admin'),
                icon: Mail,
                action: () => navigate('/contact')
              },
            ].map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="w-full flex items-center justify-between px-4 py-3 glass rounded-2xl border border-white/5 text-sm font-bold hover:border-rose-500/30 hover:text-rose-400 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-rose-500" />
                  {label}
                </div>
                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Main Content (Right Column) */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar pb-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-rose-600 text-white'
                    : 'glass text-neutral-500 hover:text-white border border-white/5'
                }`}
              >
                <tab.icon className="w-4 h-4" />{tab.label}
              </button>
            ))}
          </div>

          {/* Journeys Tab */}
          <AnimatePresence mode="wait">
            {activeTab === 'journeys' && (
              <motion.div key="journeys" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {loading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-rose-600" /></div>
                ) : bookings.length === 0 ? (
                  <div className="glass rounded-[32px] p-12 text-center border border-white/5">
                    <Bike className="w-16 h-16 text-neutral-700 mx-auto mb-6" />
                    <h4 className="text-2xl font-black mb-2">{t('no_active_journeys')}</h4>
                    <p className="text-neutral-500 mb-8 max-w-sm mx-auto text-sm leading-relaxed">{t('no_bookings_desc')}</p>
                    <button
                      onClick={() => document.getElementById('next-journey')?.scrollIntoView({ behavior: 'smooth' })}
                      className="px-8 py-4 bg-rose-600 text-white rounded-full font-black text-[11px] uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-[0_0_20px_rgba(225,29,72,0.4)]"
                    >
                      {t('explore_journeys')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking, idx) => (
                      <motion.div
                        key={booking._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.08 }}
                        className="glass rounded-3xl p-6 md:p-8 border border-white/5 relative overflow-hidden group hover:border-rose-500/20 transition-all"
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-600/5 rounded-bl-full -mr-10 -mt-10" />
                        <div className="relative z-10">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="bg-rose-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> {t('confirmed')}
                            </span>
                            <span className="text-[10px] text-neutral-500 font-bold uppercase">
                              {t('booked_on')}: {new Date(booking.timestamp || booking.createdAt).toLocaleDateString()}
                            </span>
                            {booking.journeyId && (
                              <span className="text-[9px] text-neutral-700 font-mono">#{(booking._id || '').slice(-6).toUpperCase()}</span>
                            )}
                          </div>
                          <h4 className="text-xl md:text-2xl font-black mb-4">{booking.journeyTitle || 'Expedition'}</h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div>
                              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">{t('rider_name')}</p>
                              <p className="text-sm font-bold">{booking.name}</p>
                            </div>
                            <div>
                              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">{t('bike_details')}</p>
                              <p className="text-sm font-bold">{booking.bikeModel} • {booking.availability}</p>
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">{t('meeting_location')}</p>
                              <p className="text-sm font-bold flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />{booking.location}</p>
                            </div>
                            {booking.amount && (
                              <div>
                                <p className="text-[9px] text-neutral-500 font-black uppercase tracking-[0.2em] mb-1">{t('amount')}</p>
                                <p className="text-sm font-black text-green-400">{booking.amount > 0 ? `₹${booking.amount}` : t('free')}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Activity Tab */}
            {activeTab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="space-y-4">
                  {bookings.length > 0 ? (
                    <>
                      <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                          <TrendingUp className="w-5 h-5 text-rose-500" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">{t('journey_history')}</p>
                        </div>
                        <div className="space-y-3">
                          {bookings.slice(0, 5).map((b, i) => (
                            <div key={b._id} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                              <div className="w-8 h-8 rounded-full bg-rose-600/20 flex items-center justify-center shrink-0">
                                <Bike className="w-4 h-4 text-rose-400" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{b.journeyTitle || 'Expedition Booking'}</p>
                                <p className="text-[10px] text-neutral-500">{new Date(b.timestamp || b.createdAt).toLocaleDateString()}</p>
                              </div>
                              <span className="text-[9px] px-2 py-1 rounded-full bg-rose-600/20 text-rose-400 font-black uppercase">{t('confirmed')}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Achievements */}
                      <div className="glass rounded-3xl p-6 border border-white/5">
                        <div className="flex items-center gap-3 mb-6">
                          <Trophy className="w-5 h-5 text-amber-500" />
                          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-300">Achievements</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { label: 'Pack Member', desc: 'Joined the IBR family', icon: '🏍️', earned: true },
                            { label: 'First Ride', desc: 'Booked your first expedition', icon: '🚀', earned: bookings.length >= 1 },
                            { label: 'Explorer', desc: 'Booked 3+ expeditions', icon: '🗺️', earned: bookings.length >= 3 },
                            { label: 'Road Legend', desc: 'Booked 10+ expeditions', icon: '👑', earned: bookings.length >= 10 },
                          ].map(a => (
                            <div key={a.label} className={`p-4 rounded-2xl border transition-all ${a.earned ? 'border-amber-500/30 bg-amber-500/5' : 'border-white/5 opacity-40'}`}>
                              <div className="text-2xl mb-2">{a.icon}</div>
                              <p className="text-[11px] font-black uppercase tracking-widest">{a.label}</p>
                              <p className="text-[10px] text-neutral-500 mt-1">{a.desc}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="glass rounded-[32px] p-12 text-center border border-white/5">
                      <Activity className="w-16 h-16 text-neutral-700 mx-auto mb-6" />
                      <h4 className="text-xl font-black mb-2">No Activity Yet</h4>
                      <p className="text-neutral-500 text-sm">Join an expedition to start building your rider journey!</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Transactions Tab */}
            {activeTab === 'transactions' && (
              <motion.div key="transactions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <div className="space-y-4">
                  {/* Summary */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="glass rounded-2xl p-6 border border-white/5">
                      <CreditCard className="w-5 h-5 text-rose-500 mb-3" />
                      <div className="text-2xl font-black">{bookings.length}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">{t('total_bookings')}</div>
                    </div>
                    <div className="glass rounded-2xl p-6 border border-white/5">
                      <TrendingUp className="w-5 h-5 text-green-500 mb-3" />
                      <div className="text-2xl font-black text-green-400">{totalSpent > 0 ? `₹${totalSpent}` : t('free')}</div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-500 mt-1">Total Spent</div>
                    </div>
                  </div>

                  {/* Transaction List */}
                  <div className="glass rounded-3xl p-6 border border-white/5">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-neutral-500 mb-6">{t('transactions')}</p>
                    {bookings.length === 0 ? (
                      <div className="text-center py-10">
                        <CreditCard className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                        <p className="text-neutral-500 text-sm">No transactions yet</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {bookings.map((b, i) => (
                          <div key={b._id || i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 gap-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-600/10 rounded-full flex items-center justify-center">
                                <Bike className="w-4 h-4 text-rose-500" />
                              </div>
                              <div>
                                <p className="text-sm font-bold">{b.journeyTitle || 'Expedition'}</p>
                                <p className="text-[10px] text-neutral-500">
                                  #{(b._id || '').slice(-6).toUpperCase()} • {new Date(b.timestamp || b.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span className={`text-sm font-black ${b.amount > 0 ? 'text-rose-400' : 'text-green-400'}`}>
                              {b.amount > 0 ? `- ₹${b.amount}` : t('free')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

            {/* Security Tab — MPIN / Password Recovery */}
            {activeTab === 'security' && (
              <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div className="glass rounded-[32px] p-8 md:p-10 border border-white/5">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-rose-600/10 border border-rose-500/20 flex items-center justify-center">
                      <KeySquare className="w-6 h-6 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black uppercase tracking-tight">Recovery Center</h3>
                      <p className="text-neutral-500 text-[10px] font-bold uppercase tracking-widest">Reset your Password or MPIN</p>
                    </div>
                  </div>

                  {recoveryStep === 0 && (
                    <div className="space-y-6">
                      <div className="glass rounded-2xl p-6 border border-white/5">
                        <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                          Forgot your <span className="text-rose-400 font-bold">MPIN</span> or <span className="text-rose-400 font-bold">Password</span>? 
                          We'll send a one-time verification code to <span className="text-white font-bold">{user?.email}</span> to verify your identity.
                        </p>
                        <button
                          onClick={handleRequestRecoveryOTP}
                          disabled={recoveryLoading}
                          className="flex items-center gap-3 px-8 py-4 bg-rose-600 text-white font-black uppercase text-[11px] tracking-widest rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(225,29,72,0.3)]"
                        >
                          {recoveryLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Mail className="w-5 h-5" />}
                          Send Recovery OTP
                        </button>
                      </div>
                      {recoveryMsg && <p className="text-sm font-bold mt-2">{recoveryMsg}</p>}
                    </div>
                  )}

                  {recoveryStep === 1 && (
                    <div className="space-y-5">
                      <div className="glass rounded-2xl p-6 border border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 mb-3">
                          <RefreshCcw className="w-4 h-4 text-amber-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-amber-400">OTP Sent to {user?.email}</p>
                        </div>
                        <p className="text-neutral-400 text-xs">Enter the 6-digit code and set your new credentials below.</p>
                      </div>

                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">Verification OTP *</label>
                        <input
                          type="text" maxLength={6} placeholder="Enter 6-digit OTP"
                          value={recoveryForm.otp}
                          onChange={e => setRecoveryForm({ ...recoveryForm, otp: e.target.value })}
                          className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl px-5 py-4 text-lg font-black tracking-[0.5em] text-center outline-none focus:border-rose-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">New Password (optional)</label>
                        <div className="relative">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="password" placeholder="Enter new password"
                            value={recoveryForm.newPassword}
                            onChange={e => setRecoveryForm({ ...recoveryForm, newPassword: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">New 6-Digit MPIN (optional)</label>
                        <div className="relative">
                          <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                          <input
                            type="password" maxLength={6} placeholder="Enter new 6-digit MPIN"
                            value={recoveryForm.newMpin}
                            onChange={e => setRecoveryForm({ ...recoveryForm, newMpin: e.target.value })}
                            className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-5 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white"
                          />
                        </div>
                      </div>
                      <button
                        onClick={handleResetCredentials}
                        disabled={recoveryLoading}
                        className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-2xl hover:bg-rose-700 transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2"
                      >
                        {recoveryLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                        Update Credentials
                      </button>
                      <button onClick={() => { setRecoveryStep(0); setRecoveryMsg(''); setRecoveryForm({ otp: '', newPassword: '', newMpin: '' }); }}
                        className="w-full text-center text-[10px] text-neutral-500 font-black uppercase tracking-widest hover:text-white transition-colors mt-2">
                        Cancel
                      </button>
                      {recoveryMsg && <p className="text-sm font-bold text-center">{recoveryMsg}</p>}
                    </div>
                  )}

                  {recoveryStep === 2 && (
                    <div className="text-center space-y-6">
                      <div className="w-20 h-20 rounded-full bg-green-600/20 border-2 border-green-600/40 flex items-center justify-center mx-auto">
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </div>
                      <h4 className="text-2xl font-black text-green-400">Credentials Updated!</h4>
                      <p className="text-neutral-400 text-sm max-w-sm mx-auto">Your password/MPIN has been reset. Use your new credentials next time you login.</p>
                      <button onClick={() => { setRecoveryStep(0); setRecoveryMsg(''); }}
                        className="px-8 py-3 border border-white/10 text-neutral-400 rounded-full text-[11px] font-black uppercase tracking-widest hover:text-white transition-all">
                        Done
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
