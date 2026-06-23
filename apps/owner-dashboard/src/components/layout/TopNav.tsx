'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Search, LayoutGrid } from 'lucide-react';
import Cookies from 'js-cookie';

export default function TopNav() {
  const [role, setRole] = useState('owner');
  const [userName, setUserName] = useState('K N C PAVAN KUMAR');

  useEffect(() => {
    const userRole = Cookies.get('user_role') || 'owner';
    const name = Cookies.get('user_name') || 'K N C PAVAN KUMAR';
    setRole(userRole);
    setUserName(name);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="h-16 border-b border-slate-200 px-6 flex items-center justify-between z-30 bg-white font-sans">
      {/* Search Input */}
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search transactions, plans, or customers..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500/40 transition-all duration-200"
          />
        </div>
      </div>
      
      {/* Right Icons & Profile */}
      <div className="flex items-center gap-4">
        {/* Search Helper */}
        <button className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200">
          <Search size={16} />
        </button>

        {/* Dashboard Grid Toggle Mock */}
        <button className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200">
          <LayoutGrid size={16} />
        </button>

        {/* Notification Bell */}
        <button className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 relative">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
        </button>
        
        <div className="h-6 w-px bg-slate-200"></div>
        
        {/* User Card */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{userName}</p>
            <p className="text-[9px] text-slate-400 font-mono uppercase tracking-wider mt-0.5">
              {role === 'owner' ? 'Administrator' : 'Supervisor'}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-blue-500/10">
            {getInitials(userName)}
          </div>
        </div>
      </div>
    </header>
  );
}
