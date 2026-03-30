import { z } from 'zod';

export const TicketSchema = z.object({
  title: z.string().min(1, { message: 'Title is required' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  category: z.string().min(1, { message: 'Category is required' }),
  priority: z.string().min(1, { message: 'Priority is required' }),
  assignedTo: z.string().min(1, { message: 'Assigned to is required' }),
  department: z.string().min(1, { message: 'Department is required' }),
  source: z.string().min(1, { message: 'Source is required' }),
  required_error: z.string().min(1, { message: 'Required error is required' }),
});

export type Ticket = z.infer<typeof TicketSchema>;
export const defaultValues: Ticket = {
  title: '',
  subject: '',
  description: '',
  category: '',
  priority: '',
  assignedTo: '',
  department: '',
  source: '',
  required_error: '',
};
