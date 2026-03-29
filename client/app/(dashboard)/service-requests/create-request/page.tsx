'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@/contexts/NavigationContext';
import { useCreateServiceRequest } from '@/hooks/service-requests/useServiceRequestMutations';
import { useSubmitServiceRequest } from '@/hooks/service-requests/useServiceRequestMutations';
import { useActiveCategories } from '@/hooks/service-request-category/useCategories';
import {
  CreateServiceRequestDto,
  ServiceRequestType,
  ServiceRequestPriority,
  SERVICE_REQUEST_TYPES,
  SERVICE_REQUEST_PRIORITIES,
  getSRTypeLabel,
} from '@/lib/api/service-request';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ClipboardList,
  Send,
  Save,
  Plus,
  X,
  ChevronDown,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

// ─── Enum Reference ───────────────────────────────────────────────────────────

const ENUM_ROWS = [
  {
    name: 'requestType',
    values: 'Access, Equipment, Software, DataChange, Workspace, Account, PermissionChange',
    note: '',
  },
  {
    name: 'priority',
    values: 'Critical, High, Normal, Low',
    note: '',
  },
  {
    name: 'approverType',
    values:
      'SpecificUser, Role, RequestersManager, DepartmentHead, CostCenterOwner, SecurityTeam, ITManagement',
    note: '(used in Approval Workflows)',
  },
  {
    name: 'status',
    values:
      'Draft, PendingApproval, Approved, InProgress, Fulfilled, OnHold, Closed, Rejected, Cancelled',
    note: '(read-only)',
  },
];

