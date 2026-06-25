'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  TrendingUp, 
  Users, 
  CreditCard, 
  Wallet, 
  ShieldAlert, 
  Share2, 
  Bell, 
  Download, 
  LogOut, 
  LayoutDashboard,
  Shield,
  ChevronDown
} from 'lucide-react';

interface MenuItem {
  label: string;
  href: string;
  icon: React.ComponentType<any>;
  role?: string;
  category: 'menu' | 'management';
}

const allMenuItems: MenuItem[] = [
  { label: 'Home', href: '/dashboard', icon: LayoutDashboard, category: 'menu' },
  { label: 'Customers', href: '/dashboard/customers', icon: Users, category: 'menu' },
  { label: 'Investment Plans', href: '/dashboard/plans', icon: TrendingUp, role: 'owner', category: 'menu' },
  { label: 'Transactions', href: '/dashboard/transactions', icon: CreditCard, category: 'menu' },
  { label: 'Payouts', href: '/dashboard/payouts', icon: Wallet, category: 'menu' },
  { label: 'Supervisors', href: '/dashboard/supervisors', icon: ShieldAlert, role: 'owner', category: 'management' },
  { label: 'Referrals', href: '/dashboard/referrals', icon: Share2, category: 'management' },
  { label: 'Notifications', href: '/dashboard/notifications', icon: Bell, category: 'management' },
  { label: 'Reports', href: '/dashboard/reports', icon: Download, category: 'management' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState('owner');
  const [userName, setUserName] = useState('K N C PAVAN KUMAR');

  useEffect(() => {
    const userRole = Cookies.get('user_role') || 'owner';
    const name = Cookies.get('user_name') || 'K N C PAVAN KUMAR';
    setRole(userRole);
    setUserName(name);
  }, []);

  const handleLogout = () => {
    Cookies.remove('access_token');
    Cookies.remove('refresh_token');
    Cookies.remove('user_role');
    Cookies.remove('user_name');
    router.push('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .slice(0, 2)
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const menuItems = allMenuItems.filter(item => !item.role || item.role === role);

  return (
    <aside className="w-64 bg-[#000000] h-screen sticky top-0 flex flex-col justify-between p-5 z-40 border-r border-zinc-900/60 font-sans select-none">
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Brand Identity */}
        <div className="flex items-center gap-3 mb-8 px-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Varahi Capital Logo" className="w-10 h-10 object-contain" />
          <span className="text-base font-extrabold tracking-tight text-white">Varahi Capital</span>
        </div>

        {/* Flat Navigation Menu List */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-full transition-all duration-200 ${
                  isActive 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : 'text-slate-400 hover:text-white hover:bg-zinc-900/40'
                }`}
                style={{
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 500,
                  lineHeight: '20px',
                }}
              >
                <Icon size={16} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer / Logout */}
      <div className="pt-4 border-t border-zinc-900">
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-slate-500 hover:text-rose-500 text-[10px] font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer w-full text-center hover:bg-zinc-900/20 rounded-xl"
        >
          <LogOut size={13} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
