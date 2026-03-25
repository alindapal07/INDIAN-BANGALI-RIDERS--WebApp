import React from 'react';
import { motion } from 'framer-motion';

const Members = ({ riders }) => {
  const founders = riders.filter(r => r.category === 'founder');
  const elites = riders.filter(r => r.category === 'elite');
  const community = riders.filter(r => r.category === 'community');

  const RiderCard = ({ rider, size = 'normal' }) => (
    <motion.div
      whileHover={{ y: -8 }}
      className={`glass rounded-3xl overflow-hidden border border-white/5 hover:border-rose-500/30 transition-all duration-500 group ${size === 'large' ? 'col-span-2' : ''}`}
    >
      <div className={`relative overflow-hidden ${size === 'large' ? 'h-96' : 'h-72'}`}>
        <img src={rider.image} alt={rider.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className={`text-[9px] font-black uppercase tracking-[0.4em] mb-2 ${rider.category === 'founder' ? 'text-rose-500' : rider.category === 'elite' ? 'text-amber-500' : 'text-neutral-500'}`}>
            ◆ {rider.category}
          </p>
          <h4 className="text-xl font-black uppercase italic text-white leading-none">{rider.name}</h4>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mt-1">{rider.bike}</p>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[2px] w-12 bg-rose-600" />
          <p className="text-rose-500 uppercase tracking-[0.4em] text-[10px] font-black">The Brotherhood</p>
        </div>
        <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-neutral-900 dark:text-white">
          THE <span className="text-neutral-800 [-webkit-text-stroke:1px_white]">PACK</span>
        </h2>
      </div>

      {founders.length > 0 && (
        <div className="mb-12">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-rose-500 mb-6">— Founders</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {founders.map(r => <RiderCard key={r._id || r.id} rider={r} size="large" />)}
          </div>
        </div>
      )}
      {elites.length > 0 && (
        <div className="mb-12">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-amber-500 mb-6">— Elite Members</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {elites.map(r => <RiderCard key={r._id || r.id} rider={r} />)}
          </div>
        </div>
      )}
      {community.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-500 mb-6">— Community</p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {community.map(r => <RiderCard key={r._id || r.id} rider={r} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default Members;
