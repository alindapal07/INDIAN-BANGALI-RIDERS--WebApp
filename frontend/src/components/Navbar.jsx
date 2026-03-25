import React, { memo, useCallback, useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, Zap, Menu, X, Sun, Moon, Eye, Globe, LogOut,
  LayoutDashboard, Shield, Home, UserPlus, LogIn, MessageSquare,
  BookOpen, Phone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

const NAV_ITEMS_KEYS = [
  { id: 'next-journey', key: 'journeys', label: 'Expeditions' },
  { id: 'media', key: 'media', label: 'Media' },
  { id: 'members', key: 'members', label: 'Pack' },
];

const Navbar = ({ activeSection, onNavigate, onAdminToggle, isAdmin, currentUser, onLogout, dashboardMode,
  onOpenLogin, onOpenRegister, onOpenAdminLogin }) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('ibr-theme') || 'dark');
  const langRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ibr-theme', theme);
  }, [theme]);

  // Close lang menu on outside click
  useEffect(() => {
    const handler = (e) => { if (langRef.current && !langRef.current.contains(e.target)) setShowLangMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const cycleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : t === 'light' ? 'eye-care' : 'dark');
  };

  const getThemeIcon = () => {
    if (theme === 'dark') return <Moon className="w-4 h-4" />;
    if (theme === 'light') return <Sun className="w-4 h-4 text-yellow-400" />;
    return <Eye className="w-4 h-4 text-orange-400" />;
  };

  const getThemeLabel = () => {
    if (theme === 'dark') return 'Dark Mode';
    if (theme === 'light') return 'Light Mode';
    return 'Eye Care';
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('ibr-lang', lng);
    setShowLangMenu(false);
  };

  const handleNavigate = useCallback((section) => () => {
    onNavigate(section);
    setIsMobileMenuOpen(false);
  }, [onNavigate]);

  const closeMobile = () => setIsMobileMenuOpen(false);

  const langOptions = [
    { code: 'en', label: 'English', native: 'EN' },
    { code: 'bn', label: 'বাংলা', native: 'BN' },
    { code: 'hi', label: 'हिन्दी', native: 'HI' },
  ];

  return (
    <nav className="fixed top-3 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[97%] max-w-7xl">
      <div className="glass px-3 md:px-8 py-2.5 md:py-4 rounded-2xl md:rounded-full flex items-center justify-between shadow-2xl border border-white/10 backdrop-blur-3xl bg-black/40">

        {/* Logo */}
        <div className="flex items-center gap-2 md:gap-4 cursor-pointer group shrink-0" onClick={() => { navigate('/'); onNavigate('home'); }}>
          <div className="w-8 h-8 md:w-11 md:h-11 bg-rose-600 rounded-xl md:rounded-2xl transform -rotate-12 group-hover:rotate-0 transition-all flex items-center justify-center font-black text-white shadow-[0_6px_16px_rgba(225,29,72,0.4)] border border-rose-500/50">
            <span className="text-xs md:text-lg">IBR</span>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-[7px] md:text-[12px] tracking-[0.5em] text-white leading-none mb-0.5">INDIAN</span>
            <span className="font-bold text-sm md:text-xl tracking-wider text-rose-500 leading-none flex items-center gap-1">
              বাঙালী
              <span className="font-black italic tracking-tighter text-white text-[7px] md:text-base hidden sm:block">RIDERS</span>
            </span>
          </div>
        </div>

        {/* Desktop Nav Links */}
        {!dashboardMode && (
          <div className="hidden lg:flex items-center gap-6 xl:gap-10">
            {NAV_ITEMS_KEYS.map(({ id, label }) => {
              const isActive = activeSection === id;
              return (
                <button key={id} onClick={handleNavigate(id)}
                  className={`relative text-[11px] font-black tracking-[0.35em] uppercase transition-all ${isActive ? 'text-white' : 'text-neutral-500 hover:text-rose-500'}`}>
                  {isActive && <motion.div layoutId="navMarker" className="absolute -left-4 w-1.5 h-1.5 rounded-full bg-rose-600 top-1/2 -translate-y-1/2 shadow-[0_0_10px_#e11d48]" />}
                  {label}
                </button>
              );
            })}
            <button onClick={() => navigate('/timeline')} className="text-[11px] font-black tracking-[0.35em] uppercase text-neutral-500 hover:text-rose-500 transition">Feed</button>
            <button onClick={() => navigate('/guide')} className="text-[11px] font-black tracking-[0.35em] uppercase text-neutral-500 hover:text-rose-500 transition">Guide</button>
            <button onClick={() => navigate('/contact')} className="text-[11px] font-black tracking-[0.35em] uppercase text-neutral-500 hover:text-rose-500 transition">Contact</button>
            <button onClick={() => navigate('/about')} className="text-[11px] font-black tracking-[0.35em] uppercase text-neutral-500 hover:text-amber-400 transition">About</button>
          </div>
        )}

        {dashboardMode && (
          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 glass border border-white/8 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-white transition">
              <Home className="w-3.5 h-3.5" /> Home
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
          {/* Theme */}
          <button onClick={cycleTheme} title={getThemeLabel()}
            className="p-2 md:p-2.5 rounded-full glass border border-white/5 text-neutral-400 hover:text-white transition hover:border-rose-500/30 active:scale-90">
            {getThemeIcon()}
          </button>

          {/* Language (Desktop) */}
          <div ref={langRef} className="relative hidden md:block">
            <button onClick={() => setShowLangMenu(p => !p)}
              className="p-2.5 rounded-full glass border border-white/5 text-neutral-400 hover:text-white transition hover:border-rose-500/30">
              <Globe className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showLangMenu && (
                <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  className="absolute right-0 top-full mt-2 py-2 glass rounded-2xl border border-white/10 shadow-2xl min-w-[140px] bg-black/95 z-50">
                  {langOptions.map(({ code, label }) => (
                    <button key={code} onClick={() => changeLanguage(code)}
                      className={`w-full px-4 py-2.5 text-xs font-black tracking-widest hover:bg-white/8 text-left flex items-center justify-between transition ${i18n.language === code ? 'text-rose-500' : 'text-neutral-300'}`}>
                      {label}
                      {i18n.language === code && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Notifications */}
          {currentUser && <NotificationBell />}

          {/* Auth/Dashboard buttons */}
          {currentUser ? (
            <div className="flex items-center gap-1.5">
              {isAdmin && !dashboardMode && (
                <button onClick={() => navigate('/admin')}
                  className="p-2 md:p-2.5 rounded-full glass border border-amber-600/20 text-amber-400 hover:bg-amber-600/10 transition active:scale-90"
                  title="Admin Dashboard">
                  <Shield className="w-4 h-4" />
                </button>
              )}
              {!dashboardMode && (
                <button onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}
                  className="hidden sm:flex items-center gap-1.5 px-4 md:px-5 py-2 md:py-2.5 bg-white text-black font-black text-[10px] tracking-widest uppercase rounded-full hover:bg-rose-600 hover:text-white transition active:scale-95 shadow-[0_6px_16px_rgba(255,255,255,0.12)]">
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{isAdmin ? 'Admin' : 'Dashboard'}</span>
                </button>
              )}
              <button onClick={onLogout} title="Logout"
                className="p-2 md:p-2.5 glass rounded-full border border-white/5 text-neutral-500 hover:text-rose-500 hover:border-rose-500/30 transition active:scale-90">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <button onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-3 py-2 glass border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-neutral-300 hover:text-white hover:border-white/20 transition active:scale-95">
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button onClick={onOpenRegister}
                className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-[10px] font-black uppercase tracking-widest transition active:scale-95 shadow-[0_4px_12px_rgba(225,29,72,0.3)]">
                <UserPlus className="w-3.5 h-3.5" /> Join
              </button>
              <button onClick={onOpenAdminLogin} title="Admin Login"
                className="p-2 glass border border-white/5 rounded-full text-neutral-600 hover:text-amber-400 hover:border-amber-600/20 transition active:scale-90">
                <Shield className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button onClick={() => setIsMobileMenuOpen(p => !p)}
            className="lg:hidden p-2 glass rounded-xl border border-white/8 text-neutral-400 hover:text-white transition active:scale-90 ml-1">
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ─────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            className="absolute top-full left-0 right-0 mt-3 rounded-2xl glass border border-white/10 bg-[#0A0A0F]/95 backdrop-blur-3xl shadow-2xl p-4 space-y-2"
          >
            {/* Nav links */}
            {!dashboardMode && NAV_ITEMS_KEYS.map(({ id, label }) => (
              <button key={id} onClick={handleNavigate(id)}
                className={`w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left transition ${activeSection === id ? 'bg-rose-600/20 text-rose-400' : 'text-neutral-400 hover:bg-white/5 hover:text-white active:bg-white/5'}`}>
                {label}
              </button>
            ))}
            {!dashboardMode && (
              <>
                <button onClick={() => { navigate('/timeline'); closeMobile(); }}
                  className="w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left text-neutral-400 hover:bg-white/5 hover:text-white active:bg-white/5 transition flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-rose-400" /> Community Feed
                </button>
                <button onClick={() => { navigate('/guide'); closeMobile(); }}
                  className="w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left text-neutral-400 hover:bg-white/5 hover:text-white active:bg-white/5 transition flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-400" /> User Guide
                </button>
                <button onClick={() => { navigate('/contact'); closeMobile(); }}
                  className="w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left text-neutral-400 hover:bg-white/5 hover:text-white active:bg-white/5 transition flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-green-400" /> Contact Us
                </button>
                <button onClick={() => { navigate('/about'); closeMobile(); }}
                  className="w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left text-neutral-400 hover:bg-white/5 hover:text-amber-400 active:bg-white/5 transition flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-amber-400" /> About IBR
                </button>
              </>
            )}

            {dashboardMode && (
              <button onClick={() => { navigate('/'); closeMobile(); }}
                className="w-full py-3 px-4 rounded-xl text-[11px] font-black tracking-[0.3em] uppercase text-left bg-white/5 text-neutral-300 flex items-center gap-2">
                <Home className="w-3.5 h-3.5" /> Back to Home
              </button>
            )}

            <div className="border-t border-white/8 pt-3 space-y-2">
              {/* Language */}
              <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-1 mb-2">Language</p>
              <div className="flex gap-2">
                {langOptions.map(({ code, native, label }) => (
                  <button key={code} onClick={() => { changeLanguage(code); closeMobile(); }}
                    className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition ${i18n.language === code ? 'bg-rose-600 text-white' : 'glass border border-white/5 text-neutral-500 hover:text-white active:bg-white/10'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Theme */}
              <button onClick={() => { cycleTheme(); closeMobile(); }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 glass border border-white/5 rounded-xl text-[11px] font-black uppercase tracking-widest text-neutral-400 hover:text-white active:bg-white/5 transition">
                {getThemeIcon()} {getThemeLabel()}
              </button>

              {/* Auth - always show in mobile even without login */}
              {currentUser ? (
                <div className="space-y-2">
                  <div className="px-2 py-1">
                    <p className="text-[9px] font-black tracking-widest uppercase text-neutral-600">
                      Signed in as <span className="text-rose-400">{currentUser.username}</span>
                      {isAdmin && <span className="text-amber-400 ml-1">• ADMIN</span>}
                    </p>
                  </div>
                  <button onClick={() => { navigate(isAdmin ? '/admin' : '/dashboard'); closeMobile(); }}
                    className="w-full py-3 bg-rose-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-rose-700 active:bg-rose-700">
                    {isAdmin ? '👑 Admin Dashboard' : '⚡ My Dashboard'}
                  </button>
                  <button onClick={() => { onLogout(); closeMobile(); }}
                    className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-neutral-500 hover:text-rose-500 active:text-rose-500 transition flex items-center justify-center gap-2">
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <p className="text-[9px] font-black uppercase tracking-widest text-neutral-600 px-1">Member Access</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { onOpenLogin(); closeMobile(); }}
                      className="flex items-center justify-center gap-1.5 py-3 glass border border-white/10 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition hover:border-white/20 active:bg-white/5">
                      <LogIn className="w-3.5 h-3.5" /> Sign In
                    </button>
                    <button onClick={() => { onOpenRegister(); closeMobile(); }}
                      className="flex items-center justify-center gap-1.5 py-3 bg-rose-600 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition hover:bg-rose-700 active:bg-rose-700">
                      <UserPlus className="w-3.5 h-3.5" /> Join
                    </button>
                  </div>
                  <button onClick={() => { onOpenAdminLogin(); closeMobile(); }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 glass border border-amber-600/15 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-400 hover:border-amber-600/30 transition active:bg-amber-600/5">
                    <Shield className="w-3.5 h-3.5" /> Admin Login
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default memo(Navbar);
