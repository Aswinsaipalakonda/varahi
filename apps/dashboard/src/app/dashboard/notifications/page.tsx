'use client';

import React from 'react';
import { Bell, Info, ShieldAlert, CheckCircle } from 'lucide-react';

const mockLogs = [
  { id: 1, type: 'info', title: 'Daily Scheduler Triggered', message: 'Celery daily payout scheduler finished checking matures.', time: 'Today, 9:00 AM' },
  { id: 2, type: 'warning', title: 'KYC Document Submission', message: 'User Swetha Reddy uploaded KYC documents for supervisor review.', time: 'Today, 8:15 AM' },
  { id: 3, type: 'success', title: 'Payment Approved', message: 'Owner approved investment deposit of ₹1,50,000 for Pavan Kumar.', time: 'Yesterday, 4:30 PM' },
  { id: 4, type: 'info', title: 'System Build Updated', message: 'Internal API router paths proxy patched successfully.', time: '2 days ago' }
];

export default function NotificationsPage() {
  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notifications & Alerts</h1>
        <p className="text-sm text-slate-500 mt-1 font-sans">View critical platform events, logs, and compliance alerts.</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-[28px] p-6 shadow-sm space-y-4">
        {mockLogs.map((log) => {
          return (
            <div key={log.id} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50/40 transition-colors duration-150">
              <div className="mt-0.5">
                {log.type === 'success' ? (
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <CheckCircle size={16} />
                  </div>
                ) : log.type === 'warning' ? (
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                    <ShieldAlert size={16} />
                  </div>
                ) : (
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                    <Info size={16} />
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">{log.title}</p>
                <p className="text-xs text-slate-500">{log.message}</p>
                <p className="text-[10px] text-slate-450 font-mono mt-1">{log.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
