'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Power, X, Loader2, HelpCircle } from 'lucide-react';
import { formatINR } from '@packages/utils';
import Cookies from 'js-cookie';

export default function PlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [role, setRole] = useState('owner');

  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawerError, setDrawerError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [returnRate, setReturnRate] = useState('');
  const [tenure, setTenure] = useState('12');
  const [frequency, setFrequency] = useState('monthly');
  const [penalty, setPenalty] = useState('2.00');
  const [terms, setTerms] = useState('');

  useEffect(() => {
    const userRole = Cookies.get('user_role') || 'owner';
    setRole(userRole);
    fetchPlans();
  }, []);

  const fetchPlans = () => {
    fetch('/api/plans')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch plans');
        return res.json();
      })
      .then((data) => {
        setPlans(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/plans/${id}/toggle/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setPlans(plans.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
      } else {
        setPlans(plans.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
      }
    } catch (err) {
      setPlans(plans.map(p => p.id === id ? { ...p, is_active: !p.is_active } : p));
    }
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setDrawerError('');
    setSubmitting(true);

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
        const newPlan = await res.json();
        setPlans([newPlan, ...plans]);
        setIsDrawerOpen(false);
        // Reset form
        setName('');
        setDescription('');
        setMinAmount('');
        setMaxAmount('');
        setReturnRate('');
        setTenure('12');
        setFrequency('monthly');
        setPenalty('2.00');
        setTerms('');
      } else {
        const data = await res.json();
        setDrawerError(data.error || 'Failed to save plan. Please check details.');
      }
    } catch (err) {
      setDrawerError('Connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800 relative min-h-[calc(100vh-100px)]">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Investment Plans</h1>
          <p className="text-sm text-slate-500 mt-1">Manage investment packages available for retail investors.</p>
        </div>
        
        {role === 'owner' && (
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4.5 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-500/10 transition-all duration-200"
          >
            <Plus size={16} />
            <span>Create New Plan</span>
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Grid of Plans */}
      {plans.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-slate-200 bg-white rounded-[24px]">
          <p className="text-sm text-slate-500">No investment plans configured yet.</p>
          {role === 'owner' && (
            <button onClick={() => setIsDrawerOpen(true)} className="text-xs text-blue-600 font-semibold hover:underline mt-2 inline-block">
              Create your first plan
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`p-6 rounded-[24px] bg-white border border-slate-200 flex flex-col justify-between h-80 relative shadow-sm hover:shadow-md transition-all duration-200 ${
                plan.is_active ? '' : 'opacity-65'
              }`}
            >
              <div className="absolute top-4 right-4">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border uppercase ${
                  plan.is_active 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-250 bg-emerald-50/50' 
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-4">
                <div className="pr-12">
                  <h3 className="text-base font-bold text-slate-900 leading-tight">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{plan.description || 'No description provided.'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-y border-slate-100 py-4 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Return Rate</span>
                    <span className="text-sm font-bold text-blue-650 text-blue-600">{plan.return_rate_percent}% p.a.</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Tenure</span>
                    <span className="text-sm font-bold text-slate-800">{plan.tenure_months} Months</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Min Amount</span>
                    <span className="text-xs font-bold text-slate-700">{formatINR(plan.min_amount)}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block uppercase tracking-wider font-semibold">Payout</span>
                    <span className="text-xs font-bold text-slate-700 capitalize">{plan.payout_frequency.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>

              {role === 'owner' && (
                <div className="flex items-center gap-3 mt-6">
                  <button 
                    onClick={() => handleToggle(plan.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-semibold transition-all duration-200 border cursor-pointer ${
                      plan.is_active 
                        ? 'border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100' 
                        : 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    <Power size={14} />
                    <span>{plan.is_active ? 'Deactivate' : 'Activate'}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Slide sheet drawer (Right side sheet for creation) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-sm">
          {/* Backdrop click closes drawer */}
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />
          
          {/* Drawer Body */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col justify-between z-10 drawer-open border-l border-slate-200">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Create Investment Plan</h2>
                <p className="text-[10px] text-slate-400 font-medium mt-0.5">Configure yielding scheme options</p>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-all"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error inside drawer */}
            {drawerError && (
              <div className="mx-6 mt-4 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs rounded-xl">
                {drawerError}
              </div>
            )}

            {/* Form Content */}
            <form onSubmit={handleSavePlan} className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Plan Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Varahi Monthly Yield Plan"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize benefits, payout details, or returns terms..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40 h-20 resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Min Investment (₹)</label>
                  <input 
                    type="number" 
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Max Investment (₹)</label>
                  <input 
                    type="number" 
                    value={maxAmount}
                    onChange={(e) => setMaxAmount(e.target.value)}
                    placeholder="500000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Yield Rate (% p.a.)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={returnRate}
                    onChange={(e) => setReturnRate(e.target.value)}
                    placeholder="14.50"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Tenure (Months)</label>
                  <select
                    value={tenure}
                    onChange={(e) => setTenure(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
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
                <label className="block text-[10px] font-bold text-slate-400 mb-3 uppercase font-mono tracking-wider">Payout Yield Frequency</label>
                <div className="flex gap-4">
                  {['monthly', 'quarterly', 'on_maturity'].map((freq) => (
                    <label key={freq} className="flex items-center gap-2 text-xs text-slate-650 cursor-pointer">
                      <input 
                        type="radio" 
                        name="payout_frequency"
                        value={freq}
                        checked={frequency === freq}
                        onChange={() => setFrequency(freq)}
                        className="accent-blue-600"
                      />
                      <span className="capitalize">{freq.replace('_', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">Premature Penalty Rate (%)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={penalty}
                  onChange={(e) => setPenalty(e.target.value)}
                  placeholder="2.00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase font-mono tracking-wider">T&C Summary</label>
                <textarea 
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Withdrawal penalties, payout timelines..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-blue-500/40 h-20 resize-none"
                  required
                />
              </div>

              {/* Action buttons at the bottom of the drawer */}
              <div className="pt-4 border-t border-slate-100 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 py-3 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-2xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl text-xs font-bold uppercase shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5"
                >
                  {submitting && <Loader2 className="animate-spin" size={12} />}
                  <span>Save Plan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
