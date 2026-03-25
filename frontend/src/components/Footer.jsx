import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  return (
    <footer className="py-24 border-t border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-rose-950/10 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-rose-600 rounded-[20px] transform -rotate-12 flex items-center justify-center font-black text-white text-3xl shadow-[0_10px_30px_rgba(225,29,72,0.4)]">IBR</div>
          </div>
          <h2 className="text-5xl md:text-8xl font-black uppercase italic tracking-tighter mb-4 text-neutral-900 dark:text-white">
            INDIAN <span className="bengali-font">বাঙালী</span> RIDERS
          </h2>
          <p className="text-neutral-600 uppercase tracking-[0.5em] text-[10px] font-black">Established in Kolkata. Brotherhood Without Borders.</p>
          <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-rose-600 to-transparent mx-auto my-12" />
          <p className="text-[9px] text-neutral-700 font-black uppercase tracking-[0.4em]">
            © {new Date().getFullYear()} IBR — MISSION COG ONLINE. ALL CHANNELS ENCRYPTED.
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
