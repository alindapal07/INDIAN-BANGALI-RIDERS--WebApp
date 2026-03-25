import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Shield, User, ChevronRight, LogIn, UserPlus, Lock } from 'lucide-react';

/**
 * Stylish landing-page Login / Sign-Up section.
 * Shows two cards: Member Login / Sign Up and Admin Login,
 * and calls onOpenAuth(mode) to open the shared AuthModal.
 */
const AuthSection = ({ onOpenAuth }) => {
  const [hovered, setHovered] = useState(null);

  const options = [
    {
      id: 'login',
      icon: LogIn,
      emoji: '🏍️',
      title: 'Member Login',
      subtitle: 'Access your rider dashboard',
      actions: [
        { label: 'Sign In', mode: 'login', style: 'primary' },
        { label: 'Join the Pack', mode: 'register', style: 'outline' },
      ],
      gradient: 'from-rose-900/40 to-rose-950/20',
      border: 'border-rose-600/20 hover:border-rose-500/40',
      accentColor: 'text-rose-400',
      glowColor: 'shadow-rose-900/40',
    },
    {
      id: 'admin',
      icon: Shield,
      emoji: '👑',
      title: 'Admin Portal',
      subtitle: 'Command center access',
      actions: [
        { label: 'Admin Login', mode: 'admin-login', style: 'primary' },
      ],
      gradient: 'from-amber-900/30 to-amber-950/10',
      border: 'border-amber-600/20 hover:border-amber-500/40',
      accentColor: 'text-amber-400',
      glowColor: 'shadow-amber-900/30',
    },
  ];

  return (
    <section id="auth" className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-600/10 border border-rose-600/20 rounded-full px-4 py-1.5 mb-6">
            <Lock className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.4em]">Restricted Access</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white mb-4">
            JOIN THE PACK
          </h2>
          <p className="text-neutral-500 text-sm max-w-md mx-auto">
            New members require one-time admin approval. Once approved, full access is instant on every login.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {options.map((opt) => (
            <motion.div
              key={opt.id}
              onHoverStart={() => setHovered(opt.id)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -6, scale: 1.01 }}
              className={`relative bg-gradient-to-br ${opt.gradient} border ${opt.border} rounded-3xl p-8 overflow-hidden transition-all duration-300 cursor-default ${hovered === opt.id ? `shadow-2xl ${opt.glowColor}` : ''}`}
            >
              {/* Background effect */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.03),transparent_70%)]" />
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5 text-8xl flex items-center justify-center select-none pointer-events-none">
                {opt.emoji}
              </div>

              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mb-5 ${opt.accentColor}`}>
                  <opt.icon className="w-6 h-6" />
                </div>

                {/* Text */}
                <h3 className="text-white text-xl font-black tracking-tight mb-1">{opt.title}</h3>
                <p className={`text-sm mb-8 ${opt.accentColor} opacity-80 font-medium`}>{opt.subtitle}</p>

                {/* Approval note for member card */}
                {opt.id === 'login' && (
                  <div className="flex items-start gap-2 bg-white/4 border border-white/8 rounded-xl px-3 py-2.5 mb-6">
                    <span className="text-amber-400 mt-0.5">⏱</span>
                    <p className="text-neutral-400 text-[11px] leading-relaxed">
                      First signup needs one-time admin review. Subsequent logins are instant.
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  {opt.actions.map((action) => (
                    <button
                      key={action.mode}
                      onClick={() => onOpenAuth(action.mode)}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 ${
                        action.style === 'primary'
                          ? 'bg-white text-black hover:bg-rose-600 hover:text-white shadow-[0_8px_20px_rgba(255,255,255,0.1)]'
                          : 'border border-white/15 text-white hover:bg-white/10'
                      }`}
                    >
                      {action.style === 'primary' ? <Zap className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom trust badges */}
        <div className="flex items-center justify-center gap-8 mt-10 flex-wrap">
          {[
            { icon: Shield, label: 'Secure Auth' },
            { icon: User, label: 'Admin Verified' },
            { icon: Zap, label: 'Instant Access' },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-2 text-neutral-600">
              <b.icon className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">{b.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
