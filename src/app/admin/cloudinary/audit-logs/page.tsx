'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import DataTable from '@/components/admin/DataTable';
import { format } from 'date-fns';
import { ITEMS_PER_PAGE } from '@/lib/utils/admin-constants';
import { FileText, Clock, User as UserIcon, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CloudinaryAuditLogsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPublicId = searchParams.get('publicId') || '';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [publicId, setPublicId] = useState(initialPublicId);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState<number>(initialPage || 1);
  const limit = 10; // keep small to match table UI
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // keep URL in sync
    const params = new URLSearchParams();
    if (publicId) params.set('publicId', publicId);
    if (page) params.set('page', String(page));
    router.replace(`/admin/cloudinary/audit-logs?${params.toString()}`);
  }, [publicId, page, router]);

  useEffect(() => {
    let mounted = true;

    async function fetchLogs() {
      if (!publicId) {
        setLogs([]);
        setTotal(0);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set('publicId', publicId);
        params.set('page', String(page));
        params.set('limit', String(limit));

        const res = await fetch(`/api/admin/cloudinary/audit-logs?${params.toString()}`);
        if (!mounted) return;

        // Try to parse JSON but also capture raw text for better diagnostics when
        // the response is non-JSON (HTML error pages, empty bodies, proxies, etc.)
        let json: any = null;
        let textBody: string | null = null;
        try {
          json = await res.clone().json();
        } catch (parseErr) {
          // If parsing failed, try to read raw text for debugging
          try {
            textBody = await res.clone().text();
          } catch (textErr) {
            console.error('Failed to read audit logs response body as text', textErr);
          }
          console.error('Failed to parse audit logs response as JSON', parseErr);
        }

        if (res.status === 401 || res.status === 403) {
          // Permission issue
          toast.error('You do not have permission to view audit logs');
          setLogs([]);
          setTotal(0);
          return;
        }

        if (!res.ok) {
          const errMsg =
            (json && (json.error || json.message)) ||
            textBody ||
            `Failed to fetch audit logs (${res.status}${res.statusText ? ` ${res.statusText}` : ''})`;

          // Log more context so we can diagnose server-side issues (raw text, parsed JSON, status)
          console.error('Audit logs API error:', errMsg, {
            status: res.status,
            statusText: res.statusText,
            json,
            textBody,
          });

          toast.error(errMsg);
          setLogs([]);
          setTotal(0);
          return;
        }

        if (json && !json.success) {
          const errMsg = json.error || 'Failed to fetch audit logs';
          console.error('Audit logs returned success=false:', errMsg, json);
          toast.error(errMsg);
          setLogs([]);
          setTotal(0);
          return;
        }

        // Success
        setLogs((json && json.data && json.data.logs) || []);
        setTotal(Number((json && json.data && json.data.total) || 0));
      } catch (err: any) {
        console.error('Failed to load audit logs', err);
        toast.error(err?.message || 'Failed to load audit logs');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchLogs();

    return () => {
      mounted = false;
    };
  }, [publicId, page]);

  const columns = [
    {
      key: 'action',
      label: 'Action',
      render: (log: any) => (
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-[#0f0f0f] p-2">
            <FileText className="h-4 w-4 text-neutral-300" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{log.action}</p>
            <p className="text-xs text-neutral-500">{log.assetType}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'admin',
      label: 'Initiator',
      render: (log: any) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1a1a1a] text-xs text-neutral-400">
            {log.adminEmail
              ? log.adminEmail.charAt(0).toUpperCase()
              : log.adminId?.charAt(0) || 'S'}
          </div>
          <div>
            <p className="text-sm text-white">{log.adminEmail || log.adminId}</p>
            <p className="text-xs text-neutral-500">{log.adminRole}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'details',
      label: 'Details',
      render: (log: any) => (
        <div className="max-w-xs overflow-hidden">
          <p className="truncate rounded border border-[#262626] bg-[#0b0b0b] p-1.5 font-mono text-xs text-neutral-400">
            {JSON.stringify(log.details || {})}
          </p>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (log: any) => (
        <div className="flex items-center gap-2 text-neutral-400">
          <Clock className="h-4 w-4" />
          <span className="text-sm">{format(new Date(log.createdAt), 'PPpp')}</span>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Cloudinary — Audit History</h1>
          <p className="text-sm text-neutral-400">Showing audit history for media assets</p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/media/cloudinary"
            className="rounded-lg border border-[#262626] bg-[#1a1a1a] px-3 py-2 text-sm text-neutral-300 hover:bg-white/5"
          >
            Back to Media
          </a>
        </div>
      </div>

      {!publicId ? (
        <div className="rounded-xl border border-[#262626] bg-[#0f0f0f] p-6">
          <p className="text-sm text-neutral-400">
            No asset specified. Open an asset and click "View audit history".
          </p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          isLoading={loading}
          pagination={{
            currentPage: page,
            totalPages: Math.max(1, Math.ceil(total / limit)),
            onPageChange: setPage,
            totalItems: total,
          }}
        />
      )}
    </div>
  );
}
