import React from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, Zap, CreditCard, ArrowRight } from 'lucide-react';

export const Guidelines = ({ onComplete }: { onComplete: () => void }) => {
  const cards = [
    {
      title: "Money Password",
      desc: "Your 6-digit PIN is required for every payment to prevent unauthorized transfers.",
      icon: Lock,
      color: "bg-blue-500"
    },
    {
      title: "AI Fraud Scanner",
      desc: "We monitor IP addresses, location jumps, and typing speed to block hackers.",
      icon: Shield,
      color: "bg-indigo-500"
    },
    {
      title: "Safe Contacts",
      desc: "Your 30 Trusted Contacts are pre-verified for faster, safer payments.",
      icon: Zap,
      color: "bg-amber-500"
    },
    {
      title: "Credit Card Protection",
      desc: "Add a Credit Card for an extra layer of bank-grade fraud protection.",
      icon: CreditCard,
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-slate-900">How We Protect You</h1>
          <p className="text-slate-500">ShieldPay uses multi-layered AI to ensure your money is always safe.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border border-slate-200 p-6 rounded-[2rem] flex gap-6 shadow-sm"
            >
              <div className={`${card.color} w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg`}>
                <card.icon size={28} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2 text-slate-900">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-12 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            Start Using ShieldPay <ArrowRight size={20} />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
