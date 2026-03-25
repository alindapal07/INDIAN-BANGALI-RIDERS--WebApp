import React from 'react';
import { motion } from 'framer-motion';

const HighlightsBar = ({ highlights, onHighlightClick }) => {
  if (!highlights || highlights.length === 0) return null;

  return (
    <div className="flex gap-6 overflow-x-auto no-scrollbar py-6">
      {highlights.map((h, i) => (
        <motion.div
          key={h._id || h.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          onClick={() => onHighlightClick(h)}
          className="flex-shrink-0 cursor-pointer group"
        >
          <div className="w-20 h-20 rounded-[20px] overflow-hidden ring-2 ring-white/10 group-hover:ring-rose-500 transition-all">
            <img src={h.cover} alt={h.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-neutral-500 text-center mt-2 group-hover:text-white transition-colors">{h.title}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default HighlightsBar;
