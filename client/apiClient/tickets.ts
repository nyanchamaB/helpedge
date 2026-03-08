import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Status enum
export enum TicketStatus {
  assigned = 0,
  unassigned = 1,
  resolved = 3,
  closed = 4,
}

export enum TicketPriority {
  low = 0,
  medium = 1,
  high = 2,
  urgent = 3,
}

// Ticket interface
export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  description: string;
  status: number;
  priority: number;
  categoryId: string;
  assignedToId: string;
  createdById: string;
  emailMassageId: string;
  emailSender: string;
  emailRecipients: string[];
  triageStatus?: string;
  isEscalated?: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}


// Fetch tickets
export const fetchTickets = async (): Promise<Ticket[]> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Fetch ticket by id
export const fetchTicketById = async (id: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Fetch by ticket number
export const fetchTicketByNumber = async (ticketNumber: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/number/${ticketNumber}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Fetch tickets by assigned user id
export const fetchTicketsByAssignedTo = async (userId: string): Promise<Ticket[]> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/assigned/${userId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Fetch tickets by creator id
export const fetchTicketsByCreator = async (userId: string): Promise<Ticket[]> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/created/${userId}`, {
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create ticket
export const createTicket = async (
  ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ticketNumber'>
): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(ticket),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create ticket with email
export const createTicketWithEmail = async (
  ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ticketNumber'>,
  emailContent: string
): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/from-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ ...ticket, emailContent }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Create ticket comment
export const createTicketComment = async (
  ticketId: string,
  comment: string,
  createdById: string
): Promise<void> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ comment, createdById }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};

// Update ticket
export const updateTicket = async (
  id: string,
  ticket: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ticketNumber'>>
): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(ticket),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Delete ticket
export const deleteTicket = async (id: string): Promise<void> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
};

// Update ticket assignment
export const updateTicketAssignment = async (
  id: string,
  assignedToId: string | null
): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/assign/${assignedToId}`, {
    method: 'PATCH', //check if its assigneeId or assignedToId
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ assignedToId }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Unassign ticket
export const unassignTicket = async (id: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/unassign`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Update ticket priority
export const updateTicketPriority = async (id: string, priority: number): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/priority`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ priority }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Resolve ticket
export const resolveTicket = async (id: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/resolve`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Reopen ticket
export const reopenTicket = async (id: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/reopen`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Close ticket
export const closeTicket = async (id: string): Promise<Ticket> => {
  const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}/close`, {
    method: 'PATCH',
    credentials: 'include',
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};
// Fetch all tickets
export const useTickets = () => {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets'],
    queryFn: fetchTickets,
  });
};

// Fetch ticket by id
export const useTicketById = (id: string) => {
  return useQuery<Ticket, Error>({
    queryKey: ['ticket', id],
    queryFn: () => fetchTicketById(id),
    enabled: !!id,
  });
};

// Fetch ticket by ticket number
export const useTicketByNumber = (ticketNumber: string) => {
  return useQuery<Ticket, Error>({
    queryKey: ['ticket-number', ticketNumber],
    queryFn: () => fetchTicketByNumber(ticketNumber),
    enabled: !!ticketNumber,
  });
};

// Fetch tickets by assigned user id
export const useTicketsByAssignedTo = (userId: string) => {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets-assigned', userId],
    queryFn: () => fetchTicketsByAssignedTo(userId),
    enabled: !!userId,
  });
};

// Fetch tickets by creator id
export const useTicketsByCreator = (userId: string) => {
  return useQuery<Ticket[], Error>({
    queryKey: ['tickets-created', userId],
    queryFn: () => fetchTicketsByCreator(userId),
    enabled: !!userId,
  });
};

// Create ticket mutation
export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Ticket,
    Error,
    Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ticketNumber'>
  >({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Update ticket mutation
export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Ticket,
    Error,
    {
      id: string;
      ticket: Partial<Omit<Ticket, 'id' | 'createdAt' | 'updatedAt' | 'resolvedAt' | 'ticketNumber'>>;
    }
  >({
    mutationFn: ({ id, ticket }) => updateTicket(id, ticket),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Delete ticket mutation
export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Update ticket assignment mutation
export const useUpdateTicketAssignment = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, { id: string; assignedToId: string | null }>({
    mutationFn: ({ id, assignedToId }) => updateTicketAssignment(id, assignedToId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Unassign ticket mutation
export const useUnassignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, string>({
    mutationFn: unassignTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Resolve ticket mutation
export const useResolveTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, string>({
    mutationFn: resolveTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Reopen ticket mutation
export const useReopenTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, string>({
    mutationFn: reopenTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Close ticket mutation
export const useCloseTicket = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, string>({
    mutationFn: closeTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Update ticket priority mutation
export const useUpdateTicketPriority = () => {
  const queryClient = useQueryClient();
  return useMutation<Ticket, Error, { id: string; priority: number }>({
    mutationFn: ({ id, priority }) => updateTicketPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};

// Create ticket comment mutation
export const useCreateTicketComment = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { ticketId: string; comment: string; createdById: string }>({
    mutationFn: ({ ticketId, comment, createdById }) =>
      createTicketComment(ticketId, comment, createdById),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
};