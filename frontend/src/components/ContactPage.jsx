import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Phone, MessageCircle, Instagram, Facebook, Youtube,
  Twitter, Mail, MapPin, Send, ExternalLink
} from 'lucide-react';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const WHATSAPP_NUM = '919433545958';
  const CALL_NUM = '+919433545958';

  const socials = [
    { icon: Instagram, label: 'Instagram', handle: '@indianbangaliriders', color: 'from-purple-600 to-pink-600', url: 'https://instagram.com/indianbangaliriders' },
    { icon: Facebook, label: 'Facebook', handle: 'Indian Bangali Riders', color: 'from-blue-700 to-blue-500', url: 'https://facebook.com/indianbangaliriders' },
    { icon: Youtube, label: 'YouTube', handle: 'IBR Channel', color: 'from-red-700 to-red-500', url: 'https://youtube.com/@ibriders' },
    { icon: Twitter, label: 'Twitter/X', handle: '@ibriders', color: 'from-neutral-700 to-neutral-900', url: 'https://twitter.com/ibriders' },
    { icon: Mail, label: 'Email', handle: 'admin@ibriders.in', color: 'from-rose-700 to-rose-500', url: 'mailto:admin@ibriders.in' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    // Could send to backend later
    setSent(true);
    setTimeout(() => { setSent(false); setForm({ name: '', email: '', message: '' }); }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] pt-24 pb-24 md:pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-600/10 border border-rose-600/20 rounded-full px-4 py-1.5 mb-6">
            <MapPin className="w-3 h-3 text-rose-400" />
            <span className="text-rose-400 text-[10px] font-black uppercase tracking-[0.4em]">Get In Touch</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter text-white mb-4">CONTACT</h1>
          <p className="text-neutral-500 text-sm">Reach out to the Indian Bangali Riders team</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Direct contact */}
          <div className="space-y-6">
            {/* Call / WhatsApp */}
            <div className="glass border border-white/8 rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-5">— Direct Contact</p>
              <div className="space-y-3">
                <a href={`tel:${CALL_NUM}`}
                  className="flex items-center gap-4 p-4 bg-green-600/10 border border-green-600/20 rounded-2xl hover:border-green-500/40 hover:bg-green-600/20 active:bg-green-600/20 transition group">
                  <div className="w-12 h-12 rounded-xl bg-green-600/20 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Call Us</p>
                    <p className="text-green-400 text-sm font-bold">{CALL_NUM}</p>
                    <p className="text-neutral-600 text-[10px]">Tap to call directly</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-green-400 transition" />
                </a>

                <a href={`https://wa.me/${WHATSAPP_NUM}?text=Hi IBR Team! I have a query.`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 p-4 bg-emerald-600/10 border border-emerald-600/20 rounded-2xl hover:border-emerald-500/40 hover:bg-emerald-600/20 active:bg-emerald-600/20 transition group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">WhatsApp</p>
                    <p className="text-emerald-400 text-sm font-bold">+91 9433545958</p>
                    <p className="text-neutral-600 text-[10px]">Message directly on WhatsApp</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-emerald-400 transition" />
                </a>

                <a href="mailto:admin@ibriders.in"
                  className="flex items-center gap-4 p-4 bg-rose-600/10 border border-rose-600/20 rounded-2xl hover:border-rose-500/40 hover:bg-rose-600/20 active:bg-rose-600/20 transition group">
                  <div className="w-12 h-12 rounded-xl bg-rose-600/20 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Email</p>
                    <p className="text-rose-400 text-sm font-bold">admin@ibriders.in</p>
                    <p className="text-neutral-600 text-[10px]">Usually responds within 24h</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-neutral-600 ml-auto group-hover:text-rose-400 transition" />
                </a>
              </div>
            </div>

            {/* Social Links */}
            <div className="glass border border-white/8 rounded-2xl p-6">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-5">— Follow Us</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {socials.map(s => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 glass border border-white/5 rounded-xl hover:border-white/15 active:border-white/15 transition group">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.color} flex items-center justify-center flex-shrink-0`}>
                      <s.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-black">{s.label}</p>
                      <p className="text-neutral-600 text-[10px] truncate">{s.handle}</p>
                    </div>
                    <ExternalLink className="w-3 h-3 text-neutral-700 ml-auto flex-shrink-0 group-hover:text-neutral-400 transition" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Contact form */}
          <div className="glass border border-white/8 rounded-2xl p-6">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-500 mb-5">— Send a Message</p>
            {sent ? (
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-600/20 border-2 border-green-600/40 flex items-center justify-center mb-4">
                  <Send className="w-7 h-7 text-green-400" />
                </div>
                <p className="text-white font-black text-lg mb-2">Message Sent!</p>
                <p className="text-neutral-500 text-sm">We'll get back to you soon 🏍️</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { key: 'name', label: 'Your Name *', placeholder: 'Rider name', type: 'text' },
                  { key: 'email', label: 'Email *', placeholder: 'your@email.com', type: 'email' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">{f.label}</label>
                    <input type={f.type} required value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 outline-none focus:border-rose-500 transition" />
                  </div>
                ))}
                <div>
                  <label className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5 block">Message *</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Write your message here..."
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-700 outline-none focus:border-rose-500 resize-none transition" />
                </div>
                <button type="submit"
                  className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-700 text-white font-black uppercase text-[11px] tracking-widest rounded-xl transition flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" /> Send Message
                </button>
                <p className="text-[10px] text-neutral-700 text-center">
                  Or WhatsApp us directly at <a href={`https://wa.me/${WHATSAPP_NUM}`} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400">+91 9433545958</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
