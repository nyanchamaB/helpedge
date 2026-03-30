'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@/contexts/NavigationContext';
import { EmailTicketSchema, type EmailTicketFormData } from '@/common/form/EmailTicketSchema';
import { useCreateTicketFromEmail } from '@/hooks/useTickets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EmailTicketFormProps {
  defaultCreatorId?: string;
  onSuccess?: (ticketId: string) => void;
  onCancel?: () => void;
}
interface TicketPayload {
  subject: string;
  description: string;
  createdById: string;
  emailMessageId: string;
  emailSender: string;
  emailRecipients: string[];
  priority?: number;
  categoryId?: string;
}

export function EmailTicketForm({ defaultCreatorId, onSuccess, onCancel }: EmailTicketFormProps) {
  const { navigateTo } = useNavigation();
  const [recipients, setRecipients] = useState<string>('');
  const [validationError, setValidationError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const createTicketMutation = useCreateTicketFromEmail();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue: _setValue,
  } = useForm<EmailTicketFormData>({
    resolver: zodResolver(EmailTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      createdById: defaultCreatorId || '',
      emailMessageId: '',
      emailSender: '',
      emailRecipients: [],
    },
  });

  const onSubmit = async (data: EmailTicketFormData) => {
    console.warn('Form submit triggered', data);
    setValidationError('');

    const recipientsArray = recipients
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email.length > 0);

    console.warn('Recipients array:', recipientsArray);

    if (recipientsArray.length === 0) {
      console.warn('Validation failed: No recipients');
      setValidationError('At least one recipient email is required');

      return;
    }
    // Build payload with only defined fields
    const payload: TicketPayload = {
      subject: data.subject.trim(),
      description: data.description.trim(),
      createdById: data.createdById.trim(),
      emailMessageId: data.emailMessageId.trim(),
      emailSender: data.emailSender.trim(),
      emailRecipients: recipientsArray,
    };

    // Add optional fields if provided
    if (data.priority !== undefined) {
      payload.priority = data.priority;
    }
    if (data.categoryId) {
      payload.categoryId = data.categoryId.trim();
    }

    try {
      console.warn('Submitting email ticket payload:', JSON.stringify(payload, null, 2));
      setSuccessMessage('');
      const result = await createTicketMutation.mutateAsync(payload);

      console.warn('Mutation result:', result);

      if (result.success && result.data) {
        console.warn('Ticket created successfully:', result.data);
        setSuccessMessage(`Ticket ${result.data.ticketNumber} created successfully!`);
        reset();
        setRecipients('');

        // Delay navigation slightly to show success message
        setTimeout(() => {
          if (onSuccess) {
            onSuccess(result.data!.id);
          } else {
            // Use hash-based SPA navigation
            navigateTo(`/tickets/${result.data!.id}`);
          }
        }, 1500);
      } else {
        console.error('Ticket creation failed:', result.error);
        setValidationError(result.error || 'Failed to create ticket');
      }
    } catch (error) {
      console.error('Failed to create ticket from email:', error);
      setValidationError(error instanceof Error ? error.message : 'An unexpected error occurred');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Ticket from Email</CardTitle>
        <CardDescription>
          Manually create a support ticket from email data. AI analysis will be automatically
          applied.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              {...register('subject')}
              placeholder="Enter email subject"
              error={errors.subject?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Enter email body/description"
              className="min-h-32"
            />
            {errors.description && (
              <p className="text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailMessageId">Email Message ID *</Label>
            <Input
              id="emailMessageId"
              {...register('emailMessageId')}
              placeholder="e.g., test-msg-001@helpedge.com"
              error={errors.emailMessageId?.message}
            />
            <p className="text-xs text-muted-foreground">Unique identifier for the email message</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSender">Email Sender *</Label>
            <Input
              id="emailSender"
              type="email"
              {...register('emailSender')}
              placeholder="sender@example.com"
              error={errors.emailSender?.message}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailRecipients">Email Recipients *</Label>
            <Input
              id="emailRecipients"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="recipient1@example.com, recipient2@example.com"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated list of recipient email addresses
            </p>
            {validationError && validationError.includes('recipient') && (
              <p className="text-sm text-red-600">{validationError}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="createdById">Creator ID *</Label>
            <Input
              id="createdById"
              {...register('createdById')}
              placeholder="User ID of the ticket creator"
              error={errors.createdById?.message}
            />
            <p className="text-xs text-muted-foreground">ID of the user creating this ticket</p>
          </div>

          {successMessage && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-800">Success!</p>
              <p className="text-sm text-green-700">{successMessage}</p>
            </div>
          )}

          {(createTicketMutation.isError || validationError) && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-semibold text-red-800 mb-2">Error Creating Ticket</p>
              <p className="text-sm text-red-700">
                {validationError || 'Failed to create ticket. Please try again.'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isSubmitting || createTicketMutation.isPending}>
              {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
