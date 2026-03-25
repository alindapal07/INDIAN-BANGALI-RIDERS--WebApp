import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Zap, X, Loader2 } from 'lucide-react';
import { bookingsAPI } from '../api/index.js';

const BookingForm = ({ journey, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '', bikeModel: '', availability: 'confirmed', details: '' });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await bookingsAPI.create({ ...formData, journeyId: journey._id || journey.id, journeyTitle: journey.title });
      setDone(true);
      setTimeout(() => { setDone(false); onSuccess?.(); onClose(); }, 2500);
    } catch (err) {
      alert(err.response?.data?.error || 'Booking failed. Try again.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[500] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-2xl bg-[#0A0A0F] rounded-[48px] overflow-hidden border border-white/5 relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 glass rounded-xl text-neutral-500 hover:text-white z-10"><X className="w-6 h-6" /></button>
        {done ? (
          <div className="p-20 text-center">
            <div className="w-24 h-24 bg-rose-600/10 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-rose-500/20"><Zap className="w-12 h-12 text-rose-500 fill-current" /></div>
            <h3 className="text-3xl font-black uppercase italic text-white">Registration Received!</h3>
            <p className="text-neutral-500 mt-4 font-bold uppercase tracking-widest text-[11px]">Pack command will contact you.</p>
          </div>
        ) : (
          <div className="p-10">
            <div className="mb-8">
              <p className="text-rose-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Expedition Registration</p>
              <h3 className="text-3xl font-black uppercase italic text-white">{journey.title}</h3>
              <div className="flex gap-6 mt-4">
                <span className="flex items-center gap-2 text-[11px] text-neutral-500 font-bold"><Calendar className="w-4 h-4 text-rose-500" /> {journey.date}</span>
                <span className="flex items-center gap-2 text-[11px] text-neutral-500 font-bold"><MapPin className="w-4 h-4 text-rose-500" /> {journey.route}</span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[['name', 'Full Name', 'text', true], ['email', 'Email', 'email', true], ['phone', 'Phone', 'tel', true], ['location', 'Current Location', 'text', true], ['bikeModel', 'Motorcycle Model', 'text', true]].map(([field, ph, type, req]) => (
                <input key={field} required={req} type={type} placeholder={ph} value={formData[field]} onChange={e => setFormData({ ...formData, [field]: e.target.value })} className="bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition-all text-white placeholder-neutral-600" />
              ))}
              <select value={formData.availability} onChange={e => setFormData({ ...formData, availability: e.target.value })} className="bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition-all text-white">
                <option value="confirmed">Confirmed - Ready to Ride</option>
                <option value="tentative">Tentative - Need Details</option>
              </select>
              <textarea placeholder="Additional details (optional)" value={formData.details} onChange={e => setFormData({ ...formData, details: e.target.value })} rows={3} className="md:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-rose-500 transition-all resize-none text-white placeholder-neutral-600" />
              <button type="submit" disabled={loading} className="md:col-span-2 py-6 bg-white text-black font-black uppercase tracking-[0.3em] rounded-[24px] hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-4 disabled:opacity-50">
                {loading ? <Loader2 className="animate-spin w-6 h-6" /> : 'Submit Registration'}
              </button>
            </form>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default BookingForm;
