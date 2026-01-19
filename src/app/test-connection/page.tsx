'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

export default function TestConnectionPage() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();
        
        // Try to get the current session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setStatus('error');
          setError(error.message);
        } else {
          setStatus('connected');
        }
      } catch (err: any) {
        setStatus('error');
        setError(err.message || 'Unknown error occurred');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center">
            {status === 'checking' && (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                <p className="text-gray-600">Checking connection...</p>
              </div>
            )}
            
            {status === 'connected' && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle className="h-12 w-12 text-green-600" />
                <p className="text-green-600 font-semibold">Connected Successfully!</p>
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg w-full">
                  <p className="text-sm text-green-800 text-center">
                    Supabase is properly configured and connected.
                  </p>
                </div>
              </div>
            )}
            
            {status === 'error' && (
              <div className="flex flex-col items-center gap-2">
                <XCircle className="h-12 w-12 text-red-600" />
                <p className="text-red-600 font-semibold">Connection Failed</p>
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg w-full">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {error}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">Environment Variables:</h3>
            <div className="space-y-1 text-sm">
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_URL ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_URL</span>
              </div>
              <div className="flex items-center gap-2">
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
                <span className="text-gray-600">NEXT_PUBLIC_SUPABASE_ANON_KEY</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
