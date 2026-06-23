'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Users, 
  CreditCard, 
  Wallet, 
  Download, 
  LogOut, 
  LayoutDashboard 
} from 'lucide-react';

const menuItems = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Transactions', href: '/dashboard/transactions', icon: CreditCard },
  { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet },
  { label: 'Customers', href: '/dashboard/customers', icon: Users },
  { label: 'Reports', href: '/dashboard/reports', icon: Download },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    router.push('/login');
  };

  return (
    <aside className="w-64 glass-panel border-r border-white/5 h-screen sticky top-0 flex flex-col justify-between p-4 z-40">
      <div>
        <div className="mb-8 px-2 py-3">
          <span className="text-xl font-bold tracking-wider gradient-text font-sans">VARAHI CAPITAL</span>
          <p className="text-[10px] text-zinc-500 uppercase mt-0.5 tracking-widest font-mono">Supervisor Portal</p>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-sm ${
                  isActive 
                    ? 'bg-indigo-600/20 text-indigo-400 border-l-4 border-indigo-500 font-semibold' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 text-sm font-semibold transition-all duration-200 cursor-pointer w-full text-left"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
