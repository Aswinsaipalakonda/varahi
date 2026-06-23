'use client';

import React from 'react';
import { Download, FileText, BarChart2 } from 'lucide-react';

const mockReports = [
  { id: 'rep1', name: 'AUM Growth Ledger (CSV)', desc: 'Daily tracking of assets deposits and maturities.', size: '42 KB', date: 'Jun 23, 2026' },
  { id: 'rep2', name: 'KYC Verification Registry', desc: 'Compliance status and verified bank IFSC credentials list.', size: '12 KB', date: 'Jun 22, 2026' },
  { id: 'rep3', name: 'Interest Yield Distributions Log', desc: 'Detailed log of settled and pending payouts schedules.', size: '115 KB', date: 'Jun 20, 2026' }
];

export default function ReportsPage() {
  const handleDownload = (name: string) => {
    alert(`Downloading ${name} report in CSV format...`);
  };

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Platform Reports</h1>
        <p className="text-sm text-slate-500 mt-1 font-sans">Export operational summaries and tax auditing logs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockReports.map((rep) => (
          <div key={rep.id} className="p-6 bg-white border border-slate-200 rounded-[28px] shadow-sm flex flex-col justify-between h-52 hover:shadow-md transition-all duration-200">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-tight">{rep.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{rep.desc}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{rep.date} • {rep.size}</span>
              <button 
                onClick={() => handleDownload(rep.name)}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center gap-1 cursor-pointer"
              >
                <Download size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
