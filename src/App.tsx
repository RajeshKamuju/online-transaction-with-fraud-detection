import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { SuperAppHome } from './components/SuperAppHome';
import { ShieldBot } from './components/ShieldBot';
import { Auth } from './components/Auth';
import { Guidelines } from './components/Guidelines';
import axios from 'axios';

export default function App() {
  const [view, setView] = useState<'landing' | 'auth' | 'guidelines' | 'home'>('landing');
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Check for existing session (mocked)
    const savedUser = localStorage.getItem('shieldpay_user');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      setView(parsed.has_onboarding ? 'home' : 'guidelines');
    }
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    localStorage.setItem('shieldpay_user', JSON.stringify(userData));
    setView(userData.has_onboarding ? 'home' : 'guidelines');
  };

  const handleOnboardingComplete = async () => {
    try {
      await axios.post('/api/auth/onboarding-complete', { userId: user.id });
      const updatedUser = { ...user, has_onboarding: 1 };
      setUser(updatedUser);
      localStorage.setItem('shieldpay_user', JSON.stringify(updatedUser));
      setView('home');
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('shieldpay_user');
    setView('landing');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {view === 'landing' && <LandingPage onGetStarted={() => setView('auth')} />}
      {view === 'auth' && <Auth onLogin={handleLogin} />}
      {view === 'guidelines' && <Guidelines onComplete={handleOnboardingComplete} />}
      {view === 'home' && user && (
        <SuperAppHome 
          user={user} 
          theme={theme} 
          onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onLogout={handleLogout}
        />
      )}
      <ShieldBot theme={theme} />
    </div>
  );
}
