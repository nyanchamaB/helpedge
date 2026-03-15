'use client';

import { useEffect } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useAuth } from '@/contexts/AuthContext';
import { EmailTicketForm } from './EmailTicketForm';

/**
 * Manual Email Ticket Creation Page
 * Authorization: Admin, ITManager, ServiceDeskAgent
 * Rendered via MainContentRenderer when navigating to /tickets/from-email
 */
export default function EmailTicketPage() {
  const { user, isLoading } = useAuth();
  const { navigateTo } = useNavigation();

  useEffect(() => {
    if (!isLoading && user) {
      const allowedRoles = ['Admin', 'ITManager', 'ServiceDeskAgent'];
      if (!allowedRoles.includes(user.role)) {
        navigateTo('/tickets');
      }
    }
  }, [user, isLoading, navigateTo]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const allowedRoles = ['Admin', 'ITManager', 'ServiceDeskAgent'];
  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create Ticket from Email</h1>
        <p className="mt-2 text-gray-600">
          Manually create a support ticket from email data. The system will automatically apply
          AI analysis to classify and suggest assignments.
        </p>
      </div>

      <EmailTicketForm
        defaultCreatorId={user.id}
        onSuccess={(ticketId) => {
          navigateTo(`/tickets/${ticketId}`);
        }}
        onCancel={() => {
          navigateTo('/tickets');
        }}
      />
    </div>
  );
}
