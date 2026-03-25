import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Compass, Activity, User, MessageSquare, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { motion } from 'framer-motion';

const BottomNav = ({ onLoginPrompt }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isAdmin } = useAuth();
  const path = location.pathname;

  const items = [
    { icon: Home, label: 'Home', to: '/', id: 'home' },
    { icon: Compass, label: 'Journeys', to: '/#next-journey', id: 'journeys', scroll: 'next-journey' },
    { icon: Activity, label: 'Feed', to: '/timeline', id: 'timeline' },
    {
      icon: currentUser ? (isAdmin ? Shield : User) : User,
      label: currentUser ? (isAdmin ? 'Admin' : 'Dashboard') : 'Login',
      to: currentUser ? (isAdmin ? '/admin' : '/dashboard') : null,
      id: 'profile',
      action: !currentUser ? onLoginPrompt : null,
    },
    { icon: MessageSquare, label: 'Guide', to: '/guide', id: 'guide' },
  ];

  const isActive = (item) => {
    if (item.to === '/') return path === '/';
    return item.to && path.startsWith(item.to);
  };

  const handleTap = (item) => {
    if (item.action) { item.action(); return; }
    if (item.scroll) {
      if (path !== '/') { navigate('/'); setTimeout(() => { document.getElementById(item.scroll)?.scrollIntoView({ behavior: 'smooth' }); }, 300); }
      else document.getElementById(item.scroll)?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (item.to) navigate(item.to);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Safe area + glass bar */}
      <div className="bg-[#0A0A0F]/95 backdrop-blur-2xl border-t border-white/8 px-2 pb-safe">
        <div className="flex items-center justify-around py-2">
          {items.map((item) => {
            const active = isActive(item);
            return (
              <button
                key={item.id}
                onClick={() => handleTap(item)}
                className="flex flex-col items-center gap-1 min-w-[56px] py-2 px-1 relative"
              >
                {active && (
                  <motion.div
                    layoutId="bottomNavActive"
                    className="absolute inset-0 bg-rose-600/15 rounded-2xl"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
                  />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${active ? 'text-rose-400' : 'text-neutral-500'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider relative z-10 ${active ? 'text-rose-400' : 'text-neutral-600'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
