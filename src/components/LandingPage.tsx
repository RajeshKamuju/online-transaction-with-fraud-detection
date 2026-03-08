import React from 'react';
import { motion } from 'motion/react';
import { Shield, ArrowRight, Lock, Zap, Globe, ShieldCheck } from 'lucide-react';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Background Glows (Subtle) */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Shield size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">ShieldPay</span>
        </div>
        <button 
          onClick={onGetStarted}
          className="bg-white hover:bg-slate-50 border border-slate-200 px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm text-slate-600"
        >
          Login
        </button>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck size={14} /> AI-Powered Financial Security
          </div>
          <h1 className="text-6xl lg:text-8xl font-bold tracking-tight leading-[0.9] mb-8 text-slate-900">
            The Future of <span className="text-indigo-600">Secure</span> Payments.
          </h1>
          <p className="text-lg text-slate-500 max-w-lg mb-10 leading-relaxed">
            ShieldPay uses neural fraud detection and behavioral biometrics to protect every transaction. Experience the next generation of financial freedom.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20"
            >
              Get Started <ArrowRight size={20} />
            </button>
            <button className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm">
              Learn More
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative"
        >
          {/* Mockup Card (Casual/Simple) */}
          <div className="relative z-10 bg-white border border-slate-200 rounded-[3rem] p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-700">
            <div className="flex justify-between items-start mb-12">
              <div className="w-12 h-8 bg-indigo-50 rounded border border-indigo-100" />
              <Shield className="text-indigo-600" size={32} />
            </div>
            <div className="space-y-6">
              <div className="h-4 w-48 bg-slate-100 rounded-full" />
              <div className="h-4 w-32 bg-slate-100 rounded-full" />
              <div className="pt-8">
                <div className="text-4xl font-bold tracking-tight text-slate-900">₹42,850.00</div>
                <div className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-bold">Available Balance</div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements (Subtle) */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
            className="absolute -top-10 -right-10 z-20 bg-white/80 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-xl"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Zap size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">AI Scanner</div>
              <div className="text-sm font-bold text-slate-900">Threat Blocked</div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ repeat: Infinity, duration: 5, delay: 1 }}
            className="absolute -bottom-10 -left-10 z-20 bg-white/80 backdrop-blur-xl border border-slate-200 p-4 rounded-2xl flex items-center gap-3 shadow-xl"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
              <Lock size={20} />
            </div>
            <div>
              <div className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Security</div>
              <div className="text-sm font-bold text-slate-900">Neural Verified</div>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24 border-t border-slate-200">
        <div className="grid md:grid-cols-3 gap-12">
          {[
            { title: 'Neural Fraud Detection', desc: 'Real-time analysis of transaction patterns using advanced AI models.', icon: Zap },
            { title: 'Behavioral Biometrics', desc: 'Unique security layer based on how you interact with your device.', icon: Globe },
            { title: 'Zero-Trust Architecture', desc: 'Every payment is verified multiple times before completion.', icon: Lock },
          ].map((feature, i) => (
            <div key={i} className="space-y-4">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{feature.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
