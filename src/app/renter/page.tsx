import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Renter Portal | AgriServe',
  description: 'Access your renter dashboard, bookings, and more.',
};

export default function RenterPortalPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">
          Renter Portal
        </h1>
        
        <div className="grid md:grid-cols-3 gap-6">
          <Link 
            href="/renter/dashboard"
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
            <p className="text-slate-600 dark:text-slate-400">View your rental overview</p>
          </Link>
          
          <Link 
            href="/renter/bookings"
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">My Bookings</h2>
            <p className="text-slate-600 dark:text-slate-400">Manage your equipment rentals</p>
          </Link>
          
          <Link 
            href="/renter/favorites"
            className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2">Favorites</h2>
            <p className="text-slate-600 dark:text-slate-400">Your saved equipment</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
