import React from 'react';
import { motion } from 'motion/react';
import { User, Shield, Lock, Moon, Sun, CreditCard, ArrowRight, ChevronRight } from 'lucide-react';

export const Settings = ({ user, theme, onThemeToggle, onLogout, onAction }: { user: any, theme: 'light' | 'dark', onThemeToggle: () => void, onLogout: () => void, onAction: (msg: string, type?: 'info' | 'success' | 'error') => void }) => {
  const sections = [
    { title: "Profile", icon: User, desc: "Manage your personal information", status: user.kyc_status === 'verified' ? "Verified" : "Pending", action: () => onAction("Profile editing is disabled in demo mode.", "info") },
    { title: "Security", icon: Shield, desc: "Login password & Money Password", action: () => onAction("Security settings are locked.", "error") },
    { title: "Cards", icon: CreditCard, desc: "Manage linked credit/debit cards", alert: true, action: () => onAction("Card management is coming soon.", "info") },
    { title: "Theme", icon: theme === 'dark' ? Moon : Sun, desc: `Currently using ${theme} mode`, toggle: true }
  ];

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-6 mb-12">
        <div className={`w-24 h-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-3xl font-bold text-white shadow-xl border-4 ${theme === 'dark' ? 'border-white/10' : 'border-white'}`}>
          {user.name[0]}
        </div>
        <div>
          <h2 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.name}</h2>
          <p className="text-slate-400">{user.email}</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mt-2 border ${
            theme === 'dark' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-green-50 border-green-100 text-green-600'
          }`}>
            KYC {user.kyc_status}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            whileHover={{ x: 4 }}
            onClick={() => section.action && section.action()}
            className={`p-6 rounded-[2rem] flex items-center justify-between cursor-pointer transition-all border ${
              theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md shadow-sm text-slate-900'
            }`}
          >
            <div className="flex items-center gap-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                theme === 'dark' ? 'bg-white/5 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
              }`}>
                <section.icon size={24} />
              </div>
              <div>
                <h3 className="font-bold">{section.title}</h3>
                <p className="text-xs text-slate-500">{section.desc}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {section.status && <span className="text-xs font-bold text-green-500">{section.status}</span>}
              {section.alert && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              {section.toggle ? (
                <button 
                  onClick={(e) => { e.stopPropagation(); onThemeToggle(); }}
                  className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full transition-all shadow-sm ${theme === 'dark' ? 'left-7 bg-white' : 'left-1 bg-white'}`} />
                </button>
              ) : (
                <ChevronRight size={20} className="text-slate-400" />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`p-6 rounded-[2.5rem] text-center border ${
          theme === 'dark' ? 'bg-red-500/5 border-red-500/10' : 'bg-red-50 border-red-100'
        }`}>
          <h3 className="text-red-500 font-bold mb-1 text-sm">Emergency Exit</h3>
          <p className="text-slate-500 text-[10px] mb-4">Freeze all transactions.</p>
          <button 
            onClick={() => onAction("Account frozen successfully for your safety.", "success")}
            className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-xl text-xs font-bold transition-all"
          >
            Freeze
          </button>
        </div>

        <div className={`p-6 rounded-[2.5rem] text-center border ${
          theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`font-bold mb-1 text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Session</h3>
          <p className="text-slate-500 text-[10px] mb-4">Logout from this device.</p>
          <button 
            onClick={onLogout}
            className={`w-full py-2 rounded-xl text-xs font-bold transition-all border ${
              theme === 'dark' ? 'bg-white/5 border-white/10 text-white hover:bg-white/10' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
