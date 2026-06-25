'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Lock, Mail, Loader2, Sparkles, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  React.useEffect(() => {
    document.title = 'Login | Varahi Capital';
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate small delay for sleek animation
    setTimeout(async () => {
      const normalizedEmail = email.toLowerCase().trim();
      
      let role = '';
      let fullName = '';
      
      if (normalizedEmail === 'owner@varahi.com' || normalizedEmail === 'owner') {
        role = 'owner';
        fullName = 'K N C PAVAN KUMAR';
      } else if (normalizedEmail === 'supervisor@varahi.com' || normalizedEmail === 'supervisor') {
        role = 'supervisor';
        fullName = 'Audit Supervisor';
      } else {
        setError('Invalid credentials. Use "owner@varahi.com" or "supervisor@varahi.com" for demo.');
        setLoading(false);
        return;
      }

      // Set cookies for authentication and role detection
      Cookies.set('access_token', 'mock-access-token', { expires: 30 });
      Cookies.set('refresh_token', 'mock-refresh-token', { expires: 30 });
      Cookies.set('user_role', role, { expires: 30 });
      Cookies.set('user_name', fullName, { expires: 30 });

      // Navigate to the combined dashboard
      router.push('/dashboard');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 relative overflow-hidden bg-slate-950 font-sans">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative z-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-lg p-1.5 border border-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Varahi Capital Logo" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Varahi Capital</h2>
          <p className="text-xs text-slate-400 mt-1 font-mono uppercase tracking-wider">Internal Portals Gateway</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-slate-500" size={16} />
              <input 
                type="text"
                placeholder="owner@varahi.com or supervisor@varahi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all duration-200 placeholder:text-slate-600"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-2 font-mono uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-slate-500" size={16} />
              <input 
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-all duration-200 placeholder:text-slate-600"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
              Use <span className="font-mono text-blue-400 font-semibold">owner@varahi.com</span> or <span className="font-mono text-emerald-400 font-semibold">supervisor@varahi.com</span> with any password for demo access.
            </p>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-emerald-500 hover:opacity-95 disabled:opacity-50 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-blue-500/15 mt-2 transition-all duration-200"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : 'Access Dashboard'}
          </button>
        </form>
      </div>
    </div>
  );
}
