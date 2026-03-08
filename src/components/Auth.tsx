import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, User, ArrowRight, Key, Loader2 } from 'lucide-react';
import axios from 'axios';

export const Auth = ({ onLogin }: { onLogin: (user: any) => void }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'pin'>('login');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    moneyPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const res = await axios.post('/api/auth/login', { email: formData.email, password: formData.password });
        if (res.data && res.data.id) {
          onLogin(res.data);
        } else {
          throw new Error('Invalid response from server');
        }
      } else if (mode === 'signup') {
        // Basic validation before moving to PIN
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        setMode('pin');
      } else if (mode === 'pin') {
        const res = await axios.post('/api/auth/register', formData);
        if (res.data && res.data.id) {
          onLogin(res.data);
        } else {
          throw new Error('Registration failed');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-2xl relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-600/20">
            <Shield className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Security PIN'}
          </h1>
          <p className="text-slate-500 text-sm mt-2 text-center">
            {mode === 'pin' ? 'Set a 6-digit PIN for your transactions' : 
             mode === 'login' ? 'Enter your credentials to access ShieldPay' : 
             'Join the next generation of secure banking'}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'signup' && (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Full Name"
                    disabled={loading}
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}

            {mode !== 'pin' && (
              <motion.div
                key="auth-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    placeholder="Email Address"
                    disabled={loading}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    placeholder="Password"
                    disabled={loading}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}

            {mode === 'pin' && (
              <motion.div
                key="pin-fields"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-4"
              >
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="6-Digit PIN"
                    disabled={loading}
                    required
                    value={formData.moneyPassword}
                    onChange={(e) => setFormData({ ...formData, moneyPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-center text-2xl tracking-[1em] text-slate-900 focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-100 p-3 rounded-xl"
            >
              <p className="text-red-600 text-xs text-center font-medium">{error}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Continue' : 'Complete Setup'} 
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'signup' : 'login');
              setError('');
            }}
            disabled={loading}
            className="text-slate-500 hover:text-indigo-600 text-sm transition-colors font-medium disabled:opacity-50"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
