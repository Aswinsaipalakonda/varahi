'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewPlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [tenure, setTenure] = useState('12');
  const [frequency, setFrequency] = useState('monthly');
  const [penalty, setPenalty] = useState('2.00');
  const [terms, setTerms] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      name,
      description,
      min_amount: parseFloat(minAmount),
      max_amount: parseFloat(maxAmount),
      return_rate_percent: parseFloat(returnRate),
      tenure_months: parseInt(tenure),
      payout_frequency: frequency,
      premature_penalty_percent: parseFloat(penalty),
      terms_text: terms,
      is_active: true
    };

    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push('/dashboard/plans');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to create plan. Check inputs.');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/plans" className="p-2 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-white/5">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create New Investment Plan</h1>
          <p className="text-sm text-zinc-400 mt-1">Configure return yielding schemes for retail customers.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-card border border-white/5 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Plan Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Varahi Monthly Yield Plan"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Tenure (Months)</label>
            <select
              value={tenure}
              onChange={(e) => setTenure(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
            >
              <option value="3">3 Months</option>
              <option value="6">6 Months</option>
              <option value="12">12 Months</option>
              <option value="18">18 Months</option>
              <option value="24">24 Months</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Description</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Plan description, benefits, return schedules..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 h-24 resize-none"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Min Investment Amount (₹)</label>
            <input 
              type="number" 
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="10000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Max Investment Amount (₹)</label>
            <input 
              type="number" 
              value={maxAmount}
              onChange={(e) => setMaxAmount(e.target.value)}
              placeholder="1000000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Return Rate (% p.a.)</label>
            <input 
              type="number" 
              step="0.01"
              value={returnRate}
              onChange={(e) => setReturnRate(e.target.value)}
              placeholder="12.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-white/5 pt-6">
          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-3 font-mono uppercase">Payout Yield Frequency</label>
            <div className="flex gap-4">
              {['monthly', 'quarterly', 'on_maturity'].map((freq) => (
                <label key={freq} className="flex items-center gap-2 text-sm text-zinc-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="payout_frequency"
                    value={freq}
                    checked={frequency === freq}
                    onChange={() => setFrequency(freq)}
                    className="accent-indigo-500"
                  />
                  <span className="capitalize">{freq.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Premature Penalty Rate (%)</label>
            <input 
              type="number" 
              step="0.01"
              value={penalty}
              onChange={(e) => setPenalty(e.target.value)}
              placeholder="2.00"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">T&C / Legal Terms Summary</label>
          <textarea 
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            placeholder="Legal terms, withdrawal penalties, default guidelines..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 h-24 resize-none"
            required
          />
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-white/5 pt-6">
          <Link href="/dashboard/plans" className="border border-white/5 hover:bg-white/5 text-zinc-400 text-xs px-5 py-2.5 rounded-xl transition-all duration-200">
            Cancel
          </Link>
          <button 
            type="submit"
            disabled={loading}
            className="gradient-bg hover:opacity-90 disabled:opacity-50 text-white text-xs font-semibold px-6 py-2.5 rounded-xl cursor-pointer flex items-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" size={14} />}
            <span>Save Package</span>
          </button>
        </div>
      </form>
    </div>
  );
}
