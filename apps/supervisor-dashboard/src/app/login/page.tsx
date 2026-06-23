'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { Phone, Key, Loader2, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300);
  const router = useRouter();

  useEffect(() => {
    let interval: any;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTimer = () => {
    const mins = Math.floor(timer / 60);
    const secs = timer % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber.startsWith('+91') || mobileNumber.length < 13) {
      setError('Mobile number must start with +91 followed by 10 digits.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setTimer(300);
      } else {
        setError(data.error || 'Failed to send OTP. Try again.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile_number: mobileNumber, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        if (data.user.role !== 'supervisor') {
          setError('Access Denied. Only Supervisor roles can access this dashboard.');
          return;
        }

        Cookies.set('access_token', data.access, { expires: 30 });
        Cookies.set('refresh_token', data.refresh, { expires: 30 });
        
        router.push('/dashboard');
      } else {
        setError(data.error || 'Incorrect OTP. Please check and try again.');
      }
    } catch (err) {
      setError('Verification error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center p-4 relative overflow-hidden bg-zinc-950">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-md p-8 rounded-2xl glass-card relative z-10">
        <div className="text-center mb-8">
          <div className="mx-auto w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center text-white mb-3 shadow-lg shadow-indigo-500/20">
            <Sparkles size={24} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Varahi Capital</h2>
          <p className="text-xs text-zinc-400 mt-1 font-mono uppercase tracking-wider">Supervisor Portal Login</p>
        </div>

        {error && (
          <div className="text-rose-400 bg-rose-500/10 border border-rose-500/20 p-4 text-xs font-semibold rounded-xl text-center mb-6">
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase tracking-wider">Mobile Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                <input 
                  type="text"
                  placeholder="+919999999999"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full gradient-bg hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-500/15"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Send Verification OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase tracking-wider">6-Digit Verification Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 text-zinc-500" size={16} />
                <input 
                  type="text"
                  placeholder="Enter OTP (123456 for demo)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
                  maxLength={6}
                  required
                />
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-zinc-500 font-mono">Expires in: {formatTimer()}</span>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full gradient-bg hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify Code & Login'}
            </button>
            
            <button 
              type="button"
              onClick={() => setStep(1)}
              className="w-full border border-white/5 hover:bg-white/5 text-zinc-400 text-xs py-2 rounded-xl"
            >
              Go Back
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
