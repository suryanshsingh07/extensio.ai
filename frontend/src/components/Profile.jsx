import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';

export default function Profile() {
  const { user, token } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email })
      });

      const data = await res.json();
      
      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        // Optionally update the context here, but reloading or waiting for next fetch is fine.
        // Quick trick: refresh page to update navbar state
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl px-4 md:px-6 py-12 mt-16 mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-3xl border border-white/5">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-3xl font-bold">Your Profile</h2>
            <p className="text-gray-400">Manage your personal information and preferences.</p>
          </div>
        </div>
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'} flex items-center gap-2`}>
            {message.type === 'success' && <CheckCircle2 className="w-5 h-5" />}
            {message.text}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">Full Name</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-500" />
              </div>
              <input type="text" value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required/>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-400 uppercase tracking-wider block">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-500" />
              </div>
              <input type="email" value={email}
                className="w-full pl-12 pr-4 py-3 bg-surface border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required/>
            </div>
          </div>
          <div className="pt-4 flex justify-end">
            <button type="submit" 
              disabled={isSaving || !name.trim() || !email.trim()}
              className="bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white font-medium py-3 px-8 rounded-xl flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(99,102,241,0.4)]">
              {isSaving ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving</> : <><Save className="w-5 h-5" /> Save Changes</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
