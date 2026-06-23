'use client';

import React from 'react';
import { Bell, Search } from 'lucide-react';

export default function TopNav() {
  return (
    <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between z-30 sticky top-0 bg-zinc-950/65 backdrop-blur-md">
      <div className="flex items-center gap-4 w-96">
        <div className="relative w-full">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={16} />
          <input 
            type="text" 
            placeholder="Search customers by name or mobile..." 
            className="w-full bg-white/5 border border-white/5 rounded-xl pl-10 pr-4 py-1.5 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all duration-200"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-zinc-400 hover:text-zinc-200 rounded-xl hover:bg-white/5 transition-all duration-200 relative">
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-zinc-950"></span>
        </button>
        
        <div className="h-8 w-px bg-white/10"></div>
        
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-semibold text-sm">
            SP
          </div>
          <div className="text-left hidden md:block">
            <p className="text-xs font-semibold text-zinc-200">Supervisor Account</p>
            <p className="text-[10px] text-zinc-500 font-mono">Platform Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
