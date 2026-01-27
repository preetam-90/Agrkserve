import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/utils/admin-auth';
import AdminLayoutClient from '@/components/admin/AdminLayoutClient';

export const metadata = {
    title: 'Admin Panel - AgriServe',
    description: 'Admin dashboard for AgriServe platform management',
};

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if user is admin
    const adminUser = await getAdminUser();

    if (!adminUser) {
        redirect('/login?redirect=/admin');
    }

    return <AdminLayoutClient user={adminUser}>{children}</AdminLayoutClient>;
}
