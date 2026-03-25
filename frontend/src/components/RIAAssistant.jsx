import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Mic, MicOff, Send, X, Loader2, Bot, Volume2, VolumeX, Languages, Square } from 'lucide-react';
import { aiAPI } from '../api/index.js';

const RIAAssistant = ({ members, journeys, posts }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState('en');
  const [messages, setMessages] = useState([{ role: 'ria', text: "Systems online. Pack Intelligence RIA at your service. How can I assist your mission today?" }]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);

  const scrollRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{ role: 'ria', text: language === 'bn' ? "সিস্টেম অনলাইন। আপনার মিশনের জন্য আমি কিভাবে সাহায্য করতে পারি?" : "Systems online. Pack Intelligence RIA at your service. How can I assist your mission today?" }]);
    }
  }, [language]);

  const stopSpeaking = () => {
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch (e) {} sourceRef.current = null; setIsSpeaking(false); }
  };

  const handleSend = async (text) => {
    if (!text.trim()) return;
    stopSpeaking();
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInputValue('');
    setLoading(true);
    try {
      const res = await aiAPI.askRIA({ prompt: text, context: { members, journeys, posts }, language });
      setMessages(prev => [...prev, { role: 'ria', text: res.data.text }]);
      if (audioEnabled && res.data.audio) playAudio(res.data.audio);
    } catch {
      setMessages(prev => [...prev, { role: 'ria', text: 'Neural relay disrupted. Please try again.' }]);
    }
    setLoading(false);
  };

  const playAudio = async (base64) => {
    try {
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
      stopSpeaking();
      setIsSpeaking(true);
      const bytes = new Uint8Array(atob(base64).split('').map(c => c.charCodeAt(0)));
      const dataInt16 = new Int16Array(bytes.buffer);
      const buffer = audioContextRef.current.createBuffer(1, dataInt16.length, 24000);
      const channelData = buffer.getChannelData(0);
      for (let i = 0; i < dataInt16.length; i++) channelData[i] = dataInt16[i] / 32768.0;
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => { setIsSpeaking(false); sourceRef.current = null; };
      sourceRef.current = source;
      source.start();
    } catch { setIsSpeaking(false); }
  };

  const toggleListen = () => {
    if (isListening) { setIsListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice recognition not supported."); return; }
    const rec = new SR();
    rec.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e) => handleSend(e.results[0][0].transcript);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  return (
    <>
      <div className="fixed bottom-10 right-10 z-[100] flex flex-col items-end gap-4">
        <AnimatePresence>
          {isSpeaking && (
            <motion.button initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} onClick={stopSpeaking} className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(225,29,72,0.5)] border border-rose-500 animate-pulse" title="Stop Transmission">
              <Square className="w-5 h-5 fill-current" />
            </motion.button>
          )}
        </AnimatePresence>
        <motion.button onClick={() => setIsOpen(!isOpen)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-[0_0_30px_rgba(225,29,72,0.3)] border border-rose-500/30 ${isOpen ? 'bg-rose-600' : 'bg-[#0A0A0F] glass'}`}>
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ opacity: 0, rotate: 90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: -90 }}><X className="w-8 h-8 text-white" /></motion.div>
            ) : (
              <motion.div key="open" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
                <Bot className="w-8 h-8 text-rose-500" />
                <div className={`absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ${isSpeaking ? 'animate-ping' : 'animate-pulse'}`} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 100, x: 50 }} animate={{ opacity: 1, scale: 1, y: 0, x: 0 }} exit={{ opacity: 0, scale: 0.9, y: 100, x: 50 }} className="fixed bottom-32 right-10 z-[100] w-[90vw] max-w-[420px] h-[650px] glass rounded-[40px] border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden">
            <div className="p-6 bg-rose-600/5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-lg"><Bot className="w-6 h-6" /></div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">RIA MISSION-OS</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse" />
                    <span className="text-[8px] font-black text-neutral-500 uppercase tracking-[0.3em]">PROTOCOL: {language === 'bn' ? 'BENGALI_UPLINK' : 'ENGLISH_ACTIVE'}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-2 transition-all border border-white/5">
                  <Languages className={`w-4 h-4 ${language === 'bn' ? 'text-rose-500' : 'text-neutral-400'}`} />
                  <span className="text-[10px] font-black text-white">{language === 'en' ? 'EN' : 'BN'}</span>
                </button>
                <button onClick={() => setAudioEnabled(!audioEnabled)} className={`p-3 rounded-xl transition-all ${audioEnabled ? 'text-rose-500 bg-rose-500/10' : 'text-neutral-500 bg-neutral-900'}`}>
                  {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar bg-neutral-950/20">
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-5 rounded-3xl text-[13px] font-medium leading-relaxed ${m.role === 'user' ? 'bg-rose-600 text-white rounded-br-none shadow-xl shadow-rose-600/10' : 'bg-white/5 border border-white/10 text-neutral-200 rounded-bl-none backdrop-blur-md'} ${language === 'bn' ? 'bengali-font text-base' : ''}`}>
                    {m.text}
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="p-5 bg-white/5 border border-white/10 rounded-3xl rounded-bl-none">
                    <div className="flex gap-1.5">
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                      <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-8 border-t border-white/10 bg-black/40 relative">
              <AnimatePresence>
                {isSpeaking && (
                  <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} onClick={stopSpeaking} className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-2 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95">
                    <Square className="w-3 h-3 fill-current" /> Stop Transmission
                  </motion.button>
                )}
              </AnimatePresence>
              <div className="relative flex items-center gap-4">
                <button onClick={toggleListen} className={`p-5 rounded-2xl transition-all shadow-lg ${isListening ? 'bg-rose-600 text-white animate-pulse' : 'bg-white/5 text-neutral-500 hover:text-white border border-white/5'}`}>
                  {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                </button>
                <div className="flex-1 relative">
                  <input value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)} placeholder={language === 'bn' ? "বার্তা লিখুন..." : "Enter Tactical Query..."} className={`w-full bg-neutral-900/80 border border-neutral-800 rounded-2xl px-6 py-5 text-sm font-bold outline-none focus:border-rose-600 transition-all placeholder:text-neutral-700 ${language === 'bn' ? 'bengali-font' : ''}`} />
                  <button onClick={() => handleSend(inputValue)} className="absolute right-3 top-3 p-2.5 bg-rose-600 text-white rounded-xl hover:scale-110 active:scale-90 transition-all shadow-lg shadow-rose-600/20"><Send className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between">
                <p className="text-[8px] text-neutral-700 font-black uppercase tracking-[0.4em]">{isSpeaking ? 'RIA_TRANSMITTING_PCM_STREAM' : 'SECURE_UPLINK_READY'}</p>
                <div className="flex gap-1">
                  <div className={`w-1 h-1 rounded-full ${isListening ? 'bg-rose-500' : 'bg-neutral-800'}`} />
                  <div className={`w-1 h-1 rounded-full ${isSpeaking ? 'bg-blue-500' : 'bg-neutral-800'}`} />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default RIAAssistant;
