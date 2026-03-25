import React from 'react';
import AdminDashboard from './AdminDashboard';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

const AdminUI = ({ currentUser }) => {
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <ShieldAlert className="w-24 h-24 text-rose-600 mx-auto mb-6 opacity-50" />
          <h1 className="text-4xl font-black uppercase italic text-rose-500 tracking-widest">Access Denied</h1>
          <p className="text-neutral-500 tracking-[0.3em] text-sm mt-4 font-bold uppercase">Level 5 Clearance Required</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pt-24 min-h-screen">
      <AdminDashboard />
    </motion.div>
  );
};

export default AdminUI;
