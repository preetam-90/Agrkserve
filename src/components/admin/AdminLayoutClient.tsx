'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import '@/app/admin/admin-theme.css';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: any;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Force dark mode for admin panel
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Optional: remove dark class when leaving admin
      // document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="admin-bg-pattern flex min-h-screen bg-[#0a0a0a] font-sans text-white">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300">
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} user={user} />

        <main className="mx-auto w-full max-w-7xl flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
