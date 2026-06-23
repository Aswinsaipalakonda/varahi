'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import Sidebar from '@/components/layout/Sidebar';
import TopNav from '@/components/layout/TopNav';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (!token) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  useEffect(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 1 && segments[0] === 'dashboard') {
      document.title = 'Overview | Varahi Capital';
    } else if (segments.length > 1) {
      const subpage = segments[1];
      const titleMap: Record<string, string> = {
        customers: 'Customers | Varahi Capital',
        plans: 'Investment Plans | Varahi Capital',
        transactions: 'Transactions | Varahi Capital',
        payouts: 'Payouts | Varahi Capital',
        supervisors: 'Supervisors | Varahi Capital',
        referrals: 'Referrals | Varahi Capital',
        notifications: 'Notifications | Varahi Capital',
        reports: 'Reports | Varahi Capital',
      };
      document.title = titleMap[subpage] || `${subpage.charAt(0).toUpperCase() + subpage.slice(1)} | Varahi Capital`;
    }
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-950">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F6F6F9]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
