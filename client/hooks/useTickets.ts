/**
 * Custom hooks for ticket operations using React Query
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTicketFromEmail, CreateTicketFromEmailRequest, Ticket } from '@/lib/api/tickets';
import type { ApiResponse } from '@/lib/api/client';

/**
 * Hook for creating a ticket from email
 * Authorization: Admin, ITManager, ServiceDeskAgent
 * Automatically invalidates tickets queries on success
 */
export function useCreateTicketFromEmail() {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<Ticket>, Error, CreateTicketFromEmailRequest>({
    mutationFn: createTicketFromEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      queryClient.invalidateQueries({ queryKey: ['tickets-pending-triage'] });
    },
  });
}
