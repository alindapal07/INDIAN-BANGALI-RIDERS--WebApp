import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Zap, X, ChevronRight, Users, Clock,
  Mountain, Fuel, Star, BookOpen, Phone, Navigation, Camera,
  IndianRupee, Award, Bike, Wind, Globe
} from 'lucide-react';
import BookingForm from './BookingForm';

// Real place images sourced from Unsplash CDN (no API key needed)
const PLACE_IMAGES = {
  'darjeeling': [
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1600431521340-491eca880813?w=800&q=80',
  ],
  'sikkim': [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    'https://images.unsplash.com/photo-1602512098462-5fad47b4f085?w=800&q=80',
  ],
  'manali': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=800&q=80',
    'https://images.unsplash.com/photo-1524912294-19753f6e9044?w=800&q=80',
  ],
  'ladakh': [
    'https://images.unsplash.com/photo-1623490249455-4d5640ec83f2?w=800&q=80',
    'https://images.unsplash.com/photo-1585506942812-e72b29cef752?w=800&q=80',
    'https://images.unsplash.com/photo-1592449602018-07ec48bd3093?w=800&q=80',
  ],
  'gangtok': [
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    'https://images.unsplash.com/photo-1602512098462-5fad47b4f085?w=800&q=80',
  ],
  'pelling': [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=800&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  ],
  'kolkata': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=800&q=80',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&q=80',
  ],
  'default': [
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
    'https://images.unsplash.com/photo-1477587458883-47145ed6979c?w=800&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
  ],
};

const getPlaceImages = (route = '') => {
  const lower = route.toLowerCase();
  for (const [key, imgs] of Object.entries(PLACE_IMAGES)) {
    if (lower.includes(key)) return imgs;
  }
  return PLACE_IMAGES.default;
};

const getDestination = (route = '') => route.split(/[-–→]/).pop().trim();