function EnumReference() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-muted/30">
      <button
        type="button"
        className="w-full flex items-center gap-2 px-4 py-3 text-sm font-medium text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <ChevronDown className="h-4 w-4 shrink-0" />
        ) : (
          <ChevronRight className="h-4 w-4 shrink-0" />
        )}
        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        Enum Reference
        <span className="text-xs text-muted-foreground font-normal ml-1">
          valid values for request fields
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold text-muted-foreground w-40">
                  Enum
                </th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Values</th>
              </tr>
            </thead>
            <tbody>
              {ENUM_ROWS.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-2 pr-4 align-top">
                    <code className="font-mono font-semibold">{row.name}</code>
                    {row.note && (
                      <span className="block text-muted-foreground mt-0.5">{row.note}</span>
                    )}
                  </td>
                  <td className="py-2 align-top leading-relaxed text-muted-foreground">
                    {row.values.split(', ').map((v) => (
                      <code
                        key={v}
                        className="inline-block bg-muted rounded px-1 py-0.5 mr-1 mb-1 font-mono text-foreground"
                      >
                        {v}
                      </code>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const schema = z.object({
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  requestType: z.enum([
    'Access',
    'Equipment',
    'Software',
    'DataChange',
    'Workspace',
    'Account',
    'PermissionChange',
  ] as const),
  categoryId: z.string().optional(),
  priority: z.enum(['Critical', 'High', 'Normal', 'Low'] as const),
  justification: z.string().optional(),
  requiredByDate: z.string().optional(),
  onBehalfOfId: z.string().optional(),
  estimatedCost: z.string().optional(), // string from input, parsed to number on submit
});

type FormValues = z.infer<typeof schema>;

// Key-value row for requestDetails
interface KVRow {
  key: string;
  value: string;
}

export default function CreateRequestPage() {
  const { navigateTo, pageParams } = useNavigation();
  const createMutation = useCreateServiceRequest();
  const submitMutation = useSubmitServiceRequest();
  const categoriesQuery = useActiveCategories();
  const categories = categoriesQuery.data?.data ?? [];

  const [submitMode, setSubmitMode] = useState<'draft' | 'submit'>('draft');

  // Tags state
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // requestDetails key-value rows
  const [kvRows, setKvRows] = useState<KVRow[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: 'Normal' as const },
  });

  const watchedType = watch('requestType');

  const filteredCategories = categories.filter(
    (c: { requestType: string }) => !watchedType || c.requestType === watchedType,
  );

  // Tag helpers
  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, '-');

    if (t && !tags.includes(t)) {setTags((prev) => [...prev, t]);}
    setTagInput('');
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t));
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  }

  // requestDetails helpers
  function addKvRow() {
    setKvRows((prev) => [...prev, { key: '', value: '' }]);
  }

  function updateKvRow(idx: number, field: 'key' | 'value', val: string) {
    setKvRows((prev) => prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)));
  }

  function removeKvRow(idx: number) {
    setKvRows((prev) => prev.filter((_, i) => i !== idx));
  }

  async function onSubmit(values: FormValues) {
    // Build requestDetails from key-value rows (skip empty keys)
    const requestDetails = kvRows
      .filter((r) => r.key.trim())
      .reduce<Record<string, unknown>>((acc, r) => {
        acc[r.key.trim()] = r.value;

        return acc;
      }, {});

    const dto: CreateServiceRequestDto = {
      subject: values.subject,
      description: values.description,
      requestType: values.requestType as ServiceRequestType,
      priority: values.priority as ServiceRequestPriority,
      categoryId: values.categoryId || undefined,
      justification: values.justification || undefined,
      requiredByDate: values.requiredByDate
        ? new Date(values.requiredByDate).toISOString()
        : undefined,
      onBehalfOfId: values.onBehalfOfId || undefined,
      estimatedCost: values.estimatedCost ? parseFloat(values.estimatedCost) : undefined,
      tags: tags.length > 0 ? tags : undefined,
      requestDetails: Object.keys(requestDetails).length > 0 ? requestDetails : undefined,
    };

    const result = await createMutation.mutateAsync(dto);

    if (result.success && result.data) {
      const id = result.data.id;

      if (submitMode === 'submit') {
        // Submit after create; always navigate to draft regardless of outcome
        await submitMutation.mutateAsync(id);
      }
      navigateTo(`/service-requests/${id}`);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigateTo(pageParams?.from ?? '/service-requests/my-requests')}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-primary" />
          <h1 className="text-xl font-bold">Raise Service Request</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Subject */}
        <div className="space-y-1.5">
          <Label htmlFor="subject">
            Subject <span className="text-destructive">*</span>
          </Label>
          <Input
            id="subject"
            placeholder="Brief description of your request"
            {...register('subject')}
          />
          {errors.subject && <p className="text-xs text-destructive">{errors.subject.message}</p>}
        </div>

        {/* Request Type + Category */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>
              Request Type <span className="text-destructive">*</span>
            </Label>
            <Select
              onValueChange={(v) => {
                setValue('requestType', v as ServiceRequestType);
                setValue('categoryId', '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_REQUEST_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {getSRTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.requestType && (
              <p className="text-xs text-destructive">{errors.requestType.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select onValueChange={(v) => setValue('categoryId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.length === 0 ? (
                  <SelectItem value="_none" disabled>
                    No categories available
                  </SelectItem>
                ) : (
                  filteredCategories.map((c: { id: string; name: string }) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Priority + Required By */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Priority</Label>
            <Select
              defaultValue="Normal"
              onValueChange={(v) => setValue('priority', v as ServiceRequestPriority)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SERVICE_REQUEST_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Required By Date</Label>
            <Input type="date" {...register('requiredByDate')} />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="description">
            Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Describe your request in detail..."
            {...register('description')}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description.message}</p>
          )}
        </div>

        {/* Justification */}
        <div className="space-y-1.5">
          <Label htmlFor="justification">Business Justification</Label>
          <Textarea
            id="justification"
            rows={2}
            placeholder="Why is this request needed? (optional)"
            {...register('justification')}
          />
        </div>

        {/* Estimated Cost + On Behalf Of */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="estimatedCost">Estimated Cost</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                $
              </span>
              <Input
                id="estimatedCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="pl-7"
                {...register('estimatedCost')}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="onBehalfOfId">On Behalf Of (User ID)</Label>
            <Input
              id="onBehalfOfId"
              placeholder="User ID of the beneficiary"
              {...register('onBehalfOfId')}
            />
            <p className="text-xs text-muted-foreground">
              Leave blank if this request is for yourself
            </p>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label>Tags</Label>
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
            />
            <Button type="button" variant="outline" size="sm" onClick={addTag}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1 pr-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Request Details (key-value) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <Label>Request Details</Label>
              <p className="text-xs text-muted-foreground">
                Additional structured information for this request
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addKvRow}>
              <Plus className="h-4 w-4 mr-1" />
              Add Field
            </Button>
          </div>
          {kvRows.length > 0 && (
            <div className="space-y-2 rounded-lg border p-3">
              {kvRows.map((row, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <Input
                    placeholder="Field name"
                    value={row.key}
                    onChange={(e) => updateKvRow(idx, 'key', e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Value"
                    value={row.value}
                    onChange={(e) => updateKvRow(idx, 'value', e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => removeKvRow(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="submit"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => setSubmitMode('draft')}
          >
            <Save className="h-4 w-4 mr-1" />
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={() => setSubmitMode('submit')}>
            <Send className="h-4 w-4 mr-1" />
            {isSubmitting && submitMode === 'submit' ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </form>

      {/* Enum reference — collapsed by default */}
      <EnumReference />
    </div>
  );
}
