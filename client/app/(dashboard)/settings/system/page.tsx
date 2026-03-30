'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function SettingsPage() {
  const router = useRouter();
  const [status, setStatus] = useState('loading'); // "loading" | "success" | "error" state

  useEffect(() => {
    async function redirect() {
      try {
        await router.push('/settings/profile');
        setStatus('success');
      } catch (err) {
        console.error('Redirect failed:', err);
        setStatus('error');
      }
    }

    void redirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      {status === 'loading' && (
        <p className="text-gray-500 text-lg">Redirecting to Profile Settings...</p>
      )}
      {status === 'success' && (
        <p className="text-green-600 text-lg">
          Redirect successful! Taking you to Profile Settings...
        </p>
      )}
      {status === 'error' && (
        <p className="text-red-600 text-lg">Redirect failed. Please try again.</p>
      )}
    </div>
  );
}
