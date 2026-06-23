'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Image as ImageIcon, Loader2, Flag } from 'lucide-react';
import { formatINR } from '@packages/utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [reason, setReason] = useState('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = () => {
    fetch('/api/investments')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch transactions');
        return res.json();
      })
      .then((data) => {
        setTransactions(data.filter((t: any) => t.status === 'pending'));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this investment?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/investments/${id}/approve/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== id));
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to approve');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlag = (id: string) => {
    alert('This transaction has been flagged and marked for Owner review.');
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/investments/${selectedTxn.id}/reject/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: reason })
      });
      if (res.ok) {
        setTransactions(transactions.filter(t => t.id !== selectedTxn.id));
        setSelectedTxn(null);
        setReason('');
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to reject');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Deposit Verification Queue</h1>
        <p className="text-sm text-zinc-400 mt-1">Audit payment screenshots. Note: Transactions exceeding ₹1,00,000 must be flagged for Owner review.</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
          <p className="text-sm text-zinc-400">No pending transaction audits.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/5 glass-panel overflow-hidden">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider font-mono">
                <th className="p-4">Customer</th>
                <th className="p-4">Investment Plan</th>
                <th className="p-4">Amount</th>
                <th className="p-4">UPI Txn Ref</th>
                <th className="p-4">Proof</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              {transactions.map((txn) => {
                const needsOwnerReview = parseFloat(txn.amount) > 100000;
                return (
                  <tr key={txn.id} className="hover:bg-white/5 transition-colors duration-150">
                    <td className="p-4">
                      <p className="font-semibold text-white">{txn.customer_name || 'Unregistered'}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{txn.customer_mobile}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-zinc-200">{txn.plan_details.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5 font-mono">{txn.plan_details.return_rate_percent}% p.a. • {txn.plan_details.tenure_months}M</p>
                    </td>
                    <td className="p-4 font-mono font-bold text-zinc-200">{formatINR(txn.amount)}</td>
                    <td className="p-4 font-mono text-zinc-400 font-semibold">{txn.upi_txn_ref}</td>
                    <td className="p-4">
                      {txn.screenshot ? (
                        <button 
                          onClick={() => setLightboxImg(txn.screenshot)}
                          className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer"
                        >
                          <ImageIcon size={14} />
                          <span>View Screenshot</span>
                        </button>
                      ) : (
                        <span className="text-zinc-600 italic">No proof uploaded</span>
                      )}
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      {needsOwnerReview ? (
                        <button 
                          onClick={() => handleFlag(txn.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-all cursor-pointer font-semibold font-mono"
                          title="Requires Owner Approval"
                        >
                          <Flag size={12} />
                          <span>Flag for Owner</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleApprove(txn.id)}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all cursor-pointer"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button 
                        onClick={() => setSelectedTxn(txn)}
                        disabled={actionLoading}
                        className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                        title="Reject"
                      >
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Rejection Modal */}
      {selectedTxn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <form onSubmit={handleRejectSubmit} className="w-full max-w-md p-6 rounded-2xl glass-card border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white">Reject Deposit Verification</h3>
            <p className="text-xs text-zinc-400 font-mono">Customer Reference: {selectedTxn.upi_txn_ref}</p>
            
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-2 font-mono uppercase">Rejection Reason</label>
              <textarea 
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Screenshot blur / reference number mismatch..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 h-24 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-4">
              <button 
                type="button" 
                onClick={() => setSelectedTxn(null)}
                className="border border-white/5 hover:bg-white/5 text-zinc-400 text-xs px-4 py-2 rounded-xl"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={actionLoading}
                className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                {actionLoading && <Loader2 className="animate-spin" size={12} />}
                <span>Confirm Reject</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Screenshot Lightbox */}
      {lightboxImg && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 cursor-zoom-out"
          onClick={() => setLightboxImg(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh]">
            <img 
              src={lightboxImg} 
              alt="Payment Screenshot Proof" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg border border-white/10 shadow-2xl" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
