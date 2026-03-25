import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { heroSlidesAPI } from '../api/index.js';

const Hero = ({ onJoin }) => {
  const [current, setCurrent] = useState(0);
  const [slides, setSlides] = useState([]);
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, 400], [1, 0]);

  useEffect(() => {
    heroSlidesAPI.getAll().then(res => setSlides(res.data || [])).catch(() => setSlides([]));
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides]);

  const nextSlide = () => setCurrent(prev => (prev + 1) % slides.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + slides.length) % slides.length);

  if (slides.length === 0) {
    return (
      <div className="relative h-[100vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
        <div className="relative z-20 text-center px-6 max-w-6xl pt-20">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-[1px] w-12 bg-rose-600" />
            <span className="text-rose-500 text-[11px] font-black tracking-[0.5em] uppercase flex items-center gap-2"><Sparkles className="w-3 h-3" /> BENGALI HERITAGE</span>
            <div className="h-[1px] w-12 bg-rose-600" />
          </div>
          <h1 className="text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.85] mb-12 text-white">
            OWN THE <span className="text-transparent bg-clip-text bg-gradient-to-b from-rose-500 to-rose-900">ROAD</span>
          </h1>
          <p className="text-neutral-400 text-2xl max-w-3xl mx-auto font-light tracking-wide italic mb-16">ESTABLISHED IN KOLKATA. BENGALI HEART.</p>
          <button onClick={onJoin} className="px-16 py-6 bg-white text-black font-black text-xs tracking-[0.3em] rounded-[24px] transition-all shadow-xl hover:bg-rose-600 hover:text-white uppercase">ENLIST IN THE PACK</button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[100vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={slides[current]._id || slides[current].id} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-[#0A0A0F] z-10" />
          <img src={slides[current].image} alt="Hero slide" className="w-full h-full object-cover" />
        </motion.div>
      </AnimatePresence>

      <motion.div style={{ opacity }} className="relative z-20 text-center px-6 md:px-4 max-w-6xl pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="h-[1px] w-8 md:w-12 bg-rose-600" />
          <span className="text-rose-500 text-[9px] md:text-[11px] font-black tracking-[0.4em] md:tracking-[0.5em] uppercase flex items-center gap-2"><Sparkles className="w-3 h-3" /> BENGALI HERITAGE</span>
          <div className="h-[1px] w-8 md:w-12 bg-rose-600" />
        </motion.div>

        <motion.h1 key={slides[current].title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase italic leading-[0.95] md:leading-[0.85] mb-8 md:mb-12 text-white">
          {slides[current].title.split(' ')[0]} <span className="text-transparent bg-clip-text bg-gradient-to-b from-rose-500 to-rose-900 drop-shadow-2xl">{slides[current].title.split(' ').slice(1).join(' ')}</span>
        </motion.h1>

        <motion.p className="text-neutral-400 text-sm md:text-2xl max-w-3xl mx-auto font-light tracking-wide italic mb-10 md:mb-16 px-4">{slides[current].subtitle}</motion.p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <button onClick={onJoin} className="w-full sm:w-auto px-10 md:px-16 py-4 md:py-6 bg-white text-black font-black text-[10px] md:text-xs tracking-[0.3em] rounded-xl md:rounded-[24px] transition-all shadow-xl hover:bg-rose-600 hover:text-white uppercase">
            ENLIST IN THE PACK
          </button>
        </div>
      </motion.div>

      {slides.length > 1 && (
        <div className="absolute bottom-10 right-6 md:bottom-12 md:right-12 z-30 flex gap-2 md:gap-4">
          <button onClick={prevSlide} className="p-3 md:p-4 glass rounded-full hover:bg-rose-600 transition-all text-white border border-white/5"><ChevronLeft className="w-4 h-4 md:w-6 md:h-6" /></button>
          <button onClick={nextSlide} className="p-3 md:p-4 glass rounded-full hover:bg-rose-600 transition-all text-white border border-white/5"><ChevronRight className="w-4 h-4 md:w-6 md:h-6" /></button>
        </div>
      )}

      <motion.div animate={{ y: [0, 10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-6 md:bottom-16 left-1/2 -translate-x-1/2 z-20 text-white/40 cursor-pointer hidden sm:block" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
        <ChevronDown className="w-8 h-8 md:w-10 md:h-10" />
      </motion.div>
    </div>
  );
};

export default Hero;
