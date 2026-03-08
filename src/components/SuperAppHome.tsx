import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, User, Shield, QrCode, Contact as ContactIcon, Wallet, 
  Smartphone, Tv, Zap, Heart, Bell, History, 
  ArrowRight, ShieldAlert, CheckCircle2, Loader2,
  MapPin, CreditCard, Landmark, TrendingUp, X, Key, Moon, Sun, LogOut
} from 'lucide-react';
import axios from 'axios';
import { TransactionHistory } from './TransactionHistory';
import { Settings } from './Settings';

export const SuperAppHome = ({ user, theme, onThemeToggle, onLogout }: { user: any, theme: 'light' | 'dark', onThemeToggle: () => void, onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'settings'>('home');
  const [isPaying, setIsPaying] = useState(false);
  const [isAddingFunds, setIsAddingFunds] = useState(false);
  const [addAmount, setAddAmount] = useState('500');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [payAmount, setPayAmount] = useState('');
  const [moneyPassword, setMoneyPassword] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'scanning' | 'success' | 'fraud'>('idle');
  const [verdict, setVerdict] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [searchContact, setSearchContact] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [payMethod, setPayMethod] = useState<'contacts' | 'mobile'>('contacts');
  const [pinStartTime, setPinStartTime] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchAlerts();
    fetchContacts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`/api/alerts/${user.id}`);
      setAlerts(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchContacts = async () => {
    try {
      const res = await axios.get(`/api/contacts/${user.id}`);
      setContacts(res.data);
    } catch (e) { console.error(e); }
  };

  const handlePayment = async () => {
    if (!payAmount || !moneyPassword) return;
    
    setPaymentStatus('scanning');
    
    // Behavioral Biometrics: Calculate typing speed for PIN
    const typingSpeed = pinStartTime ? (Date.now() - pinStartTime) : 500;
    
    let lat = 19.076;
    let lng = 72.877;
    
    if (Number(payAmount) > 5000) {
      lat = 51.5074;
      lng = -0.1278;
    }

    try {
      await new Promise(r => setTimeout(r, 2000));
      
      const recipientName = selectedContact ? selectedContact.name : `Mobile: ${mobileNumber}`;
      
      const res = await axios.post('/api/predict', {
        userId: user.id,
        amount: Number(payAmount),
        lat,
        lng,
        ipAddress: '192.168.1.42',
        recipientName,
        moneyPassword,
        typingSpeed
      });

      setVerdict(res.data);
      setPaymentStatus(res.data.status === 'BLOCKED' ? 'fraud' : 'success');
      
      // Send notification to mobile number if provided
      if (mobileNumber || (selectedContact && selectedContact.upi_id.includes('@upi'))) {
        const target = mobileNumber || selectedContact.name;
        const statusMsg = res.data.status === 'BLOCKED' ? 'FRAUD ALERT: Transaction blocked.' : 'Payment of ₹' + payAmount + ' successful.';
        showNotification(`SMS sent to ${target}: ${statusMsg}`, 'info');
      }
      
      fetchAlerts();
    } catch (e: any) {
      alert(e.response?.data?.error || "Payment failed");
      setPaymentStatus('idle');
    }
  };

  const resetPayment = () => {
    setPaymentStatus('idle');
    setPayAmount('');
    setMoneyPassword('');
    setSelectedContact(null);
    setMobileNumber('');
    setPayMethod('contacts');
    setIsPaying(false);
    setVerdict(null);
  };

  const handleAddFunds = async () => {
    try {
      const res = await axios.post(`/api/user/${user.id}/add-funds`, { amount: parseFloat(addAmount) });
      // We need to update the user state in the parent component
      // Assuming onUserUpdate is passed or we can just refresh the page
      // For now, let's assume we need to update it locally if possible or just show success
      showNotification(`₹${addAmount} added to your wallet!`, 'success');
      setIsAddingFunds(false);
      window.location.reload(); // Simple way to refresh user data
    } catch (e) {
      showNotification('Failed to add funds.', 'error');
    }
  };

  const handleScanQR = () => {
    if (contacts.length > 0) {
      const randomContact = contacts[Math.floor(Math.random() * contacts.length)];
      setSelectedContact(randomContact);
      setIsPaying(true);
      showNotification(`QR Scanned: ${randomContact.name}`, 'success');
    } else {
      showNotification('No contacts available to scan.', 'error');
    }
  };

  const handleMockService = (service: string) => {
    showNotification(`Processing ${service} payment...`, 'info');
    setTimeout(() => {
      showNotification(`${service} payment successful!`, 'success');
    }, 2000);
  };

  const handleBankTransfer = () => {
    showNotification('Initiating bank transfer...', 'info');
    setTimeout(() => {
      showNotification('Bank transfer successful!', 'success');
    }, 2500);
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(searchContact.toLowerCase()));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b ${theme === 'dark' ? 'bg-[#0f172a]/80 border-white/10' : 'bg-white/80 border-slate-200'} px-6 py-4`}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Shield className="text-white" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">ShieldPay</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => showNotification('Security system is active and monitoring for threats.', 'success')}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all hover:shadow-md ${theme === 'dark' ? 'bg-green-500/10 border-green-500/20' : 'bg-green-50 border-green-100'}`}
            >
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }} 
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-2 h-2 bg-green-500 rounded-full" 
              />
              <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Security Heartbeat</span>
            </button>
            <button onClick={onThemeToggle} className={`p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10 text-white' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm text-slate-600'}`}>
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button onClick={onLogout} className={`p-2 rounded-xl border transition-all ${theme === 'dark' ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20' : 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100 shadow-sm'}`} title="Logout">
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Navigation Rail */}
        <div className="md:col-span-1 flex md:flex-col justify-around md:justify-start gap-8 py-4">
          {[
            { id: 'home', icon: Wallet },
            { id: 'history', icon: History },
            { id: 'settings', icon: User },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`p-3 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : theme === 'dark' ? 'text-slate-500 hover:bg-white/5' : 'text-slate-400 hover:bg-slate-100'}`}
            >
              <tab.icon size={24} />
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-11">
          {activeTab === 'home' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Side: Services & Contacts */}
              <div className="lg:col-span-8 space-y-6">
                {/* Quick Actions */}
                <section className="grid grid-cols-4 gap-4">
                    {[
                      { label: 'Scan QR', icon: QrCode, color: theme === 'dark' ? 'bg-indigo-500' : 'bg-indigo-50 text-indigo-600', onClick: handleScanQR },
                      { label: 'Contacts', icon: ContactIcon, color: theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-50 text-emerald-600', onClick: () => setIsPaying(true) },
                      { label: 'To Bank', icon: Landmark, color: theme === 'dark' ? 'bg-amber-500' : 'bg-amber-50 text-amber-600', onClick: handleBankTransfer },
                      { label: 'Balance', icon: Wallet, color: theme === 'dark' ? 'bg-rose-500' : 'bg-rose-50 text-rose-600', onClick: () => showNotification(`Your current balance is ₹${user.balance?.toLocaleString()}`, 'success') },
                    ].map((item, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ y: -4 }}
                      onClick={item.onClick}
                      className="flex flex-col items-center gap-2"
                    >
                      <div className={`${item.color} w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-black/5 transition-colors`}>
                        <item.icon size={24} />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{item.label}</span>
                    </motion.button>
                  ))}
                </section>

                {/* Investment Ad (Native) */}
                <motion.section 
                  whileHover={{ scale: 1.01 }}
                  className={`rounded-[2rem] p-6 flex items-center justify-between relative overflow-hidden group cursor-pointer ${theme === 'dark' ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white' : 'bg-white border border-slate-200 shadow-sm'}`}
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={18} className={theme === 'dark' ? 'text-emerald-200' : 'text-emerald-600'} />
                      <span className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-600'}`}>Invest & Grow</span>
                    </div>
                    <h3 className={`text-xl font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Start a SIP with ₹500</h3>
                    <p className={`text-xs ${theme === 'dark' ? 'text-emerald-100/70' : 'text-slate-500'}`}>Secure your future while ShieldPay secures your transactions.</p>
                    <button className={`mt-4 px-6 py-2 rounded-xl font-bold text-sm transition-colors ${theme === 'dark' ? 'bg-white text-emerald-700 hover:bg-emerald-50' : 'bg-emerald-600 text-white hover:bg-emerald-500'}`}>
                      Get Started
                    </button>
                  </div>
                  <TrendingUp size={120} className={`absolute -right-4 -bottom-4 transition-transform duration-500 group-hover:scale-110 ${theme === 'dark' ? 'text-white/10' : 'text-emerald-500/5'}`} />
                </motion.section>

                {/* Services Grid */}
                <section className={`rounded-[2rem] p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">Utilities & Recharges</h3>
                  <div className="grid grid-cols-4 gap-8">
                    {[
                      { label: 'Mobile', icon: Smartphone },
                      { label: 'DTH', icon: Tv },
                      { label: 'Electricity', icon: Zap },
                      { label: 'Insurance', icon: Shield },
                      { label: 'Credit Card', icon: CreditCard },
                      { label: 'Rent', icon: Landmark },
                      { label: 'Gas', icon: Zap },
                      { label: 'More', icon: ArrowRight },
                    ].map((item, i) => (
                      <button 
                        key={i} 
                        onClick={() => handleMockService(item.label)}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${theme === 'dark' ? 'bg-white/5 group-hover:bg-white/10' : 'bg-slate-50 group-hover:bg-slate-100'}`}>
                          <item.icon size={20} className="text-indigo-500" />
                        </div>
                        <span className="text-[11px] font-medium text-slate-500">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Side: Wallet & Security */}
              <div className="lg:col-span-4 space-y-6">
                <div className={`rounded-[2.5rem] p-8 border ${theme === 'dark' ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200 shadow-xl'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Shield Wallet</span>
                    <div className="w-8 h-5 bg-indigo-500/20 rounded border border-indigo-500/30" />
                  </div>
                  <div className="mb-8">
                    <div className="text-xs text-slate-400 mb-1">Total Balance</div>
                    <div className="text-4xl font-bold tracking-tight">₹{user.balance?.toLocaleString()}</div>
                  </div>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsPaying(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                    >
                      Send Money <ArrowRight size={18} />
                    </button>
                    <button 
                      onClick={() => setIsAddingFunds(true)}
                      className={`w-full py-4 rounded-2xl font-bold transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-600'}`}
                    >
                      Add Funds
                    </button>
                  </div>
                </div>

                {/* Security Hub Widget */}
                <div className={`rounded-[2.5rem] p-6 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Security Hub</h3>
                    <Shield size={16} className="text-indigo-500" />
                  </div>
                  <div className="space-y-4">
                    <div className={`flex items-center justify-between p-3 rounded-2xl border ${theme === 'dark' ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100'}`}>
                      <div className="text-xs font-medium text-slate-400">Trust Score</div>
                      <div className="text-lg font-bold text-indigo-500">98/100</div>
                    </div>
                    <div className={`flex items-center justify-between p-3 rounded-2xl border ${theme === 'dark' ? 'bg-green-500/5 border-green-500/10' : 'bg-green-50 border-green-100'}`}>
                      <div className="text-xs font-medium text-slate-400">Threats Blocked</div>
                      <div className="text-lg font-bold text-green-500">{alerts.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && <TransactionHistory userId={user.id} theme={theme} onAction={showNotification} />}
          {activeTab === 'settings' && <Settings user={user} theme={theme} onThemeToggle={onThemeToggle} onLogout={onLogout} onAction={showNotification} />}
        </div>
      </main>

      {/* Payment Modal (Multi-step) */}
      <AnimatePresence>
        {isPaying && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border ${theme === 'dark' ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'}`}
            >
              {paymentStatus === 'idle' && !selectedContact && (
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Send Money</h2>
                    <button onClick={() => setIsPaying(false)} className={`transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}><X /></button>
                  </div>

                  <div className="flex gap-2 mb-6 p-1 bg-slate-100 dark:bg-white/5 rounded-2xl">
                    <button 
                      onClick={() => setPayMethod('contacts')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${payMethod === 'contacts' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                      Contacts
                    </button>
                    <button 
                      onClick={() => setPayMethod('mobile')}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${payMethod === 'mobile' ? 'bg-white dark:bg-slate-800 shadow-sm text-indigo-600' : 'text-slate-500'}`}
                    >
                      Mobile Number
                    </button>
                  </div>

                  {payMethod === 'contacts' ? (
                    <>
                      <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="text" 
                          placeholder="Search 30+ verified contacts..." 
                          value={searchContact}
                          onChange={(e) => setSearchContact(e.target.value)}
                          className={`w-full rounded-2xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <div className="h-96 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                        {filteredContacts.map((contact) => (
                          <button 
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors ${theme === 'dark' ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          >
                            <img src={contact.avatar} alt="" className="w-10 h-10 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                            <div className="text-left">
                              <div className="font-bold text-sm">{contact.name}</div>
                              <div className="text-[10px] text-slate-500 uppercase tracking-widest">{contact.upi_id}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                        <input 
                          type="tel" 
                          placeholder="Enter 10-digit mobile number" 
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className={`w-full rounded-2xl py-4 pl-12 pr-4 text-lg font-bold focus:outline-none focus:border-indigo-500 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                      <button 
                        disabled={mobileNumber.length !== 10}
                        onClick={() => setSelectedContact({ name: `User (${mobileNumber})`, upi_id: `${mobileNumber}@upi`, avatar: `https://picsum.photos/seed/${mobileNumber}/200` })}
                        className={`w-full py-4 rounded-2xl font-bold transition-all ${mobileNumber.length === 10 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                      >
                        Proceed to Pay
                      </button>
                    </div>
                  )}
                </div>
              )}

              {paymentStatus === 'idle' && selectedContact && (
                <div className="p-8">
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setSelectedContact(null)} className={`transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}><ArrowRight className="rotate-180" /></button>
                    <h2 className="text-2xl font-bold">Pay {selectedContact.name}</h2>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Enter Amount</div>
                      <input 
                        type="text" 
                        value={payAmount}
                        onChange={(e) => setPayAmount(e.target.value)}
                        placeholder="₹0.00"
                        className={`w-full bg-transparent text-center text-6xl font-bold focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Money Password</label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                          type="password" 
                          maxLength={6}
                          value={moneyPassword}
                          onFocus={() => setPinStartTime(Date.now())}
                          onChange={(e) => setMoneyPassword(e.target.value)}
                          placeholder="••••••"
                          className={`w-full rounded-2xl py-4 pl-12 pr-4 text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-indigo-500 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
                        />
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment}
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-5 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-indigo-600/20"
                    >
                      Confirm Payment
                    </button>
                  </div>
                </div>
              )}

              {paymentStatus === 'scanning' && (
                <div className="p-12 flex flex-col items-center text-center">
                  <div className="relative mb-8">
                    <motion.div 
                      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute -inset-8 bg-indigo-500/20 blur-3xl rounded-full" 
                    />
                    <div className="relative w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center">
                      <Shield className="text-white animate-pulse" size={48} />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">AI Security Scan...</h2>
                  <p className="text-slate-500 text-sm mb-8">Validating behavioral biometrics and cross-referencing Kaggle fraud patterns.</p>
                  <div className={`w-full h-1.5 rounded-full overflow-hidden ${theme === 'dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 2 }}
                      className="h-full bg-indigo-600" 
                    />
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="p-12 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-green-500/20"
                  >
                    <CheckCircle2 className="text-white" size={48} />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2">Transaction Secured</h2>
                  <p className="text-slate-500 text-sm mb-8">Verified by Shield AI. Funds transferred successfully.</p>
                  <button 
                    onClick={resetPayment}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold transition-all"
                  >
                    Done
                  </button>
                </div>
              )}

              {paymentStatus === 'fraud' && (
                <div className="p-12 flex flex-col items-center text-center">
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-8 shadow-lg shadow-red-500/20"
                  >
                    <ShieldAlert className="text-white" size={48} />
                  </motion.div>
                  <h2 className="text-2xl font-bold mb-2 text-red-500">Fraud Blocked</h2>
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl mb-8 w-full">
                    <p className="text-red-600 text-xs font-bold uppercase tracking-widest">Reason: {verdict?.reasons.join(", ")}</p>
                  </div>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed">Our AI detected an outlier pattern inconsistent with your behavior. Transaction has been paused for your safety.</p>
                  <div className="flex gap-4 w-full">
                    <button 
                      onClick={resetPayment}
                      className={`flex-1 py-4 rounded-2xl font-bold transition-all border ${theme === 'dark' ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => showNotification('Fraud report submitted. Our team will investigate.', 'success')}
                      className="flex-1 bg-red-600 text-white py-4 rounded-2xl font-bold transition-all"
                    >
                      Report
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Funds Modal */}
      <AnimatePresence>
        {isAddingFunds && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className={`w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl ${theme === 'dark' ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold">Add Funds</h2>
                  <button onClick={() => setIsAddingFunds(false)} className="text-slate-500 hover:text-slate-900"><X /></button>
                </div>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Enter Amount</div>
                    <input 
                      type="number" 
                      value={addAmount}
                      onChange={(e) => setAddAmount(e.target.value)}
                      className={`w-full bg-transparent text-center text-6xl font-bold focus:outline-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['100', '500', '1000', '2000', '5000', '10000'].map(amt => (
                      <button 
                        key={amt}
                        onClick={() => setAddAmount(amt)}
                        className={`py-2 rounded-xl text-xs font-bold transition-all border ${addAmount === amt ? 'bg-indigo-600 border-indigo-600 text-white' : theme === 'dark' ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                      >
                        ₹{amt}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={handleAddFunds}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Confirm Top-up
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200]"
          >
            <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border ${
              notification.type === 'success' ? 'bg-emerald-500 text-white border-emerald-400' :
              notification.type === 'error' ? 'bg-rose-500 text-white border-rose-400' :
              'bg-indigo-600 text-white border-indigo-500'
            }`}>
              {notification.type === 'success' && <CheckCircle2 size={18} />}
              {notification.type === 'error' && <ShieldAlert size={18} />}
              {notification.type === 'info' && <Bell size={18} />}
              <span className="text-sm font-bold">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
