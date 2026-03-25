import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';

const TacticalBack = ({ isVisible, onBack, currentLabel }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          onClick={onBack}
          className="fixed bottom-40 left-6 md:left-12 z-[100] p-4 glass rounded-2xl border border-white/10 text-white hover:border-rose-500 hover:text-rose-500 transition-all shadow-2xl flex items-center gap-3 group"
        >
          <ArrowUp className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
          <span className="hidden md:block text-[9px] font-black uppercase tracking-[0.3em] max-w-24 truncate">{currentLabel}</span>
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export default TacticalBack;
