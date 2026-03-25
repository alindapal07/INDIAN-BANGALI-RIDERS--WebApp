import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { postsAPI } from '../api/index.js';
import { LayoutGrid, ZoomIn } from 'lucide-react';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsAPI.getAll()
      .then(res => {
        const photos = res.data.filter(p => p.type === 'photo');
        setImages(photos);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-24">
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[2px] w-12 bg-rose-600" />
          <p className="text-rose-500 uppercase tracking-[0.4em] text-[10px] font-black">Visual Intel</p>
        </div>
        <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-neutral-900 dark:text-white">
          THE <span className="text-neutral-800 [-webkit-text-stroke:1px_white]">GALLERY</span>
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><LayoutGrid className="w-10 h-10 text-rose-500 animate-pulse" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map(img => (
            <motion.div key={img._id || img.id} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="relative aspect-square rounded-2xl overflow-hidden group border border-white/5 cursor-pointer hover:border-rose-500/30">
              <img src={img.imageUrl} alt={img.description} className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center backdrop-blur-sm">
                <ZoomIn className="w-8 h-8 text-rose-500" />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Gallery;
