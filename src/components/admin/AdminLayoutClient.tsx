'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/admin/Sidebar';
import AdminHeader from '@/components/admin/AdminHeader';

interface AdminLayoutProps {
  children: React.ReactNode;
  user?: {
    profile?: { profile_image?: string; name?: string };
    email?: string;
    name?: string;
  } | null;
}

export default function AdminLayoutClient({ children, user }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default to true for desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Force dark mode for admin panel
  useEffect(() => {
    document.documentElement.classList.add('dark');
    return () => {
      // Optional: remove dark class when leaving admin
      // document.documentElement.classList.remove('dark');
    };
  }, []);

  return (
    <div className="admin-container relative">
      {/* Animated Grid Background */}
      <div className="admin-grid-bg" />

      {/* Scanline Effect */}
      <div className="admin-scanline" />

      {/* Sidebar - Fixed Position */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content Area - Adjusted margin based on sidebar state */}
      <div
        className={`relative flex min-w-0 flex-1 flex-col transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
        }`}
      >
        <AdminHeader onMenuClick={() => setSidebarOpen(true)} user={user ?? null} />

        <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
