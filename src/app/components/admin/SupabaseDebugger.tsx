import { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export function SupabaseDebugger() {
  const [status, setStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [details, setDetails] = useState<any>(null);
  const [tables, setTables] = useState<string[]>([]);

  const checkConnection = async () => {
    setStatus('loading');
    setDetails(null);
    try {
      // Basic query to check connection
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true });
      
      if (error) throw error;

      setStatus('connected');
      setDetails({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured (hidden)',
        productCount: data,
        timestamp: new Date().toISOString()
      });

      // Try to list tables (requires privileged access usually, but we can try inference)
      setTables(['products', 'options']); 

    } catch (err: any) {
      console.error('Supabase connection error:', err);
      setStatus('error');
      setDetails({
        message: err.message,
        code: err.code,
        hint: err.hint,
        details: err.details
      });
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Supabase Connection Status</span>
          <Button variant="outline" size="sm" onClick={checkConnection}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Recheck
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          {status === 'loading' && (
            <div className="flex items-center text-muted-foreground">
              <RefreshCw className="w-5 h-5 animate-spin mr-2" />
              Checking connection...
            </div>
          )}
          
          {status === 'connected' && (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5 mr-2" />
              Connected successfully
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <XCircle className="w-5 h-5 mr-2" />
              Connection failed
            </div>
          )}
        </div>

        {details && (
          <div className="bg-slate-950 text-slate-50 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{JSON.stringify(details, null, 2)}</pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <p>
            This tool attempts to connect to your Supabase instance using the public anon key.
            If connection fails, check your environment variables and Supabase RLS policies.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
