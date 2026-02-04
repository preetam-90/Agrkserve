'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PaymentsDebugPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  const runChecks = async () => {
    setLoading(true);
    const checks: any = {};

    try {
      // Check 1: Count payments
      const { count: paymentsCount, error: paymentsError } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true });
      
      checks.paymentsCount = paymentsCount;
      checks.paymentsError = paymentsError?.message;

      // Check 2: Count bookings
      const { count: bookingsCount, error: bookingsError } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });
      
      checks.bookingsCount = bookingsCount;
      checks.bookingsError = bookingsError?.message;

      // Check 3: Count equipment
      const { count: equipmentCount, error: equipmentError } = await supabase
        .from('equipment')
        .select('*', { count: 'exact', head: true });
      
      checks.equipmentCount = equipmentCount;
      checks.equipmentError = equipmentError?.message;

      // Check 4: Get current user info
      const { data: { user } } = await supabase.auth.getUser();
      checks.currentUser = user?.email;
      checks.currentUserId = user?.id;

      // Check 5: Get user roles
      if (user) {
        const { data: roles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id);
        
        checks.userRoles = roles;
        checks.rolesError = rolesError?.message;
      }

      // Check 6: Try to fetch payments
      const { data: payments, error: fetchError } = await supabase
        .from('payments')
        .select('*')
        .limit(5);
      
      checks.samplePayments = payments;
      checks.fetchError = fetchError?.message;

      // Check 7: Try to fetch with joins
      const { data: paymentsWithJoins, error: joinError } = await supabase
        .from('payments')
        .select(`
          *,
          booking:bookings(
            *,
            equipment:equipment(name),
            renter:user_profiles!renter_id(name, email)
          )
        `)
        .limit(5);
      
      checks.paymentsWithJoins = paymentsWithJoins;
      checks.joinError = joinError?.message;

      setResults(checks);
    } catch (error: any) {
      checks.generalError = error.message;
      setResults(checks);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Payments Debug Page</h1>
      
      <button
        onClick={runChecks}
        disabled={loading}
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50 mb-6"
      >
        {loading ? 'Running Checks...' : 'Run Database Checks'}
      </button>

      {results && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Database Counts</h2>
            <div className="space-y-2 text-slate-300">
              <p>💳 Payments: <span className="font-bold text-emerald-400">{results.paymentsCount ?? 'Error'}</span></p>
              <p>📅 Bookings: <span className="font-bold text-blue-400">{results.bookingsCount ?? 'Error'}</span></p>
              <p>🚜 Equipment: <span className="font-bold text-amber-400">{results.equipmentCount ?? 'Error'}</span></p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Current User</h2>
            <div className="space-y-2 text-slate-300">
              <p>Email: <span className="font-mono text-emerald-400">{results.currentUser}</span></p>
              <p>User ID: <span className="font-mono text-xs text-slate-400">{results.currentUserId}</span></p>
              <p>Roles: <span className="font-bold text-violet-400">
                {results.userRoles?.map((r: any) => `${r.role} (${r.is_active ? 'active' : 'inactive'})`).join(', ') || 'None'}
              </span></p>
            </div>
          </div>

          {results.samplePayments && results.samplePayments.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Sample Payments (Simple Query)</h2>
              <pre className="bg-slate-950 p-4 rounded text-xs overflow-auto text-slate-300">
                {JSON.stringify(results.samplePayments, null, 2)}
              </pre>
            </div>
          )}

          {results.paymentsWithJoins && results.paymentsWithJoins.length > 0 && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-white">Sample Payments (With Joins)</h2>
              <pre className="bg-slate-950 p-4 rounded text-xs overflow-auto text-slate-300">
                {JSON.stringify(results.paymentsWithJoins, null, 2)}
              </pre>
            </div>
          )}

          {(results.paymentsError || results.fetchError || results.joinError || results.generalError) && (
            <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-red-400">Errors</h2>
              <div className="space-y-2 text-red-300 text-sm">
                {results.paymentsError && <p>Payments Count Error: {results.paymentsError}</p>}
                {results.fetchError && <p>Fetch Error: {results.fetchError}</p>}
                {results.joinError && <p>Join Error: {results.joinError}</p>}
                {results.generalError && <p>General Error: {results.generalError}</p>}
              </div>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-white">Full Results</h2>
            <pre className="bg-slate-950 p-4 rounded text-xs overflow-auto text-slate-300">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