// ── Journey Card ─────────────────────────────────────────────
const JourneyCard = ({ journey, isSelected, onClick }) => {
  const images = getPlaceImages(journey.route);
  const isUpcoming = journey.status === 'upcoming';

  return (
    <motion.div
      layout
      whileHover={{ y: -6 }}
      onClick={() => onClick(journey)}
      className={`relative rounded-3xl overflow-hidden cursor-pointer border-2 transition-all duration-500 group ${
        isSelected
          ? 'border-rose-500 shadow-[0_0_40px_rgba(225,29,72,0.3)]'
          : 'border-white/8 hover:border-rose-500/40'
      }`}
    >
      {/* Background image */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={images[0]}
          alt={journey.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={e => { e.target.src = PLACE_IMAGES.default[0]; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Status badge */}
        <div className="absolute top-4 left-4">
          {isUpcoming ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 rounded-full shadow-lg shadow-rose-900/50">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-white uppercase tracking-[0.3em]">UPCOMING</span>
            </div>
          ) : (
            <div className="px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full border border-white/10">
              <span className="text-[9px] font-black text-neutral-300 uppercase tracking-[0.3em]">COMPLETED</span>
            </div>
          )}
        </div>

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute top-4 right-4 w-8 h-8 bg-rose-600 rounded-full flex items-center justify-center">
            <Zap className="w-4 h-4 text-white fill-white" />
          </div>
        )}

        {/* Title overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <h3 className="text-white text-xl font-black uppercase italic leading-tight tracking-tighter">
            {journey.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 text-[10px] font-bold uppercase tracking-widest">{journey.route}</span>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div className="glass p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
            <span className="text-[10px] text-neutral-400 font-bold">{journey.date}</span>
          </div>
          {journey.duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="text-[10px] text-neutral-400 font-bold">{journey.duration}</span>
            </div>
          )}
          {journey.distance && (
            <div className="flex items-center gap-2">
              <Wind className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <span className="text-[10px] text-neutral-400 font-bold">{journey.distance}</span>
            </div>
          )}
          {journey.seats && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="text-[10px] text-neutral-400 font-bold">{journey.seats} seats</span>
            </div>
          )}
        </div>

        {journey.description && (
          <p className="text-neutral-500 text-xs leading-relaxed line-clamp-2">{journey.description}</p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div>
            <p className="text-[9px] text-neutral-600 uppercase tracking-widest mb-0.5">Registration Fee</p>
            <div className="flex items-center gap-1">
              <IndianRupee className="w-4 h-4 text-rose-500" />
              <span className="text-2xl font-black text-rose-400">{journey.price?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {isUpcoming && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition shadow-lg shadow-rose-900/40"
            >
              <Bike className="w-3.5 h-3.5" /> Book Ride
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ── Tactical Recon Panel ──────────────────────────────────────
const TacticalReconPanel = ({ journey, onClose, onBook }) => {
  const [activeImg, setActiveImg] = useState(0);
  const images = getPlaceImages(journey.route);
  const destination = getDestination(journey.route);

  const facts = [
    { icon: Mountain, label: 'Terrain', value: 'Mountain Roads' },
    { icon: Fuel, label: 'Fuel Stops', value: 'Every 80-120 km' },
    { icon: Globe, label: 'Best Season', value: 'Apr – Jun, Sep – Nov' },
    { icon: Navigation, label: 'Total Distance', value: journey.distance || '500+ km' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="glass border border-rose-500/20 rounded-[32px] overflow-hidden mb-12 shadow-[0_0_60px_rgba(225,29,72,0.1)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
            <p className="text-rose-500 text-[9px] font-black uppercase tracking-[0.5em]">Tactical Reconnaissance</p>
          </div>
          <h3 className="text-white text-xl font-black uppercase italic">{destination}</h3>
        </div>
        <button onClick={onClose} className="p-2 text-neutral-600 hover:text-white transition glass rounded-xl border border-white/5">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            {/* Main image */}
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <motion.img
                key={activeImg}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                src={images[activeImg]}
                alt={destination}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = PLACE_IMAGES.default[0]; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Camera className="w-3 h-3 text-rose-400" />
                <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-widest">{destination} — Live Intel</span>
              </div>
            </div>
            {/* Thumbnails */}
            <div className="grid grid-cols-3 gap-2">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-rose-500' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover"
                    onError={e => { e.target.src = PLACE_IMAGES.default[i % 3]; }} />
                </button>
              ))}
            </div>
          </div>

          {/* Intel */}
          <div className="space-y-5">
            {/* Journey details */}
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em] text-rose-500 mb-3">— Mission Brief</p>
              <h4 className="text-white text-lg font-black uppercase italic mb-3">{journey.title}</h4>
              {journey.description && (
                <p className="text-neutral-400 text-sm leading-relaxed">{journey.description}</p>
              )}
            </div>

            {/* Facts grid */}
            <div className="grid grid-cols-2 gap-3">
              {facts.map(f => (
                <div key={f.label} className="bg-white/3 border border-white/5 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <f.icon className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-600">{f.label}</span>
                  </div>
                  <p className="text-white text-xs font-bold">{f.value}</p>
                </div>
              ))}
            </div>

            {/* Key info */}
            <div className="space-y-2">
              <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                <span className="text-neutral-500 text-xs">Date</span>
                <span className="text-white text-xs font-bold">{journey.date}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                <span className="text-neutral-500 text-xs">Route</span>
                <span className="text-rose-400 text-xs font-bold">{journey.route}</span>
              </div>
              <div className="flex items-center justify-between py-2.5 border-b border-white/5">
                <span className="text-neutral-500 text-xs">Registration</span>
                <span className="text-2xl text-rose-400 font-black">₹{journey.price?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* CTA */}
            {journey.status === 'upcoming' && (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onBook}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition shadow-[0_8px_30px_rgba(225,29,72,0.4)] flex items-center justify-center gap-3"
              >
                <Bike className="w-5 h-5" />
                Register for This Expedition
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ── Main NextJourney ──────────────────────────────────────────
const NextJourney = ({ journeys = [], currentUser, onLoginRequired }) => {
  const [selectedJourney, setSelectedJourney] = useState(null);
  const [showBooking, setShowBooking] = useState(null);
  const reconRef = useRef(null);

  const upcoming = journeys.filter(j => j.status === 'upcoming');
  const completed = journeys.filter(j => j.status === 'completed');

  const handleSelect = (journey) => {
    if (selectedJourney?._id === journey._id) {
      setSelectedJourney(null);
      return;
    }
    setSelectedJourney(journey);
    setTimeout(() => reconRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  };

  const handleBook = (journey) => {
    if (!currentUser) { onLoginRequired?.(); return; }
    setShowBooking(journey);
  };

  return (
    <div className="max-w-7xl mx-auto px-4">
      {/* Section header */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[2px] w-12 bg-rose-600 shadow-[0_0_10px_#e11d48]" />
          <p className="text-rose-500 uppercase tracking-[0.4em] text-[10px] font-black">Mission Intel</p>
        </div>
        <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-neutral-900 dark:text-white">
          NEXT <span className="text-transparent" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.2)' }}>JOURNEY</span>
        </h2>
        <p className="text-neutral-600 text-sm mt-4">Click any expedition card to load mission visuals and full details</p>
      </div>

      {/* Upcoming missions */}
      {upcoming.length > 0 && (
        <div className="mb-12">
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-rose-500 mb-6 flex items-center gap-3">
            <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse inline-block" />
            Active Missions ({upcoming.length})
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {upcoming.map(j => (
              <JourneyCard
                key={j._id || j.id}
                journey={j}
                isSelected={selectedJourney?._id === j._id}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {upcoming.length === 0 && (
        <div className="glass rounded-3xl p-16 text-center border border-white/5 mb-12">
          <Bike className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
          <p className="text-neutral-600 font-black uppercase tracking-widest">No upcoming expeditions</p>
          <p className="text-neutral-700 text-sm mt-2">Check back soon — new adventures are always brewing</p>
        </div>
      )}

      {/* Tactical Reconnaissance Panel */}
      <div ref={reconRef}>
        <AnimatePresence>
          {selectedJourney && (
            <TacticalReconPanel
              journey={selectedJourney}
              onClose={() => setSelectedJourney(null)}
              onBook={() => handleBook(selectedJourney)}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Completed missions */}
      {completed.length > 0 && (
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neutral-600 mb-6">— Mission Archives ({completed.length})</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 opacity-60">
            {completed.map(j => (
              <JourneyCard
                key={j._id || j.id}
                journey={j}
                isSelected={false}
                onClick={handleSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBooking && (
          <BookingForm
            journey={showBooking}
            onClose={() => setShowBooking(null)}
            onSuccess={() => setShowBooking(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default NextJourney;
