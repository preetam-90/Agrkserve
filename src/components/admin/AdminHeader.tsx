'use client';

import { useState } from 'react';
import {
    Search,
    Bell,
    Menu,
    ChevronDown,
    LogOut,
    User,
    Settings,
    Moon,
    Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
    onMenuClick: () => void;
    user: any;
}

export default function AdminHeader({ onMenuClick, user }: AdminHeaderProps) {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isDark, setIsDark] = useState(false); // In real app, use theme provider
    const router = useRouter();
    const supabase = createClient();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/login');
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="h-20 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-30">
            {/* Left: Mobile Menu & Search */}
            <div className="flex items-center gap-6 flex-1">
                <button
                    onClick={onMenuClick}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                    <Menu className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>

                <div className="hidden md:flex items-center gap-3 w-full max-w-md bg-slate-100 dark:bg-slate-800/50 px-4 py-2.5 rounded-xl border border-transparent focus-within:border-green-500/50 focus-within:ring-2 focus-within:ring-green-500/20 transition-all duration-300">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users, bookings, equipment..."
                        className="bg-transparent border-none outline-none text-sm w-full text-slate-900 dark:text-slate-100 placeholder-slate-400"
                    />
                    <div className="flex text-xs text-slate-400 font-mono border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded">⌘K</div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-4">
                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Notifications */}
                <button className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-3 pl-2 pr-4 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-green-500 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-green-500/30">
                            {user?.profile?.profile_image ? (
                                <img src={user.profile.profile_image} className="w-full h-full rounded-full object-cover" alt="Profile" />
                            ) : (
                                <span className="font-bold text-sm">A</span>
                            )}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-none">{user?.profile?.name || 'Admin'}</p>
                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wide mt-1">Super Admin</p>
                        </div>
                        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <>
                                <div
                                    className="fixed inset-0 z-30"
                                    onClick={() => setShowProfileMenu(false)}
                                />
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-40 overflow-hidden"
                                >
                                    <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                                        <p className="text-sm font-medium text-slate-900 dark:text-white">Admin Account</p>
                                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                                    </div>
                                    <div className="p-2 space-y-1">
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                            <User className="w-4 h-4" />
                                            My Profile
                                        </button>
                                        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl transition-colors">
                                            <Settings className="w-4 h-4" />
                                            Settings
                                        </button>
                                    </div>
                                    <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Logout
                                        </button>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
