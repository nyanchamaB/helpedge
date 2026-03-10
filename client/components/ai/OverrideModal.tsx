"use client";

import { useState, useEffect, type FC } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConfidenceBadge } from './ConfidenceBadge';
import { Info, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { overrideTicketClassification } from '@/lib/api/ai';
import type { TicketAIDetails } from '@/lib/types/ai';

const overrideSchema = z.object({
  correctCategory: z.string().min(1, 'Please select a category'),
  correctPriority: z.string().optional(),
  correctAssignee: z.string().optional(),
  reason: z
    .string()
    .min(10, 'Reason must be at least 10 characters')
    .max(500, 'Reason must be 500 characters or less'),
});

type OverrideFormData = z.infer<typeof overrideSchema>;

interface OverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ticketId: string;
  aiDetails: TicketAIDetails;
  availableCategories: { id: string; name: string }[];
  availablePriorities?: string[];
  availableAssignees?: { id: string; name: string }[];
}

const DEFAULT_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

/**
 * Modal for overriding AI classification with correct values
 * Provides side-by-side comparison and feedback submission
 */
export const OverrideModal: FC<OverrideModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  ticketId,
  aiDetails,
  availableCategories,
  availablePriorities = DEFAULT_PRIORITIES,
  availableAssignees = [],
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<OverrideFormData>({
    resolver: zodResolver(overrideSchema),
    defaultValues: {
      correctCategory: undefined,
      correctPriority: aiDetails.finalPriority || undefined,
      correctAssignee: undefined,
      reason: '',
    },
  });

  // Re-initialize form with resolved names whenever modal opens or lookup arrays load
  useEffect(() => {
    if (!isOpen) return;
    const category = availableCategories.find(
      (c) => c.id === aiDetails.finalCategory || c.name === aiDetails.finalCategory
    )?.name;
    const assignee = availableAssignees.find(
      (a) => a.id === aiDetails.finalAssignee || a.name === aiDetails.finalAssignee
    )?.name;
    form.reset({
      correctCategory: category || undefined,
      correctPriority: aiDetails.finalPriority || undefined,
      correctAssignee: assignee || undefined,
      reason: '',
    });
  }, [isOpen, availableCategories, availableAssignees]);

  const handleSubmit = async (data: OverrideFormData) => {
    setIsSubmitting(true);
    try {
      const response = await overrideTicketClassification(ticketId, {
        category: data.correctCategory,
        priority: data.correctPriority,
        assignee: data.correctAssignee,
        reason: data.reason,
      });

      if (response.success) {
        toast.success('Classification corrected. Thank you for your feedback!', {
          description: 'This feedback will improve future classifications.',
        });
        onSuccess?.();
        onClose();
        form.reset();
      } else {
        toast.error('Failed to override classification', {
          description: response.error || 'Please try again.',
        });
      }
    } catch (error) {
      toast.error('Failed to override classification', {
        description: 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    form.reset();
    onClose();
  };

  // Resolve IDs to display names using the provided lookup arrays
  const resolveCategoryName = (idOrName: string | null | undefined) => {
    if (!idOrName) return 'None';
    return availableCategories.find((c) => c.id === idOrName || c.name === idOrName)?.name ?? idOrName;
  };

  const resolveAssigneeName = (idOrName: string | null | undefined) => {
    if (!idOrName) return 'None';
    return availableAssignees.find((a) => a.id === idOrName || a.name === idOrName)?.name ?? idOrName;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Override AI Classification</DialogTitle>
          <DialogDescription>
            Correct the AI's classification with the accurate values. Your feedback helps
            improve future predictions.
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The AI classified this ticket with{' '}
            <ConfidenceBadge
              confidence={aiDetails.finalConfidence || 0}
              method={aiDetails.method}
              needsReview={aiDetails.needsReview}
              size="sm"
              className="mx-1"
            />
            confidence.
          </AlertDescription>
        </Alert>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Category Override */}
            <div className="space-y-4">
              <h4 className="font-medium">Category</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">AI Suggested</p>
                  <p className="text-sm font-medium">
                    {resolveCategoryName(aiDetails.finalCategory)}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="correctCategory"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Correction</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCategories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Priority Override */}
            <div className="space-y-4">
              <h4 className="font-medium">Priority</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3 space-y-2">
                  <p className="text-xs text-muted-foreground">AI Suggested</p>
                  <p className="text-sm font-medium">
                    {aiDetails.finalPriority || 'None'}
                  </p>
                </div>
                <div className="flex items-center justify-center">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="col-span-2">
                  <FormField
                    control={form.control}
                    name="correctPriority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Correction</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select correct priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availablePriorities.map((priority) => (
                              <SelectItem key={priority} value={priority}>
                                {priority}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {availableAssignees.length > 0 && (
              <>
                <Separator />

                {/* Assignee Override */}
                <div className="space-y-4">
                  <h4 className="font-medium">Assignee</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3 space-y-2">
                      <p className="text-xs text-muted-foreground">AI Suggested</p>
                      <p className="text-sm font-medium">
                        {resolveAssigneeName(aiDetails.finalAssignee)}
                      </p>
                    </div>
                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="correctAssignee"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Correction</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select correct assignee" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {availableAssignees.map((assignee) => (
                                  <SelectItem key={assignee.id} value={assignee.name}>
                                    {assignee.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Reason */}
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Why is this correction necessary? (min. 10 characters)"
                      className="min-h-[100px] resize-none"
                      maxLength={500}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/500 · minimum 10 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Correction'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
