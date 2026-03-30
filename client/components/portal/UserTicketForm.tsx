'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FileUploader } from './FileUploader';
import { TicketPriority } from '@/lib/api/tickets';
import { Category } from '@/lib/api/categories';
import { Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

const UserTicketSchema = z.object({
  subject: z
    .string()
    .min(5, 'Subject must be at least 5 characters')
    .max(200, 'Subject is too long'),
  description: z
    .string()
    .min(20, 'Please describe your issue in more detail (at least 20 characters)')
    .max(5000, 'Description is too long'),
  categoryId: z.string().optional(),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  contactEmail: z.string().email('Enter a valid email address').optional().or(z.literal('')),
});

type UserTicketFormValues = z.infer<typeof UserTicketSchema>;

export interface UserTicketSubmitData {
  subject: string;
  description: string;
  categoryId?: string;
  priority: TicketPriority;
  contactEmail?: string;
  attachments: File[];
}

interface UserTicketFormProps {
  categories: Category[];
  onSubmit: (data: UserTicketSubmitData) => Promise<void>;
  isSubmitting?: boolean;
}

const priorityMap: Record<string, TicketPriority> = {
  Low: TicketPriority.Low,
  Medium: TicketPriority.Medium,
  High: TicketPriority.High,
  Critical: TicketPriority.Critical,
};

export function UserTicketForm({
  categories,
  onSubmit,
  isSubmitting = false,
}: UserTicketFormProps) {
  const [attachments, setAttachments] = useState<File[]>([]);

  const form = useForm<UserTicketFormValues>({
    resolver: zodResolver(UserTicketSchema),
    defaultValues: {
      subject: '',
      description: '',
      categoryId: undefined,
      priority: 'Medium',
      contactEmail: '',
    },
  });

  const handleSubmit = async (values: UserTicketFormValues) => {
    await onSubmit({
      subject: values.subject,
      description: values.description,
      categoryId: values.categoryId || undefined,
      priority: priorityMap[values.priority],
      contactEmail: values.contactEmail || undefined,
      attachments,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit a Support Ticket</CardTitle>
        <CardDescription>
          Describe your issue and our team will get back to you as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            {/* Subject */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Subject <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. "VPN not connecting on Windows 11"' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Description <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the issue in detail. Include what you were doing, any error messages you saw, and the steps to reproduce the problem."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Low">Low — General inquiry</SelectItem>
                        <SelectItem value="Medium">Medium — Minor disruption</SelectItem>
                        <SelectItem value="High">High — Significant impact</SelectItem>
                        <SelectItem value="Critical">Critical — System down</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Leave blank to use your account email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Email replies will be sent here. Defaults to your account email.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Attachments */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Attachments</p>
              <FileUploader
                onFilesChange={setAttachments}
                maxFiles={5}
                maxSizeMB={10}
                disabled={isSubmitting}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
