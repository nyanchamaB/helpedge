import { z } from 'zod';

export const EmailTicketSchema = z.object({
  subject: z.string().min(1, { message: 'Subject is required' }),
  description: z.string().min(1, { message: 'Description is required' }),
  createdById: z.string().min(1, { message: 'Creator ID is required' }),
  emailMessageId: z.string().min(1, { message: 'Email Message ID is required' }),
  emailSender: z.string().email({ message: 'Invalid email sender address' }),
  // emailRecipients is managed separately in the form component
  emailRecipients: z.array(z.string()).optional(),
  priority: z.number().optional(),
  categoryId: z.string().optional(),
});

export type EmailTicketFormData = z.infer<typeof EmailTicketSchema>;

export const emailTicketDefaultValues: EmailTicketFormData = {
  subject: '',
  description: '',
  createdById: '',
  emailMessageId: '',
  emailSender: '',
  emailRecipients: [],
  priority: undefined,
  categoryId: undefined,
};
