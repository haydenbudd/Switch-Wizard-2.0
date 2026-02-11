import { useState, useEffect } from 'react';
import { supabase, getCurrentSession, signOut } from '@/app/lib/supabase';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { Toaster } from 'sonner';

export function AdminContainer() {
  const [session, setSession] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const currentSession = await getCurrentSession();
        setSession(currentSession);
      } catch (error) {
        console.error('Session check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {session ? (
        <AdminDashboard onSignOut={() => signOut()} />
      ) : (
        <AdminLogin />
      )}
    </>
  );
}
