'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Tractor,
    CalendarDays,
    Briefcase,
    Settings,
    LogOut,
    X,
    Database,
    ShieldCheck,
    HardDrive
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const menuItems = [
    { icon: LayoutDashboard, label: 'Overview', href: '/admin' },
    { type: 'divider', label: 'Management' },
    { icon: Users, label: 'Users', href: '/admin/users' },
    { icon: Tractor, label: 'Equipment', href: '/admin/equipment' },
    { icon: CalendarDays, label: 'Bookings', href: '/admin/bookings' },
    { icon: Briefcase, label: 'Labour', href: '/admin/labour' },
    { type: 'divider', label: 'System' },
    { icon: HardDrive, label: 'Storage', href: '/admin/storage' }, // New
    { icon: ShieldCheck, label: 'Audit Logs', href: '/admin/logs' }, // New
    { icon: Database, label: 'Database', href: '/admin/database' }, // New
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();

    return (
        <>
            {/* Mobile Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar Container */}
            <motion.aside
                className={cn(
                    "fixed top-0 left-0 bottom-0 width-[280px] z-50 lg:translate-x-0 lg:static w-[280px]",
                    "bg-white/80 dark:bg-slate-900/80 backdrop-filter backdrop-blur-xl border-r border-slate-200 dark:border-slate-800",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
                initial={false}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="h-20 flex items-center px-8 border-b border-slate-200/50 dark:border-slate-800/50">
                        <Link href="/admin" className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-600 to-green-800 flex items-center justify-center shadow-lg shadow-green-900/20 group-hover:shadow-green-900/40 transition-all duration-300">
                                <LayoutDashboard className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                                    Agri<span className="text-green-600">Admin</span>
                                </h1>
                                <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Control Center</p>
                            </div>
                        </Link>
                        <button
                            onClick={onClose}
                            className="ml-auto lg:hidden p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 admin-scrollbar">
                        {menuItems.map((item, idx) => {
                            if (item.type === 'divider') {
                                return (
                                    <div key={idx} className="px-4 py-4 mt-2">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                            {item.label}
                                        </p>
                                    </div>
                                );
                            }

                            const isActive = pathname === item.href;
                            const Icon = item.icon as any;

                            return (
                                <Link key={idx} href={item.href || '#'}>
                                    <motion.div
                                        whileHover={{ x: 4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 mb-1",
                                            isActive
                                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 shadow-sm ring-1 ring-green-600/20"
                                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                                        )}
                                    >
                                        <Icon className={cn("w-5 h-5", isActive ? "text-green-600 dark:text-green-400" : "text-slate-400")} />
                                        {item.label}
                                        {isActive && (
                                            <motion.div
                                                layoutId="active-pill"
                                                className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </motion.div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50">
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                <ShieldCheck className="w-20 h-20 rotate-12" />
                            </div>
                            <p className="text-xs font-medium text-slate-400 mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="font-semibold text-sm">System Healthy</span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.aside>
        </>
    );
}
