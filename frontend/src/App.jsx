import React, { useState, useEffect, useCallback, useMemo, lazy, Suspense } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import { useAuth } from './context/AuthContext.jsx';
import { useData } from './context/DataContext.jsx';
import { storiesAPI } from './api/index.js';

import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import MediaVault from './components/MediaVault.jsx';
import StoriesBar from './components/StoriesBar.jsx';
import HighlightsBar from './components/HighlightsBar.jsx';
import NextJourney from './components/NextJourney.jsx';
import Members from './components/Members.jsx';
import Footer from './components/Footer.jsx';
import TacticalBack from './components/TacticalBack.jsx';
import CinematicBackground from './components/CinematicBackground.jsx';
import ChatSystem from './components/ChatSystem.jsx';
import AuthSection from './components/AuthSection.jsx';
import BottomNav from './components/BottomNav.jsx';

const AdminDashboard = lazy(() => import('./components/AdminDashboard.jsx'));
const UserDashboard = lazy(() => import('./components/UserDashboard.jsx'));
const AuthModal = lazy(() => import('./components/AuthModal.jsx'));
const RIAAssistant = lazy(() => import('./components/RIAAssistant.jsx'));
const TimelineFeed = lazy(() => import('./components/TimelineFeed.jsx'));
const ContactPage = lazy(() => import('./components/ContactPage.jsx'));
const UserGuidePage = lazy(() => import('./components/UserGuidePage.jsx'));
const AboutPage = lazy(() => import('./components/AboutPage.jsx'));

const LoadingOverlay = () => (
  <div className="fixed inset-0 z-[3000] bg-[#0A0A0F] flex items-center justify-center">
    <Loader2 className="w-10 h-10 text-rose-600 animate-spin" />
  </div>
);

// Route guard: redirect if not logged in
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  if (loading) return <LoadingOverlay />;
  if (!currentUser) return <Navigate to="/" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Main landing page
