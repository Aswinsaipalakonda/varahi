'use client';

import React, { useState, useEffect } from 'react';
import { Plus, ShieldAlert } from 'lucide-react';
import Cookies from 'js-cookie';

export default function SupervisorsPage() {
  const [supervisors, setSupervisors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('owner');

  useEffect(() => {
    const userRole = Cookies.get('user_role') || 'owner';
    setRole(userRole);

    fetch('/api/supervisors')
      .then((res) => res.json())
      .then((data) => {
        setSupervisors(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleCreate = () => {
    alert('Creating a new supervisor account is disabled in demo mode.');
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-800">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Compliance Supervisors</h1>
          <p className="text-sm text-slate-500 mt-1">Audit officer credentials and system log permissions.</p>
        </div>

        {role === 'owner' && (
          <button 
            onClick={handleCreate}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-blue-500/10 transition-all duration-200"
          >
            <Plus size={16} />
            <span>Create Supervisor</span>
          </button>
        )}
      </div>

      <div className="rounded-[24px] border border-slate-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-500 font-semibold uppercase tracking-wider font-mono">
              <th className="p-4">Full Name</th>
              <th className="p-4">Email Address</th>
              <th className="p-4">Mobile Number</th>
              <th className="p-4">Role Permission</th>
              <th className="p-4">Audit Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {supervisors.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50/40 transition-colors duration-150">
                <td className="p-4 font-semibold text-slate-900">{s.full_name}</td>
                <td className="p-4 font-mono text-slate-650">{s.email}</td>
                <td className="p-4 font-mono">{s.mobile_number}</td>
                <td className="p-4 uppercase font-mono font-bold text-blue-600">Supervisor</td>
                <td className="p-4">
                  <span className="px-2.5 py-0.5 rounded-full font-semibold border text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 uppercase">
                    Active
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
