'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import {
  HardDrive,
  FileText,
  Image as ImageIcon,
  Video,
  File,
  Music,
  Archive,
  Code,
  Search,
  Upload,
  Trash2,
  ExternalLink,
  FolderOpen,
  ChevronRight,
  RefreshCw,
  Download,
  X,
  CheckSquare,
  Square,
  BarChart3,
  Folder,
  Database,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FileMetadata {
  mimetype: string;
  size: number;
}

interface FileItem {
  name: string;
  id: string | null;
  updated_at: string | null;
  created_at: string | null;
  last_accessed_at: string | null;
  metadata: FileMetadata | null;
}

interface BucketStats {
  totalSize: number;
  fileCount: number;
  folderCount: number;
  fileTypes: Record<string, number>;
}

export default function StoragePage() {
  const [buckets, setBuckets] = useState<{ name: string; public: boolean }[]>([]);
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [path, setPath] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date'>('name');
  const [bucketStats, setBucketStats] = useState<BucketStats | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const fetchBuckets = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/storage/buckets');
      const result = await response.json();

      if (result.error) {
        console.error('Error fetching buckets:', result.error);
      } else {
        setBuckets(result.buckets || []);
        if (result.buckets && result.buckets.length > 0 && !selectedBucket) {
          setSelectedBucket(result.buckets[0].name);
        }
      }
    } catch (error) {
      console.error('Error fetching buckets:', error);
    }
    setLoading(false);
  };

  const fetchFiles = async () => {
    if (!selectedBucket) return;
    setLoading(true);
    const currentPath = path.join('/');

    try {
      const response = await fetch(
        `/api/storage/files?bucket=${encodeURIComponent(selectedBucket)}&path=${encodeURIComponent(currentPath)}`
      );
      const result = await response.json();

      if (result.error) {
        console.error('Error fetching files:', result.error);
        setFiles([]);
      } else {
        setFiles((result.files as FileItem[]) || []);
        calculateBucketStats((result.files as FileItem[]) || []);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }

    setLoading(false);
  };

  const calculateBucketStats = (fileList: FileItem[]) => {
    let totalSize = 0;
    let fileCount = 0;
    let folderCount = 0;
    const fileTypes: Record<string, number> = {};

    fileList.forEach((file) => {
      if (file.metadata) {
        fileCount++;
        totalSize += (file.metadata.size as number) || 0;
        const ext = file.name.split('.').pop()?.toLowerCase() || 'unknown';
        fileTypes[ext] = (fileTypes[ext] || 0) + 1;
      } else {
        folderCount++;
      }
    });

    setBucketStats({ totalSize, fileCount, folderCount, fileTypes });
  };

  useEffect(() => {
    fetchBuckets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchFiles();
    setSelectedFiles(new Set());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBucket, path]);

  const formatSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileIcon = (file: FileItem) => {
    if (!file.metadata) return <FolderOpen className="h-8 w-8 text-amber-500" />;

    const mime = file.metadata.mimetype || '';
    if (mime.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-blue-500" />;
    if (mime.startsWith('video/')) return <Video className="h-8 w-8 text-purple-500" />;
    if (mime.startsWith('audio/')) return <Music className="h-8 w-8 text-pink-500" />;
    if (mime.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (mime.includes('zip') || mime.includes('rar') || mime.includes('7z'))
      return <Archive className="h-8 w-8 text-orange-500" />;
    if (mime.includes('javascript') || mime.includes('json') || mime.includes('html'))
      return <Code className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-slate-500" />;
  };

  const handleFileView = (file: FileItem) => {
    if (!file.metadata) {
      setPath([...path, file.name]);
      return;
    }
    setPreviewFile(file);
  };

  const getFileUrl = (file: FileItem) => {
    if (!selectedBucket) return '';
    const currentPath = path.join('/');
    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${selectedBucket}/${fullPath}`;
  };

  const handleFileDelete = async (file: FileItem) => {
    if (!selectedBucket || !confirm(`Delete ${file.name}?`)) return;
    const currentPath = path.join('/');
    const fullPath = currentPath ? `${currentPath}/${file.name}` : file.name;

    try {
      const response = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          paths: [fullPath],
        }),
      });

      const result = await response.json();

      if (result.error) {
        alert('Failed to delete file');
        console.error(result.error);
      } else {
        fetchFiles();
      }
    } catch (error) {
      alert('Failed to delete file');
      console.error(error);
    }
  };

  const handleBulkDelete = async () => {
    if (!selectedBucket || selectedFiles.size === 0) return;
    if (!confirm(`Delete ${selectedFiles.size} selected files?`)) return;

    const currentPath = path.join('/');
    const filePaths = Array.from(selectedFiles).map((fileName) =>
      currentPath ? `${currentPath}/${fileName}` : fileName
    );

    try {
      const response = await fetch('/api/storage/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bucket: selectedBucket,
          paths: filePaths,
        }),
      });

      const result = await response.json();

      if (result.error) {
        alert('Failed to delete files');
        console.error(result.error);
      } else {
        setSelectedFiles(new Set());
        fetchFiles();
      }
    } catch (error) {
      alert('Failed to delete files');
      console.error(error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedBucket || !e.target.files?.length) return;

    setUploading(true);
    const file = e.target.files[0];
    const currentPath = path.join('/');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bucket', selectedBucket);
      formData.append('path', currentPath);

      const response = await fetch('/api/storage/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.error) {
        alert('Upload failed: ' + result.error);
      } else {
        fetchFiles();
      }
    } catch (error: unknown) {
      alert('Upload failed: ' + (error instanceof Error ? error.message : String(error)));
    }

    setUploading(false);
    e.target.value = '';
  };

  const handleFileDownload = async (file: FileItem) => {
    if (!selectedBucket || !file.metadata) return;
    const url = getFileUrl(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  };

  const toggleFileSelection = (fileName: string) => {
    const newSelection = new Set(selectedFiles);
    if (newSelection.has(fileName)) {
      newSelection.delete(fileName);
    } else {
      newSelection.add(fileName);
    }
    setSelectedFiles(newSelection);
  };

  const filteredAndSortedFiles = useMemo(() => {
    const filtered = files.filter((file) => {
      if (searchQuery && !file.name.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (filterType !== 'all') {
        if (filterType === 'folder' && file.metadata) return false;
        if (filterType === 'file' && !file.metadata) return false;
        if (
          filterType === 'image' &&
          (!file.metadata || !file.metadata.mimetype.startsWith('image/'))
        )
          return false;
        if (
          filterType === 'video' &&
          (!file.metadata || !file.metadata.mimetype.startsWith('video/'))
        )
          return false;
        if (
          filterType === 'document' &&
          (!file.metadata || !file.metadata.mimetype.includes('pdf'))
        )
          return false;
      }

      return true;
    });

    filtered.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'size') {
        const sizeA = a.metadata?.size || 0;
        const sizeB = b.metadata?.size || 0;
        return sizeB - sizeA;
      }
      if (sortBy === 'date') {
        const dateA = new Date(a.updated_at || 0).getTime();
        const dateB = new Date(b.updated_at || 0).getTime();
        return dateB - dateA;
      }
      return 0;
    });

    return filtered;
  }, [files, searchQuery, filterType, sortBy]);

  const isImageFile = (file: FileItem) => {
    return file.metadata?.mimetype?.startsWith('image/');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            <Database className="h-8 w-8" />
            Storage Explorer
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage cloud assets and storage buckets
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700">
            <Upload className="h-4 w-4" />
            {uploading ? 'Uploading...' : 'Upload File'}
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Analytics Panel */}
      <AnimatePresence>
        {showAnalytics && bucketStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 gap-6 md:grid-cols-4"
          >
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Total Size
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {formatSize(bucketStats.totalSize)}
                  </p>
                </div>
                <Database className="h-8 w-8 text-green-500" />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Files</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {bucketStats.fileCount}
                  </p>
                </div>
                <File className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Folders</p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {bucketStats.folderCount}
                  </p>
                </div>
                <Folder className="h-8 w-8 text-amber-500" />
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    File Types
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                    {Object.keys(bucketStats.fileTypes).length}
                  </p>
                </div>
                <FileText className="h-8 w-8 text-purple-500" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Buckets Sidebar */}
        <div className="space-y-4">
          <h3 className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Buckets
          </h3>
          <div className="space-y-2">
            {buckets.map((bucket) => (
              <button
                key={bucket.name}
                onClick={() => {
                  setSelectedBucket(bucket.name);
                  setPath([]);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  selectedBucket === bucket.name
                    ? 'bg-green-600 text-white'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <HardDrive className="h-5 w-5" />
                <span className="flex-1 text-left">{bucket.name}</span>
                {bucket.public && (
                  <span className="rounded bg-white/20 px-2 py-0.5 text-xs">Public</span>
                )}
              </button>
            ))}
          </div>

          {bucketStats && (
            <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-900/20">
              <p className="mb-2 text-xs font-semibold text-blue-900 dark:text-blue-400">
                Storage Usage
              </p>
              <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900">
                <div
                  className="h-full rounded-full bg-blue-600 transition-all duration-500"
                  style={{
                    width: bucketStats
                      ? `${Math.min((bucketStats.totalSize / (10 * 1024 * 1024 * 1024)) * 100, 100)}%`
                      : '0%',
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-blue-900 dark:text-blue-400">
                {formatSize(bucketStats.totalSize)} of 10GB used
              </p>
            </div>
          )}
        </div>

        {/* File Browser */}
        <div className="space-y-4 lg:col-span-3">
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative min-w-[200px] flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="folder">Folders</option>
              <option value="file">Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'size' | 'date')}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-green-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="size">Sort by Size</option>
              <option value="date">Sort by Date</option>
            </select>

            {/* Bulk Actions */}
            {selectedFiles.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selectedFiles.size})
              </button>
            )}
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <button
              onClick={() => setPath([])}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              {selectedBucket || 'root'}
            </button>
            {path.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <ChevronRight className="h-4 w-4" />
                <button
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className="hover:text-slate-900 dark:hover:text-white"
                >
                  {p}
                </button>
              </div>
            ))}
            <button
              onClick={fetchFiles}
              className="ml-auto rounded p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Files Grid */}
          <div className="min-h-[500px] rounded-lg border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
            {loading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredAndSortedFiles.map((file) => (
                  <div
                    key={file.name}
                    className="group relative overflow-hidden rounded-lg border border-slate-200 bg-white transition-all hover:border-green-500 hover:shadow-lg dark:border-slate-700 dark:bg-slate-800"
                  >
                    {/* Checkbox */}
                    {file.metadata && (
                      <button
                        onClick={() => toggleFileSelection(file.name)}
                        className="absolute left-2 top-2 z-10 rounded bg-white p-1.5 opacity-0 shadow-md transition-opacity group-hover:opacity-100 dark:bg-slate-900"
                      >
                        {selectedFiles.has(file.name) ? (
                          <CheckSquare className="h-4 w-4 text-green-600" />
                        ) : (
                          <Square className="h-4 w-4 text-slate-400" />
                        )}
                      </button>
                    )}

                    {/* File Preview */}
                    <div
                      onClick={() => handleFileView(file)}
                      className="relative aspect-video cursor-pointer overflow-hidden bg-slate-50 dark:bg-slate-900"
                    >
                      {isImageFile(file) ? (
                        <Image
                          src={getFileUrl(file)}
                          alt={file.name}
                          fill
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          {getFileIcon(file)}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="p-4">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                        {file.name}
                      </p>
                      {file.metadata && (
                        <>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {formatSize(file.metadata.size)}
                          </p>
                          <p className="text-xs text-slate-400">{formatDate(file.updated_at)}</p>
                        </>
                      )}
                      {!file.metadata && (
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Folder</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {file.metadata && (
                      <div className="flex gap-2 border-t border-slate-100 p-3 opacity-0 transition-opacity group-hover:opacity-100 dark:border-slate-700">
                        <button
                          onClick={() => handleFileView(file)}
                          className="flex-1 rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
                          title="Preview"
                        >
                          <ExternalLink className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileDownload(file)}
                          className="flex-1 rounded bg-green-500 p-2 text-white hover:bg-green-600"
                          title="Download"
                        >
                          <Download className="mx-auto h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleFileDelete(file)}
                          className="flex-1 rounded bg-red-500 p-2 text-white hover:bg-red-600"
                          title="Delete"
                        >
                          <Trash2 className="mx-auto h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {filteredAndSortedFiles.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400">
                    <FolderOpen className="mb-4 h-12 w-12 opacity-20" />
                    <p className="text-sm font-medium">
                      {searchQuery || filterType !== 'all'
                        ? 'No files match your filters'
                        : 'No files found in this directory'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-lg bg-white dark:bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-700">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {previewFile.name}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {formatSize(previewFile.metadata?.size || 0)} •{' '}
                    {formatDate(previewFile.updated_at)}
                  </p>
                </div>
                <button
                  onClick={() => setPreviewFile(null)}
                  className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-[70vh] overflow-auto p-6">
                {previewFile.metadata?.mimetype.startsWith('image/') ? (
                  <div className="relative mx-auto aspect-square max-h-[60vh] w-auto">
                    <Image
                      src={getFileUrl(previewFile)}
                      alt={previewFile.name}
                      fill
                      className="rounded-lg object-contain"
                      unoptimized
                    />
                  </div>
                ) : previewFile.metadata?.mimetype.includes('pdf') ? (
                  <iframe
                    src={getFileUrl(previewFile)}
                    className="h-[60vh] w-full rounded-lg"
                    title={previewFile.name}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <File className="mb-4 h-16 w-16" />
                    <p>Preview not available for this file type</p>
                    <button
                      onClick={() => handleFileDownload(previewFile)}
                      className="mt-4 flex items-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
                    >
                      <Download className="h-5 w-5" />
                      Download File
                    </button>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-slate-200 p-4 dark:border-slate-700">
                <button
                  onClick={() => window.open(getFileUrl(previewFile), '_blank')}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </button>
                <button
                  onClick={() => handleFileDownload(previewFile)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2 font-medium text-white hover:bg-green-700"
                >
                  <Download className="h-4 w-4" />
                  Download
                </button>
                <button
                  onClick={() => {
                    handleFileDelete(previewFile);
                    setPreviewFile(null);
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