const LandingPage = ({ onLogout, openAuth, handleSectionNav, handleAdminToggle }) => {
  const { currentUser, isAdmin, loading } = useAuth();
  const { stories, highlights, posts, members, journeys, loadData } = useData();
  const navigate = useNavigate();

  const [selectedStory, setSelectedStory] = useState(null);
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [scrollY, setScrollY] = useState(0);
  const [uiSettings, setUiSettings] = useState({
    showHero: true, showGallery: true, showStories: true,
    showHighlights: true, showMembers: true, showJourneys: true,
  });
  const [activeSection, setActiveSection] = useState('home');

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('ibr_ui_settings') || '{}');
      if (Object.keys(saved).length > 0) setUiSettings(prev => ({ ...prev, ...saved }));
    } catch {}
    window.addEventListener('ibr-ui-settings', (e) => {
      if (e.detail) setUiSettings(prev => ({ ...prev, ...e.detail }));
    });
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Section nav (use the global prop which also handles non-home routes)
  const navigateTo = useCallback((section) => {
    if (handleSectionNav) return handleSectionNav(section);
    const el = document.getElementById(section);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [handleSectionNav]);

  if (loading) return <LoadingOverlay />;

  return (
    <div className="relative min-h-screen selection:bg-rose-600 selection:text-white bg-[#0A0A0F]">
      <CinematicBackground />
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-rose-600 origin-left z-[110]" style={{ scaleX }} />

      <Navbar
        activeSection={activeSection}
        onNavigate={navigateTo}
        onAdminToggle={handleAdminToggle}
        isAdmin={isAdmin}
        currentUser={currentUser}
        onLogout={onLogout}
        onOpenLogin={() => openAuth('login')}
        onOpenRegister={() => openAuth('register')}
        onOpenAdminLogin={() => openAuth('admin-login')}
      />

      <TacticalBack
        isVisible={scrollY > 300}
        onBack={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        currentLabel={activeSection}
      />

      <Suspense fallback={null}>
        <RIAAssistant members={members} journeys={journeys} posts={posts} />
      </Suspense>

      <main className="relative z-10">
        <section id="home">
          {uiSettings.showHero && (
            <Hero onJoin={() => { setAuthMode('register'); setShowAuth(true); }} />
          )}
          <div className="max-w-7xl mx-auto py-12 px-4">
            {uiSettings.showStories && (
              <StoriesBar
                stories={stories}
                onStoryClick={setSelectedStory}
                isAdmin={isAdmin}
                onDeleteStory={(id) => storiesAPI.delete(id).then(loadData)}
              />
            )}
            {uiSettings.showHighlights && (
              <HighlightsBar highlights={highlights} onHighlightClick={setActiveHighlight} />
            )}
          </div>
        </section>

        {uiSettings.showJourneys && (
          <section id="next-journey" className="py-24">
            <NextJourney
              journeys={journeys}
              currentUser={currentUser}
              onLoginRequired={() => { setAuthMode('login'); setShowAuth(true); }}
            />
          </section>
        )}

        {uiSettings.showGallery && (
          <section id="media" className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter">THE VAULT</h2>
              <p className="text-neutral-500 uppercase tracking-[0.4em] text-[10px] font-bold mt-4">Restricted Access Media Archive</p>
            </div>
            <MediaVault
              posts={posts}
              isAdmin={isAdmin}
              currentUser={currentUser}
              onRegisterPrompt={() => { setAuthMode('register'); setShowAuth(true); }}
              onRefresh={loadData}
            />
          </section>
        )}

        {uiSettings.showMembers && (
          <section id="members" className="py-24">
            <Members riders={members} />
          </section>
        )}

        {/* Auth Section - landing page CTA section */}
        {!currentUser && (
          <AuthSection onOpenAuth={(mode) => openAuth(mode)} />
        )}

        <Footer />
      </main>

      {/* Mobile bottom nav */}
      <BottomNav onLoginPrompt={() => openAuth('login')} />
      {/* Note: AuthModal is now rendered at App level so it works on all routes */}

      <AnimatePresence>
        {selectedStory !== null && stories[selectedStory] && (
          <StoryViewer stories={stories} initialIndex={selectedStory} onClose={() => setSelectedStory(null)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeHighlight && (
          <HighlightViewer highlight={activeHighlight} onClose={() => setActiveHighlight(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

const App = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  // ── Global Auth Modal (available on ALL routes) ──────────
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const openAuth = useCallback((mode) => {
    setAuthMode(mode || 'login');
    setShowAuth(true);
  }, []);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]);

  const handleAuthSuccess = useCallback((user) => {
    setShowAuth(false);
    setTimeout(() => {
      if (user?.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    }, 300);
  }, [navigate]);

  // Section nav: navigate to home then scroll to section
  const handleSectionNav = useCallback((section) => {
    if (window.location.pathname === '/') {
      const el = document.getElementById(section);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(section);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    }
  }, [navigate]);

  // Admin toggle
  const handleAdminToggle = useCallback(() => {
    if (isAdmin) navigate('/admin');
    else openAuth('admin-login');
  }, [isAdmin, navigate, openAuth]);

  return (
    <>
      {/* ── Global Auth Modal (renders on every route) ──── */}
      <Suspense fallback={null}>
        <AnimatePresence mode="wait">
          {showAuth && (
            <AuthModal
              initialMode={authMode}
              onClose={() => setShowAuth(false)}
              onSuccess={handleAuthSuccess}
            />
          )}
        </AnimatePresence>
      </Suspense>

      <Suspense fallback={<LoadingOverlay />}>
        <Routes>
          {/* Landing page */}
          <Route path="/" element={
            <LandingPage
              onLogout={handleLogout}
              openAuth={openAuth}
              handleSectionNav={handleSectionNav}
              handleAdminToggle={handleAdminToggle}
            />
          } />

          {/* User Dashboard */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-[#0A0A0F]">
                <Navbar
                  activeSection="dashboard"
                  onNavigate={handleSectionNav}
                  onAdminToggle={handleAdminToggle}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onOpenLogin={() => openAuth('login')}
                  onOpenRegister={() => openAuth('register')}
                  onOpenAdminLogin={() => openAuth('admin-login')}
                  dashboardMode
                />
                <div className="pt-20 md:pt-28 pb-24 md:pb-16 px-4 max-w-6xl mx-auto">
                  <UserDashboard user={currentUser} onLogout={handleLogout} onNavigate={handleSectionNav} />
                </div>
                <ChatSystem />
                <BottomNav onLoginPrompt={() => openAuth('login')} />
              </div>
            </ProtectedRoute>
          } />

          {/* Admin Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <div className="min-h-screen bg-[#0A0A0F]">
                <Navbar
                  activeSection="admin"
                  onNavigate={handleSectionNav}
                  onAdminToggle={handleAdminToggle}
                  isAdmin={isAdmin}
                  currentUser={currentUser}
                  onLogout={handleLogout}
                  onOpenLogin={() => openAuth('login')}
                  onOpenRegister={() => openAuth('register')}
                  onOpenAdminLogin={() => openAuth('admin-login')}
                  dashboardMode
                />
                <div className="pt-20 md:pt-28 pb-24 md:pb-8 px-4">
                  <AdminDashboard user={currentUser} onLogout={handleLogout} />
                </div>
                <ChatSystem />
                <BottomNav onLoginPrompt={() => {}} />
              </div>
            </ProtectedRoute>
          } />

          {/* Timeline Feed */}
          <Route path="/timeline" element={
            <div className="min-h-screen bg-[#0A0A0F]">
              <Navbar
                activeSection="timeline"
                onNavigate={handleSectionNav}
                onAdminToggle={handleAdminToggle}
                isAdmin={isAdmin}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenLogin={() => openAuth('login')}
                onOpenRegister={() => openAuth('register')}
                onOpenAdminLogin={() => openAuth('admin-login')}
              />
              <TimelineFeed currentUser={currentUser} isAdmin={isAdmin} />
              <BottomNav onLoginPrompt={() => openAuth('login')} />
            </div>
          } />

          {/* Contact Page */}
          <Route path="/contact" element={
            <div className="min-h-screen bg-[#0A0A0F]">
              <Navbar
                activeSection="contact"
                onNavigate={handleSectionNav}
                onAdminToggle={handleAdminToggle}
                isAdmin={isAdmin}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenLogin={() => openAuth('login')}
                onOpenRegister={() => openAuth('register')}
                onOpenAdminLogin={() => openAuth('admin-login')}
              />
              <ContactPage />
              <BottomNav onLoginPrompt={() => openAuth('login')} />
            </div>
          } />

          {/* User Guide Page */}
          <Route path="/guide" element={
            <div className="min-h-screen bg-[#0A0A0F]">
              <Navbar
                activeSection="guide"
                onNavigate={handleSectionNav}
                onAdminToggle={handleAdminToggle}
                isAdmin={isAdmin}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenLogin={() => openAuth('login')}
                onOpenRegister={() => openAuth('register')}
                onOpenAdminLogin={() => openAuth('admin-login')}
              />
              <UserGuidePage />
              <BottomNav onLoginPrompt={() => openAuth('login')} />
            </div>
          } />

          {/* About Page */}
          <Route path="/about" element={
            <div className="min-h-screen bg-[#0A0A0F]">
              <Navbar
                activeSection="about"
                onNavigate={handleSectionNav}
                onAdminToggle={handleAdminToggle}
                isAdmin={isAdmin}
                currentUser={currentUser}
                onLogout={handleLogout}
                onOpenLogin={() => openAuth('login')}
                onOpenRegister={() => openAuth('register')}
                onOpenAdminLogin={() => openAuth('admin-login')}
              />
              <div className="pt-20">
                <AboutPage />
              </div>
              <BottomNav onLoginPrompt={() => openAuth('login')} />
            </div>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
};

// Story Viewer (unchanged from before)
const StoryViewer = React.memo(({ stories, initialIndex, onClose }) => {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          if (index < stories.length - 1) { setIndex(i => i + 1); return 0; }
          onClose(); return 100;
        }
        return p + 1.25;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [index, stories.length, onClose]);

  const story = stories[index];
  if (!story) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] bg-black/98 backdrop-blur-3xl flex items-center justify-center"
      onClick={onClose}
    >
      <div className="absolute top-4 left-0 right-0 px-4 z-[1510] flex gap-1.5">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-rose-600 transition-all duration-100" style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>
      <button onClick={onClose} className="absolute top-10 right-6 text-white z-[1510] p-2 bg-black/40 rounded-full hover:bg-rose-600 transition-colors">
        <X className="w-7 h-7" />
      </button>
      {/* Prev / Next tap zones */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-[1510] cursor-pointer"
        onClick={(e) => { e.stopPropagation(); if (index > 0) { setIndex(i => i - 1); setProgress(0); } }} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-[1510] cursor-pointer"
        onClick={(e) => { e.stopPropagation(); if (index < stories.length - 1) { setIndex(i => i + 1); setProgress(0); } else onClose(); }} />
      <div className="relative w-full max-w-lg aspect-[9/16] bg-neutral-900 shadow-2xl overflow-hidden rounded-[40px] border border-white/5" onClick={e => e.stopPropagation()}>
        {story.type === 'video' ? (
          <video src={story.url} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={story.url} className="w-full h-full object-cover" loading="lazy" alt="" />
        )}
        {story.caption && (
          <div className="absolute bottom-12 left-0 right-0 px-6">
            <p className="text-white text-lg font-bold text-center drop-shadow-2xl">{story.caption}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Highlight Viewer — shows stories belonging to a highlight
const HighlightViewer = React.memo(({ highlight, onClose }) => {
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  // highlight.storyIds is an array of story IDs; we display the cover + title since we don't have individual story objects
  // Fall back to showing the cover image as a single "story"
  const slides = highlight.stories?.length > 0
    ? highlight.stories
    : [{ url: highlight.cover, type: 'photo', caption: highlight.title }];

  useEffect(() => {
    setProgress(0);
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (index < slides.length - 1) { setIndex(i => i + 1); return 0; }
          onClose(); return 100;
        }
        return p + 1.5;
      });
    }, 50);
    return () => clearInterval(timer);
  }, [index, slides.length, onClose]);

  const slide = slides[index];
  if (!slide) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[1500] bg-black/98 backdrop-blur-3xl flex items-center justify-center"
      onClick={onClose}
    >
      {/* Progress bars */}
      <div className="absolute top-4 left-0 right-0 px-4 z-[1510] flex gap-1.5">
        {slides.map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-amber-500 transition-all duration-100"
              style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }} />
          </div>
        ))}
      </div>
      {/* Highlight title */}
      <div className="absolute top-4 left-4 z-[1510] flex items-center gap-3 mt-6">
        <div className="w-8 h-8 rounded-xl overflow-hidden border-2 border-amber-500/60">
          <img src={highlight.cover} alt="" className="w-full h-full object-cover" />
        </div>
        <span className="text-white font-black text-xs uppercase tracking-widest">{highlight.title}</span>
      </div>
      <button onClick={onClose} className="absolute top-12 right-6 text-white z-[1510] p-2 bg-black/40 rounded-full hover:bg-rose-600 transition-colors">
        <X className="w-7 h-7" />
      </button>
      {/* Prev/Next zones */}
      <div className="absolute inset-y-0 left-0 w-1/3 z-[1510] cursor-pointer"
        onClick={e => { e.stopPropagation(); if (index > 0) { setIndex(i => i - 1); setProgress(0); } }} />
      <div className="absolute inset-y-0 right-0 w-1/3 z-[1510] cursor-pointer"
        onClick={e => { e.stopPropagation(); if (index < slides.length - 1) { setIndex(i => i + 1); setProgress(0); } else onClose(); }} />
      {/* Story card */}
      <div className="relative w-full max-w-lg aspect-[9/16] bg-neutral-900 shadow-2xl overflow-hidden rounded-[40px] border border-white/5" onClick={e => e.stopPropagation()}>
        {slide.type === 'video' ? (
          <video src={slide.url} autoPlay playsInline className="w-full h-full object-cover" />
        ) : (
          <img src={slide.url} className="w-full h-full object-cover" loading="lazy" alt="" />
        )}
        {slide.caption && (
          <div className="absolute bottom-12 left-0 right-0 px-6">
            <p className="text-white text-lg font-bold text-center drop-shadow-2xl">{slide.caption}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
});

export default App;
