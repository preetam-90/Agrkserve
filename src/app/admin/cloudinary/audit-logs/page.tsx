import { Metadata } from 'next';
import AuditLogsClient from './AuditLogsClient';

export const metadata: Metadata = {
  title: 'Audit Logs - Admin',
  robots: { index: false, follow: false },
};

export default function AuditLogsPage() {
  return <AuditLogsClient />;
}
