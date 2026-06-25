'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Shield, TrendingUp, Zap, Users, ArrowRight, Smartphone, LayoutGrid, CheckCircle, Calculator, Check, Copy, Landmark } from 'lucide-react';

// Reusable IntersectionObserver Animation Wrapper
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-1000 ease-out transform ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  const [calcAmount, setCalcAmount] = useState(100000);
  const [copiedText, setCopiedText] = useState(false);

  // Dynamic Yield Calculations
  const dailyYield = calcAmount * 0.007;
  const cycleYield = dailyYield * 11; // 15 days excluding Sat/Sun (approx 11 trading days)
  const spotDividend = calcAmount * 0.03;
  const totalBonus = calcAmount * 0.05;

  useEffect(() => {
    document.title = 'Varahi Capital | Prime Yield & Wealth Infrastructure';
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white font-sans overflow-x-hidden relative">
      {/* Background Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

      {/* Abstract Glowing Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[160px] animate-pulse pointer-events-none"></div>
      <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[10%] left-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none"></div>

      {/* Header */}
      <header className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
            V
          </div>
          <span className="text-xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
            VARAHI CAPITAL
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 shadow-sm"
          >
            <span>Staff Portal Gateway</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-6 space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold animate-pulse">
            <Zap size={12} />
            <span>Premium Fintech Wealth Management</span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.08] bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
            High Yield Asset Infrastructure.
          </h1>

          <p className="text-lg text-slate-400 max-w-xl leading-relaxed">
            Unlocking secure capital growth with real estate backed land development assets. Manage supervisor audits, KYC profiles, and payout distributions.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 group transition-all duration-200"
            >
              <span>Launch Console</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#calculator"
              className="px-6 py-4 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-sm font-semibold text-slate-300 transition-all duration-200 flex items-center gap-2"
            >
              <Calculator size={16} />
              <span>Yield Calculator</span>
            </a>
          </div>
        </div>

        {/* Visual Mockups Showcase */}
        <div className="lg:col-span-6 relative flex justify-center">
          {/* Main Dashboard Preview Card */}
          <div className="w-full max-w-lg aspect-[4/3] rounded-3xl bg-slate-900/50 border border-slate-800/80 p-5 backdrop-blur-md relative overflow-hidden shadow-2xl">
            {/* Title bar */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-5">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">dashboard_preview_live.tsx</span>
              <span className="w-4 h-4"></span>
            </div>

            {/* Dashboard Mockup Grid */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold">Total AUM</span>
                  <p className="text-sm font-bold text-white mt-1">₹ 2,45,80,000</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold">Due Payouts</span>
                  <p className="text-sm font-bold text-emerald-400 mt-1">₹ 3,42,500</p>
                </div>
                <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-xl">
                  <span className="text-[9px] text-slate-500 block uppercase tracking-wider font-semibold">Verification</span>
                  <p className="text-sm font-bold text-amber-500 mt-1">5 Pending</p>
                </div>
              </div>

              {/* Graphic Performance */}
              <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl h-44 flex flex-col justify-between">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Capital Growth Curve</span>
                  <span className="text-[10px] text-emerald-400 font-bold">+18.4%</span>
                </div>
                <div className="w-full h-28 flex items-end">
                  <svg className="w-full h-24 overflow-visible" viewBox="0 0 100 20">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.45" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 20 L 0 14 Q 15 6 30 15 T 60 8 T 90 4 L 100 2 L 100 20 Z" fill="url(#chartGradient)" />
                    <path d="M 0 14 Q 15 6 30 15 T 60 8 T 90 4 L 100 2" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="30" cy="15" r="2.5" fill="#10b981" />
                    <circle cx="60" cy="8" r="2.5" fill="#2563eb" />
                    <circle cx="100" cy="2" r="2.5" fill="#6366f1" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Mobile Mockup */}
          <div className="absolute bottom-[-40px] right-[-20px] w-52 aspect-[9/18.5] rounded-[2.2rem] bg-slate-950 border-4 border-slate-800 p-2.5 shadow-2xl hidden md:block z-20 pointer-events-none transform translate-y-2 hover:translate-y-0 transition-transform duration-500">
            <div className="w-full h-full bg-slate-900 rounded-[1.8rem] p-3 flex flex-col justify-between overflow-hidden">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-[9px] font-extrabold text-white">Varahi Mobile</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
              </div>

              {/* Mock Mobile Balance Card */}
              <div className="bg-blue-600 p-3 rounded-2xl space-y-1">
                <span className="text-[7px] text-blue-200 uppercase font-semibold">Total Balance</span>
                <p className="text-sm font-extrabold text-white">₹ 1,42,800</p>
              </div>

              {/* Grid indicators */}
              <div className="grid grid-cols-2 gap-1.5">
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[6px] text-slate-500 block">Investment</span>
                  <span className="text-[8px] font-bold text-white">₹1,00,000</span>
                </div>
                <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-[6px] text-slate-500 block">Earnings</span>
                  <span className="text-[8px] font-bold text-emerald-400">₹42,800</span>
                </div>
              </div>

              {/* Payout Block */}
              <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                <span className="text-[6px] text-slate-500 block">Next Payout</span>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-[8px] font-bold text-white">₹5,670</span>
                  <span className="text-[7px] text-slate-400">15 May 2025</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Yield Calculator Widget */}
      <section id="calculator" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-slate-900">
        <AnimatedSection>
          <div className="max-w-3xl mx-auto bg-slate-900/40 border border-slate-850 rounded-3xl p-8 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                <Calculator size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Interactive Yield Calculator</h2>
                <p className="text-xs text-slate-400">Estimate returns based on our 0.7% daily yield (excluding Sat/Sun) structure.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-300">Investment Principal</span>
                  <span className="text-2xl font-extrabold text-blue-400">₹ {calcAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="10000000"
                  step="50000"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-mono">
                  <span>₹ 50,000</span>
                  <span>₹ 25 Lakhs</span>
                  <span>₹ 50 Lakhs</span>
                  <span>₹ 1 Crore</span>
                </div>
              </div>

              {/* Yield Output grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Daily Return</span>
                  <p className="text-lg font-bold text-white mt-1">₹ {dailyYield.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-blue-400 font-semibold mt-1 block">0.7% Daily</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">15-Day Return</span>
                  <p className="text-lg font-bold text-white mt-1">₹ {cycleYield.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-blue-400 font-semibold mt-1 block">11 Trading Days</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Spot Dividend</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {spotDividend.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">3% Paid Instantly</span>
                </div>
                <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Yield Bonus</span>
                  <p className="text-lg font-bold text-emerald-400 mt-1">₹ {totalBonus.toLocaleString('en-IN')}</p>
                  <span className="text-[9px] text-emerald-400 font-semibold mt-1 block">5% Bonus</span>
                </div>
              </div>

              {/* Travel Slab indicator */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-850">
                <span className="text-[10px] text-slate-500 block uppercase font-bold mb-2">Exclusive Reward Tiers</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((calcAmount / 500000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-bold text-slate-300">
                    {calcAmount >= 500000 ? '🎉 Bangkok Trip Unlocked!' : calcAmount >= 200000 ? '🌴 Goa Trip Unlocked!' : 'Invest ₹2L for Goa, ₹5L for Bangkok'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </section>

      {/* Feature Sections */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <AnimatedSection>
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Operations Control Center
            </h2>
            <p className="text-sm text-slate-400">
              The operational components designed for internal team supervisors and capital partners.
            </p>
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatedSection className="delay-100">
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Smartphone size={20} />
              </div>
              <h3 className="text-base font-bold">Verified Mobile App</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Empowers clients to invest, calculate, trigger manual UPI checkout payments, and review past logs.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection className="delay-200">
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <LayoutGrid size={20} />
              </div>
              <h3 className="text-base font-bold">Dual Operator Console</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Clean and segregated dashboards separating Owner functions from Supervisor verification pipelines.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection className="delay-300">
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Shield size={20} />
              </div>
              <h3 className="text-base font-bold">24-Hour KYC SLA</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Supervisors verify loan-type applications including PAN, Aadhaar, permanent address, and income within 24 hours.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection className="delay-400">
            <div className="p-6 rounded-2xl bg-slate-900/30 border border-slate-900 hover:border-slate-800 hover:bg-slate-900/50 transition-all duration-300 space-y-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <TrendingUp size={20} />
              </div>
              <h3 className="text-base font-bold">Payouts Ledger</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual log graphs of distributed payouts, calculating TDS deductions automatically for tax reporting.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 py-12 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>&copy; 2026 Varahi Capital. Internal Asset Platform and Operational Suite. All rights reserved.</p>
      </footer>
    </div>
  );
}
