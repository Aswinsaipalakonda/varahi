'use client';

import React, { useState, useEffect } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { formatINR } from '@packages/utils';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = () => {
    setLoading(true);
    const query = statusFilter ? `?status=${statusFilter}` : '';
    fetch(`/api/payouts${query}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch payouts');
        return res.json();
      })
      .then((data) => {
        setPayouts(data);
        setSelectedIds([]);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const claimable = payouts
        .filter(p => ['pending', 'overdue'].includes(p.status))
        .map(p => p.id);
      setSelectedIds(claimable);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...selectedIds, id]);
    } else {
      setSelectedIds(selectedIds.filter(x => x !== id));
    }
  };

  const handleMarkPaid = async (id: string) => {
    if (!confirm('Mark this payout as paid? Make sure the bank transfer is executed.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/payouts/${id}/mark-paid/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ remarks: 'Yield paid by Supervisor' })
      });
      if (res.ok) {
        fetchPayouts();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleBulkMarkPaid = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Mark ${selectedIds.length} payouts as paid? Make sure all bank transfers are completed.`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/payouts/bulk-mark-paid/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payout_ids: selectedIds, remarks: 'Bulk paid by Supervisor' })
      });
      if (res.ok) {
        fetchPayouts();
      } else {
        const d = await res.json();
        alert(d.error || 'Failed to update');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && payouts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Payout Schedules</h1>
          <p className="text-sm text-zinc-400 mt-1 font-sans">Audit and authorize yield payments and refunds to retail investors.</p>
        </div>
        
        {selectedIds.length > 0 && (
          <button 
            onClick={handleBulkMarkPaid}
            disabled={actionLoading}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-emerald-500/10"
          >
            {actionLoading ? <Loader2 className="animate-spin" size={14} /> : <Check size={14} />}
            <span>Mark Selected Paid ({selectedIds.length})</span>
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-zinc-400 font-mono uppercase">Filter:</span>
        <div className="flex gap-2">
          {['', 'pending', 'overdue', 'paid'].map((statusOption) => (
            <button
              key={statusOption}
              onClick={() => setStatusFilter(statusOption)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono capitalize transition-all cursor-pointer ${
                statusFilter === statusOption
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white/5 border border-white/5 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {statusOption === '' ? 'All Payouts' : statusOption}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-white/5 glass-panel overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5 text-zinc-400 font-semibold uppercase tracking-wider font-mono">
              <th className="p-4 w-12">
                <input 
                  type="checkbox" 
                  onChange={handleSelectAll}
                  checked={payouts.length > 0 && selectedIds.length === payouts.filter(p => ['pending', 'overdue'].includes(p.status)).length}
                  className="accent-indigo-500"
                />
              </th>
              <th className="p-4">Customer Details</th>
              <th className="p-4">Investment Info</th>
              <th className="p-4">Amount Due</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-zinc-300">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-500 font-mono">No payouts registered.</td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="p-4">
                    {['pending', 'overdue'].includes(payout.status) ? (
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(payout.id)}
                        onChange={(e) => handleSelectOne(payout.id, e.target.checked)}
                        className="accent-indigo-500"
                      />
                    ) : null}
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-white">{payout.customer_name || 'Unregistered'}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{payout.customer_mobile}</p>
                  </td>
                  <td className="p-4">
                    <p className="font-semibold text-zinc-200">{payout.plan_name}</p>
                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">{payout.remarks || 'Monthly Yield Payout'}</p>
                  </td>
                  <td className="p-4 font-mono font-bold text-zinc-200">{formatINR(payout.amount)}</td>
                  <td className="p-4 font-mono text-zinc-400">{payout.due_date}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${
                      payout.status === 'paid' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : payout.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : payout.status === 'overdue'
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                    }`}>
                      {payout.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    {['pending', 'overdue'].includes(payout.status) ? (
                      <button 
                        onClick={() => handleMarkPaid(payout.id)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded hover:bg-indigo-500/20 transition-all cursor-pointer"
                      >
                        <Check size={10} />
                        <span>Mark Paid</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-500 font-mono">Paid</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
