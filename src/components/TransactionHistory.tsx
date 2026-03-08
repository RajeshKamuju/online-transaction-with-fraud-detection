import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, CheckCircle2, ShieldAlert, AlertTriangle, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

export const TransactionHistory = ({ userId, theme }: { userId: string, theme: 'light' | 'dark' }) => {
  const [history, setHistory] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`/api/history/${userId}`);
      setHistory(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const filtered = history.filter(tx => 
    tx.recipient_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Transaction Ledger</h2>
        <div className="flex gap-4">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input 
              type="text" 
              placeholder="Search history..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full md:w-64 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 border transition-colors ${
                theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
              }`}
            />
          </div>
          <button className={`p-2 rounded-xl transition-colors border ${
            theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 shadow-sm'
          }`}>
            <Filter size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-slate-500">Loading your secure history...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No transactions found.</div>
        ) : (
          filtered.map((tx, i) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-4 rounded-2xl flex items-center justify-between transition-all cursor-pointer group border ${
                theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-md shadow-sm'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                  theme === 'dark' ? 'bg-indigo-600/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {tx.recipient_name[0]}
                </div>
                <div>
                  <div className={`font-bold flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {tx.recipient_name}
                    {tx.status === 'SAFE' && <CheckCircle2 size={14} className="text-green-500" />}
                    {tx.status === 'BLOCKED' && <ShieldAlert size={14} className="text-red-500" />}
                    {tx.status === 'FLAGGED' && <AlertTriangle size={14} className="text-amber-500" />}
                  </div>
                  <div className="text-xs text-slate-500">{format(tx.timestamp, 'MMM dd, yyyy • hh:mm a')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`font-bold ${
                  tx.status === 'BLOCKED' ? 'text-slate-400 line-through' : theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}>
                  ₹{tx.amount.toLocaleString()}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${
                  tx.status === 'SAFE' ? 'text-green-500' : 
                  tx.status === 'BLOCKED' ? 'text-red-500' : 'text-amber-500'
                }`}>
                  {tx.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};
