import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, KeyRound, Key, RefreshCcw, X, Loader2, KeySquare } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

// Required field marker component
const Req = () => <span className="text-rose-500 ml-0.5 font-black" title="Required field">*</span>;

const AuthModal = ({ onClose, onSuccess, initialMode = 'login' }) => {
  const { login } = useAuth();
  const { t } = useTranslation();
  
  // Modes: 'login', 'register', 'admin-login', 'admin-register', 'forgot'
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1); // Usually Step 1: Request, Step 2: Verify OTP
  const [loading, setLoading] = useState(false);

  
  // Form Data
  const [form, setForm] = useState({
    username: '', email: '', password: '', mpin: '', otp: '', passcode: '', newPassword: '', newMpin: ''
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const apiCall = async (endpoint, data) => {
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth${endpoint}`, data);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      const backendError = err.response?.data?.error;
      const networkError = err.message;
      
      let displayError = backendError || networkError || 'Operation failed';
      
      if (displayError.includes('buffering timed out') || displayError.includes('Mongo')) {
        displayError = "🚨 DATABASE ERROR: Your MongoDB Atlas cluster is rejecting the connection! Please go to MongoDB Atlas, ensure your IP is whitelisted, and verify the Database Username/Password.";
      } else if (displayError === 'Network Error') {
         displayError = "🚨 SERVER ERROR: Cannot reach the backend. Is the backend server running on port 5000?";
      }

      alert(displayError);
      throw err;
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();

    try {
      // 1. User Register Flow
      if (mode === 'register') {
        if (step === 1) {
          await apiCall('/register/request', { email: form.email });
          setStep(2);
        } else {
          const res = await apiCall('/register/verify', { email: form.email, otp: form.otp, password: form.password, mpin: form.mpin, username: form.username });
          login(res.user, res.token);
          onSuccess(res.user);
        }
      }

      // 2. User Login Flow
      else if (mode === 'login') {
        const res = await apiCall('/login', { email: form.email, password: form.password, mpin: form.mpin });
        login(res.user, res.token);
        onSuccess(res.user);
      }

      // 3. Admin Login Flow
      else if (mode === 'admin-login') {
        if (step === 1) {
          await apiCall('/admin/login/step1', { email: form.email, password: form.password });
          setStep(2);
        } else {
          const res = await apiCall('/admin/login/step2', { email: form.email, otp: form.otp, mpin: form.mpin });
          login(res.user, res.token);
          onSuccess(res.user);
        }
      }

      // 4. Admin Register Flow
      else if (mode === 'admin-register') {
        await apiCall('/admin/register', { username: form.username, email: form.email, password: form.password, mpin: form.mpin, passcode: form.passcode });
        alert('Admin generated successfully. Please login.');
        setMode('admin-login');
      }

      // 5. Forgot Flows
      else if (mode === 'forgot') {
        if (step === 1) {
          await apiCall('/forgot/request', { email: form.email });
          setStep(2);
        } else {
          await apiCall('/forgot/reset', { email: form.email, otp: form.otp, newPassword: form.newPassword, newMpin: form.newMpin });
          alert('Security Credentials Updated successfully.');
          setMode('login');
          setStep(1);
        }
      }
    } catch (err) {}
  };

  const resetMode = (m) => { setMode(m); setStep(1); setForm({ username: '', email: '', password: '', mpin: '', otp: '', passcode: '', newPassword: '', newMpin: ''}); };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} className="w-full max-w-md bg-[#0A0A0F] rounded-[48px] overflow-hidden border border-white/5 relative">
        <button onClick={onClose} className="absolute top-8 right-8 p-3 glass rounded-xl text-neutral-500 hover:text-white z-10"><X className="w-6 h-6" /></button>
        <div className="p-10 text-center border-b border-white/5 bg-black/50">
          <div className="w-16 h-16 bg-rose-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
            {mode.includes('admin') ? <KeyRound className="w-8 h-8 text-rose-500" /> : <User className="w-8 h-8 text-rose-500" />}
          </div>
          <h3 className="text-2xl font-black uppercase italic text-white tracking-tighter">
            {mode === 'login' && 'User Login'}
            {mode === 'register' && (step === 1 ? 'Sign Up' : 'Verify Email')}
            {mode === 'admin-login' && (step === 1 ? 'Admin Login' : 'Enter 2FA Code')}
            {mode === 'admin-register' && 'Create Admin'}
            {mode === 'forgot' && (step === 1 ? 'Recover Credentials' : 'Reset Password / MPIN')}
          </h3>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-2">
            {step === 2 && mode !== 'admin-register' ? 'Check your email for OTP' : 'Enter your details below'}
          </p>
        </div>

        <div className="p-10">
          <form onSubmit={handleAction} className="space-y-4">
            
            {/* Step 1 Inputs */}
            {step === 1 && (
              <>
                {(mode === 'register' || mode === 'admin-register') && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('username')}<Req /></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input required name="username" value={form.username} onChange={handleChange} placeholder={t('username')} className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('email')}<Req /></label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input required name="email" type="email" value={form.email} onChange={handleChange} placeholder={t('email')} className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                  </div>
                </div>

                {/* For login, admin-login, admin-register we need password in Step 1 */}
                {(mode === 'admin-login' || mode === 'admin-register') && (
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-neutral-500 mb-1.5 block">{t('password')}<Req /></label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input required name="password" type="password" value={form.password} onChange={handleChange} placeholder={t('password')} className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </div>
                )}

                {/* Normal Login accepts MPIN or Password */}
                {mode === 'login' && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password (Optional if using MPIN)" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                    <div className="relative">
                      <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input name="mpin" type="password" maxLength={6} pattern="\d*" value={form.mpin} onChange={handleChange} placeholder="6-Digit MPIN (Optional)" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </>
                )}

                {mode === 'admin-register' && (
                  <>
                    <div className="relative">
                      <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input required name="mpin" type="password" maxLength={6} pattern="\d*" value={form.mpin} onChange={handleChange} placeholder="Set 6-Digit MPIN" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                      <input required name="passcode" type="password" value={form.passcode} onChange={handleChange} placeholder="Admin Creation Code" className="w-full bg-rose-900/10 border border-rose-500/30 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step 2 Inputs */}
            {step === 2 && (
              <>
                <div className="relative mb-6">
                  <RefreshCcw className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-500" />
                  <input required name="otp" type="text" maxLength={6} value={form.otp} onChange={handleChange} placeholder="Enter 6-Digit OTP" className="w-full bg-rose-900/10 border border-rose-500/30 rounded-2xl pl-12 pr-6 py-4 text-lg font-black tracking-[0.5em] outline-none focus:border-rose-500 text-white text-center" />
                </div>
                
                {mode === 'register' && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input required name="password" type="password" value={form.password} onChange={handleChange} placeholder="Create Password" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                    <div className="relative">
                      <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input required name="mpin" type="password" maxLength={6} pattern="\d*" value={form.mpin} onChange={handleChange} placeholder="Create 6-Digit MPIN" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </>
                )}

                {mode === 'admin-login' && (
                  <div className="relative">
                    <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <input required name="mpin" type="password" maxLength={6} pattern="\d*" value={form.mpin} onChange={handleChange} placeholder="Enter 6-Digit MPIN" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white text-center tracking-[0.3em]" />
                  </div>
                )}

                {mode === 'forgot' && (
                  <>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input name="newPassword" type="password" value={form.newPassword} onChange={handleChange} placeholder="New Password (Optional)" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                    <div className="relative">
                      <KeySquare className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                      <input name="newMpin" type="password" maxLength={6} pattern="\d*" value={form.newMpin} onChange={handleChange} placeholder="New 6-Digit MPIN (Optional)" className="w-full bg-neutral-900 border border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-sm font-bold outline-none focus:border-rose-500 text-white" />
                    </div>
                  </>
                )}
              </>
            )}

            <button type="submit" disabled={loading} className="w-full py-5 bg-rose-600 text-white font-black uppercase tracking-[0.3em] text-[11px] rounded-[20px] hover:bg-rose-700 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] disabled:opacity-50 flex items-center justify-center">
              {loading ? <Loader2 className="animate-spin w-5 h-5" /> : step === 1 ? 'Continue' : 'Verify & Submit'}
            </button>
          </form>

          <div className="mt-8 space-y-3">
            {mode === 'login' && (
              <>
                <div className="flex justify-between">
                  <button onClick={() => resetMode('register')} className="text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">Sign Up</button>
                  <button onClick={() => resetMode('forgot')} className="text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">Forgot Password / MPIN?</button>
                </div>
                <button onClick={() => resetMode('admin-login')} className="w-full mt-4 py-4 border border-rose-500/20 rounded-[16px] text-center text-[10px] font-black tracking-widest uppercase text-rose-500 hover:bg-rose-600/10 transition-colors">Admin Login</button>
              </>
            )}
            {mode === 'register' && <button onClick={() => resetMode('login')} className="w-full text-center text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">Back to Login</button>}
            {(mode === 'admin-login') && (
              <>
                <div className="flex justify-between">
                  <button onClick={() => resetMode('login')} className="text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">User Login</button>
                  <button onClick={() => resetMode('forgot')} className="text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">Forgot Password / MPIN?</button>
                </div>
                <button onClick={() => resetMode('admin-register')} className="w-full mt-4 text-[10px] text-rose-600/50 hover:text-rose-500 font-black tracking-widest uppercase transition-colors">Create Admin Account</button>
              </>
            )}
            {(mode === 'admin-register' || mode === 'forgot') && <button onClick={() => resetMode('login')} className="w-full text-center text-[10px] text-neutral-500 font-black tracking-widest uppercase hover:text-white transition-colors">Cancel & Return</button>}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthModal;
