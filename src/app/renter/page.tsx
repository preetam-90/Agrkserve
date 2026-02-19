import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Renter Portal | AgriServe',
  description: 'Access your renter dashboard, bookings, and more.',
};

export default function RenterPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-4xl font-bold text-slate-900 dark:text-white">Renter Portal</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            href="/renter/dashboard"
            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
          >
            <h2 className="mb-2 text-xl font-semibold">Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">View your rental overview</p>
          </Link>

          <Link
            href="/renter/bookings"
            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
          >
            <h2 className="mb-2 text-xl font-semibold">My Bookings</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage your equipment rentals</p>
          </Link>

          <Link
            href="/renter/favorites"
            className="rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-800"
          >
            <h2 className="mb-2 text-xl font-semibold">Favorites</h2>
            <p className="text-slate-600 dark:text-slate-400">Your saved equipment</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
