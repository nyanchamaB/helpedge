import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long')
    .min(1, 'Password is required'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .min(1, 'Name is required'),
  email: z
    .string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long'),
  role: z
    .enum(['admin', 'agent', 'user'])
    .default('user'),
});

export const ticketSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters long')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters long')
    .max(5000, 'Description cannot exceed 5000 characters'),
  priority: z
    .enum(['low', 'medium', 'high', 'urgent'])
    .default('medium'),
  category: z
    .string()
    .min(1, 'Category is required'),
  customerEmail: z
    .string()
    .email('Please enter a valid email address'),
  customerName: z
    .string()
    .max(100, 'Customer name cannot exceed 100 characters')
    .optional(),
  source: z
    .enum(['email', 'web', 'phone', 'chat'])
    .default('web'),
  tags: z
    .array(z.string())
    .default([]),
});

export const categorySchema = z.object({
  name: z
    .string()
    .min(2, 'Category name must be at least 2 characters long')
    .max(100, 'Category name cannot exceed 100 characters'),
  description: z
    .string()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please provide a valid hex color code')
    .default('#6B7280'),
  parentCategory: z
    .string()
    .optional(),
});

export const updateTicketStatusSchema = z.object({
  status: z.enum(['open', 'in-progress', 'resolved', 'closed']),
});

export const assignTicketSchema = z.object({
  assignedTo: z.string().min(1, 'Agent ID is required'),
});

export const addCommentSchema = z.object({
  content: z
    .string()
    .min(1, 'Comment content is required')
    .max(2000, 'Comment cannot exceed 2000 characters'),
  isInternal: z
    .boolean()
    .default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type TicketInput = z.infer<typeof ticketSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type AssignTicketInput = z.infer<typeof assignTicketSchema>;
export type AddCommentInput = z.infer<typeof addCommentSchema>;