import React from 'react';
import { motion } from 'framer-motion';
import { Map, MapPin } from 'lucide-react';

const JourneyMap = ({ route }) => {
  return (
    <div className="relative w-full aspect-[21/9] rounded-3xl overflow-hidden glass border border-white/10 group cursor-pointer hover:border-rose-500/30 transition-all">
      {/* Decorative Interactive Background for Map */}
      <div className="absolute inset-0 bg-black/60 z-0">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center grayscale mix-blend-screen group-hover:opacity-40 transition-opacity duration-1000" />
      </div>
      
      {/* Map Scanning Line Effect */}
      <motion.div 
        animate={{ y: ['0%', '100%', '0%'] }} 
        transition={{ duration: 4, ease: "linear", repeat: Infinity }} 
        className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent z-10 opacity-50"
      />

      {/* Center Intel */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center">
        <MapPin className="w-12 h-12 text-rose-500 mb-4 animate-bounce" />
        <h4 className="text-2xl font-black uppercase tracking-widest text-white italic">{route || 'UNKNOWN SECTOR'}</h4>
        <p className="text-[10px] text-neutral-400 uppercase tracking-[0.5em] font-bold mt-2 flex items-center gap-2">
          <Map className="w-4 h-4 text-rose-500" /> TACTICAL MAPPING ONLINE
        </p>
      </div>
    </div>
  );
};

export default JourneyMap;
