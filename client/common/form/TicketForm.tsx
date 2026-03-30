'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { TicketSchema, Ticket } from './TicketSchema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
//import { Label } from "@/components/ui/label";
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
//import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
//import { toast } from "react-hot-toast";
import { useRouter } from 'next/navigation';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface TicketFormProps {
  defaultValues?: Ticket;
  onSubmit?: (data: Ticket) => void;
  onCancel?: () => void;
  className?: string;
  isEditing?: boolean;
  isDisabled?: boolean;
  isLoading?: boolean;
}

export function TicketForm({
  defaultValues,
  onSubmit,
  onCancel,
  className,
  isEditing,
  isDisabled: _isDisabled,
  isLoading,
}: TicketFormProps) {
  const _router = useRouter();
  const form = useForm<Ticket>({
    resolver: zodResolver(TicketSchema),
    defaultValues,
  });

  const { isSubmitting, isValid } = form.formState;

  const [_category, setCategory] = useState(defaultValues?.category || '');
  const [_priority, setPriority] = useState(defaultValues?.priority || '');
  const [_assignedTo, setAssignedTo] = useState(defaultValues?.assignedTo || '');
  const [_department, setDepartment] = useState(defaultValues?.department || '');
  const [_source, setSource] = useState(defaultValues?.source || '');

  const _handleCategoryChange = (value: string) => {
    setCategory(value);
    form.setValue('category', value);
  };

  const _handlePriorityChange = (value: string) => {
    setPriority(value);
    form.setValue('priority', value);
  };

  const _handleAssignedToChange = (value: string) => {
    setAssignedTo(value);
    form.setValue('assignedTo', value);
  };

  const _handleDepartmentChange = (value: string) => {
    setDepartment(value);
    form.setValue('department', value);
  };

  const _handleSourceChange = (value: string) => {
    setSource(value);
    form.setValue('source', value);
  };

  const handleSubmit = (data: Ticket) => {
    if (onSubmit) {
      onSubmit(data);
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting || isLoading}>
              {isEditing ? 'Update' : 'Submit'}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
