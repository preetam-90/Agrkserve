'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
    HardDrive,
    FileText,
    Image as ImageIcon,
    MoreVertical,
    Search,
    Upload,
    Trash2,
    ExternalLink,
    FolderOpen,
    ChevronRight,
    RefreshCw,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StoragePage() {
    const [buckets, setBuckets] = useState<any[]>([]);
    const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
    const [files, setFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [path, setPath] = useState<string[]>([]);

    const supabase = createClient();

    const fetchBuckets = async () => {
        setLoading(true);
        const { data, error } = await supabase.storage.listBuckets();
        if (error) console.error('Error fetching buckets:', error);
        else {
            setBuckets(data || []);
            if (data && data.length > 0 && !selectedBucket) {
                setSelectedBucket(data[0].name);
            }
        }
        setLoading(false);
    };

    const fetchFiles = async () => {
        if (!selectedBucket) return;
        setLoading(true);
        const currentPath = path.join('/');
        const { data, error } = await supabase.storage.from(selectedBucket).list(currentPath);

        if (error) console.error('Error fetching files:', error);
        else setFiles(data || []);
        setLoading(false);
    };

    useEffect(() => {
        fetchBuckets();
    }, []);

    useEffect(() => {
        fetchFiles();
    }, [selectedBucket, path]);

    const formatSize = (bytes: number) => {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Storage Explorer</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Manage cloud assets and storage buckets.</p>
                </div>
                <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload File
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Buckets Sidebar */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Buckets</h3>
                    <div className="space-y-1">
                        {buckets.map((bucket) => (
                            <button
                                key={bucket.name}
                                onClick={() => {
                                    setSelectedBucket(bucket.name);
                                    setPath([]);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${selectedBucket === bucket.name
                                        ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <HardDrive className="w-4 h-4" />
                                {bucket.name}
                                {bucket.public && (
                                    <span className="ml-auto text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase">Public</span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 mt-8">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 flex items-center gap-2 mb-2">
                            <Clock className="w-3.5 h-3.5" />
                            Storage Usage
                        </p>
                        <div className="h-1.5 w-full bg-blue-200 dark:bg-blue-900/40 rounded-full overflow-hidden">
                            <div className="h-full w-[12%] bg-blue-600 rounded-full" />
                        </div>
                        <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-2">1.2GB of 10GB used</p>
                    </div>
                </div>

                {/* File Browser */}
                <div className="lg:col-span-3 space-y-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-slate-500 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
                        <button onClick={() => setPath([])} className="hover:text-slate-900 dark:hover:text-white transition-colors px-2">
                            {selectedBucket || 'root'}
                        </button>
                        {path.map((p, i) => (
                            <React.Fragment key={i}>
                                <ChevronRight className="w-4 h-4" />
                                <button
                                    onClick={() => setPath(path.slice(0, i + 1))}
                                    className="hover:text-slate-900 dark:hover:text-white transition-colors px-2"
                                >
                                    {p}
                                </button>
                            </React.Fragment>
                        ))}
                        <button onClick={fetchFiles} className="ml-auto p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>

                    {/* Files Grid */}
                    <div className="glass-panel rounded-2xl min-h-[500px] p-6">
                        {loading ? (
                            <div className="flex items-center justify-center min-h-[400px]">
                                <RefreshCw className="w-8 h-8 text-green-500 animate-spin" />
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-6">
                                {files.map((file) => (
                                    <div key={file.name} className="group flex flex-col items-center">
                                        <div className="w-full aspect-square rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-center relative overflow-hidden group-hover:border-green-500/50 group-hover:bg-green-50/30 dark:group-hover:bg-green-900/10 transition-all duration-300">
                                            {file.metadata ? (
                                                <ImageIcon className="w-10 h-10 text-slate-400 group-hover:text-green-500 group-hover:scale-110 transition-all duration-300" />
                                            ) : (
                                                <FolderOpen className="w-10 h-10 text-slate-400 group-hover:text-amber-500 transition-all" />
                                            )}

                                            <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button className="p-2 bg-white text-slate-900 rounded-lg hover:scale-110 transition-transform">
                                                    <ExternalLink className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 bg-red-500 text-white rounded-lg hover:scale-110 transition-transform">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="mt-3 text-xs font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center px-2">
                                            {file.name}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 uppercase">
                                            {file.metadata ? formatSize(file.metadata.size) : 'Folder'}
                                        </p>
                                    </div>
                                ))}
                                {files.length === 0 && (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                                        <FolderOpen className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="font-medium text-sm">No files found in this directory</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Minimal react import for Fragment if needed in Turbopack
import React from 'react';
