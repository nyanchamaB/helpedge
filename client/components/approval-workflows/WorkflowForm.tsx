"use client";
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ApprovalWorkflow, ApproverType, CreateApprovalWorkflowDto } from '@/lib/api/approval-workflow';
import { SERVICE_REQUEST_TYPES } from '@/lib/api/service-request';
import { useActiveCategories } from '@/hooks/service-request-category/useCategories';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Plus, Trash2, ChevronDown, ChevronUp, ChevronRight, BookOpen } from 'lucide-react';
import { useState } from 'react';

// ─── Enum Reference ───────────────────────────────────────────────────────────

const ENUM_ROWS = [
  { name: 'requestType', note: '', values: 'Access, Equipment, Software, DataChange, Workspace, Account, PermissionChange' },
  { name: 'priority', note: '', values: 'Critical, High, Normal, Low' },
  { name: 'approverType', note: '(step field)', values: 'SpecificUser, Role, RequestersManager, DepartmentHead, CostCenterOwner, SecurityTeam, ITManagement' },
  { name: 'status', note: '(read-only)', values: 'Draft, PendingApproval, Approved, InProgress, Fulfilled, OnHold, Closed, Rejected, Cancelled' },
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
        {open ? <ChevronDown className="h-4 w-4 shrink-0" /> : <ChevronRight className="h-4 w-4 shrink-0" />}
        <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
        Enum Reference
        <span className="text-xs text-muted-foreground font-normal ml-1">valid values for workflow fields</span>
      </button>
      {open && (
        <div className="px-4 pb-4 overflow-x-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-semibold text-muted-foreground w-40">Enum</th>
                <th className="text-left py-2 font-semibold text-muted-foreground">Values</th>
              </tr>
            </thead>
            <tbody>
              {ENUM_ROWS.map((row) => (
                <tr key={row.name} className="border-b last:border-0">
                  <td className="py-2 pr-4 align-top">
                    <code className="font-mono font-semibold">{row.name}</code>
                    {row.note && <span className="block text-muted-foreground mt-0.5">{row.note}</span>}
                  </td>
                  <td className="py-2 align-top leading-relaxed text-muted-foreground">
                    {row.values.split(', ').map((v) => (
                      <code key={v} className="inline-block bg-muted rounded px-1 py-0.5 mr-1 mb-1 font-mono text-foreground">
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
import { cn } from '@/lib/utils';
import { Spinner } from '@/components/ui/spinner';

const STAFF_ROLES = ['Admin', 'ITManager', 'TeamLead', 'SystemAdmin', 'ServiceDeskAgent', 'Technician', 'SecurityAdmin'];

const APPROVER_TYPES: { value: ApproverType; label: string }[] = [
  { value: 'Role', label: 'By Role' },
  { value: 'RequestersManager', label: "Requester's Manager" },
  { value: 'ITManagement', label: 'IT Management' },
  { value: 'DepartmentHead', label: 'Department Head' },
  { value: 'CostCenterOwner', label: 'Cost Center Owner' },
  { value: 'SecurityTeam', label: 'Security Team' },
  { value: 'SpecificUser', label: 'Specific User' },
];

const stepSchema = z.object({
  name: z.string().min(1, 'Step name required'),
  order: z.number().int().min(1),
  approverType: z.enum(['SpecificUser', 'Role', 'RequestersManager', 'DepartmentHead', 'CostCenterOwner', 'SecurityTeam', 'ITManagement']),
  approverRoles: z.array(z.string()),
  specificApproverIds: z.array(z.string()),
  requireAll: z.boolean(),
  canDelegate: z.boolean(),
  timeoutHours: z.number().nullable().optional(),
  autoApproveOnTimeout: z.boolean(),
});

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  requestTypes: z.array(z.string()).min(1, 'Select at least one request type'),
  categoryIds: z.array(z.string()),
  autoApproveBelow: z.number().nullable().optional(),
  escalationTimeoutHours: z.number().int().min(1),
  steps: z.array(stepSchema).min(1, 'Add at least one approval step'),
});

type FormValues = z.infer<typeof schema>;

interface WorkflowFormProps {
  initialData?: ApprovalWorkflow;
  onSubmit: (data: CreateApprovalWorkflowDto) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export function WorkflowForm({ initialData, onSubmit, onCancel, isLoading, isEditing }: WorkflowFormProps) {
  const categoriesQuery = useActiveCategories();
  const categories = categoriesQuery.data?.data ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: initialData ? {
      name: initialData.name,
      description: initialData.description ?? '',
      requestTypes: initialData.requestTypes ?? [],
      categoryIds: initialData.categoryIds ?? [],
      autoApproveBelow: initialData.autoApproveBelow ?? null,
      escalationTimeoutHours: initialData.escalationTimeoutHours ?? 48,
      steps: (initialData.steps ?? []).map((s, i) => ({
        name: s.name,
        order: s.order ?? i + 1,
        approverType: s.approverType,
        approverRoles: s.approverRoles ?? [],
        specificApproverIds: s.specificApproverIds ?? [],
        requireAll: s.requireAll ?? false,
        canDelegate: s.canDelegate ?? true,
        timeoutHours: s.timeoutHours ?? null,
        autoApproveOnTimeout: s.autoApproveOnTimeout ?? false,
      })),
    } : {
      name: '',
      description: '',
      requestTypes: [],
      categoryIds: [],
      autoApproveBelow: null,
      escalationTimeoutHours: 48,
      steps: [{
        name: 'Manager Approval',
        order: 1,
        approverType: 'RequestersManager',
        approverRoles: [],
        specificApproverIds: [],
        requireAll: false,
        canDelegate: true,
        timeoutHours: 24,
        autoApproveOnTimeout: false,
      }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({ control: form.control, name: 'steps' });

  const handleSubmit = async (values: FormValues) => {
    const payload: CreateApprovalWorkflowDto = {
      ...values,
      requestTypes: values.requestTypes as any,
      steps: values.steps.map((s, i) => ({ ...s, order: i + 1 })),
    };
    await onSubmit(payload);
  };

  const toggleRequestType = (type: string) => {
    const current = form.getValues('requestTypes');
    form.setValue('requestTypes', current.includes(type) ? current.filter(t => t !== type) : [...current, type], { shouldValidate: true });
  };

  const toggleCategory = (id: string) => {
    const current = form.getValues('categoryIds');
    form.setValue('categoryIds', current.includes(id) ? current.filter(c => c !== id) : [...current, id]);
  };

  const toggleRole = (stepIndex: number, role: string) => {
    const current = form.getValues(`steps.${stepIndex}.approverRoles`);
    form.setValue(`steps.${stepIndex}.approverRoles`, current.includes(role) ? current.filter(r => r !== role) : [...current, role]);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow Name *</FormLabel>
                <FormControl><Input placeholder="e.g., Standard Software Access Approval" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Describe when this workflow applies..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="escalationTimeoutHours" render={({ field }) => (
                <FormItem>
                  <FormLabel>Escalation Timeout (hours)</FormLabel>
                  <FormControl>
                    <Input type="number" min={1} {...field} onChange={e => field.onChange(parseInt(e.target.value) || 48)} />
                  </FormControl>
                  <FormDescription>Hours before escalating stalled workflow</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="autoApproveBelow" render={({ field }) => (
                <FormItem>
                  <FormLabel>Auto-approve Below ($)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step={0.01} placeholder="No auto-approve"
                      value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))} />
                  </FormControl>
                  <FormDescription>Skip approval for requests below this cost</FormDescription>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Applies To */}
        <Card>
          <CardHeader><CardTitle>Applies To</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <FormField control={form.control} name="requestTypes" render={() => (
              <FormItem>
                <FormLabel>Request Types *</FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {SERVICE_REQUEST_TYPES.map(type => {
                    const selected = form.watch('requestTypes').includes(type);
                    return (
                      <button key={type} type="button" onClick={() => toggleRequestType(type)}
                        className={cn('px-3 py-1.5 rounded-full border text-sm transition-colors',
                          selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent')}>
                        {type}
                      </button>
                    );
                  })}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="categoryIds" render={() => (
              <FormItem>
                <FormLabel>Specific Categories <span className="text-muted-foreground font-normal">(optional — leave empty to apply to all)</span></FormLabel>
                <div className="flex flex-wrap gap-2 mt-1">
                  {categories.map(cat => {
                    const selected = form.watch('categoryIds').includes(cat.id);
                    return (
                      <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                        className={cn('px-3 py-1.5 rounded-full border text-sm transition-colors',
                          selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent')}>
                        {cat.name}
                      </button>
                    );
                  })}
                  {categories.length === 0 && <p className="text-sm text-muted-foreground italic">No active categories</p>}
                </div>
                <FormMessage />
              </FormItem>
            )} />
          </CardContent>
        </Card>

        {/* Approval Steps */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Approval Steps</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={() => append({
                name: `Step ${fields.length + 1}`,
                order: fields.length + 1,
                approverType: 'Role',
                approverRoles: [],
                specificApproverIds: [],
                requireAll: false,
                canDelegate: true,
                timeoutHours: 24,
                autoApproveOnTimeout: false,
              })}>
                <Plus className="h-4 w-4 mr-1" /> Add Step
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">Step {index + 1}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button type="button" variant="ghost" size="sm" disabled={index === 0} onClick={() => move(index, index - 1)}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" disabled={index === fields.length - 1} onClick={() => move(index, index + 1)}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => remove(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`steps.${index}.name`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Step Name *</FormLabel>
                      <FormControl><Input placeholder="e.g., Team Lead Approval" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name={`steps.${index}.approverType`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Approver Type *</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                        <SelectContent>
                          {APPROVER_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                {form.watch(`steps.${index}.approverType`) === 'Role' && (
                  <FormField control={form.control} name={`steps.${index}.approverRoles`} render={() => (
                    <FormItem>
                      <FormLabel>Approver Roles</FormLabel>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {STAFF_ROLES.map(role => {
                          const selected = (form.watch(`steps.${index}.approverRoles`) ?? []).includes(role);
                          return (
                            <button key={role} type="button" onClick={() => toggleRole(index, role)}
                              className={cn('px-2.5 py-1 rounded-full border text-xs transition-colors',
                                selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-background border-input hover:bg-accent')}>
                              {role}
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )} />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField control={form.control} name={`steps.${index}.timeoutHours`} render={({ field }) => (
                    <FormItem>
                      <FormLabel>Timeout (hours)</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} placeholder="No timeout"
                          value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : parseInt(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                </div>

                <div className="flex flex-wrap gap-6">
                  <FormField control={form.control} name={`steps.${index}.requireAll`} render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div>
                        <FormLabel>Require All Approvers</FormLabel>
                        <FormDescription className="text-xs">All designated approvers must approve</FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name={`steps.${index}.canDelegate`} render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div>
                        <FormLabel>Can Delegate</FormLabel>
                        <FormDescription className="text-xs">Approver can assign to someone else</FormDescription>
                      </div>
                    </FormItem>
                  )} />

                  <FormField control={form.control} name={`steps.${index}.autoApproveOnTimeout`} render={({ field }) => (
                    <FormItem className="flex items-center gap-3">
                      <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                      <div>
                        <FormLabel>Auto-approve on Timeout</FormLabel>
                        <FormDescription className="text-xs">Automatically approve if timeout is reached</FormDescription>
                      </div>
                    </FormItem>
                  )} />
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No steps yet. Add at least one approval step.</p>
              </div>
            )}
            {form.formState.errors.steps?.root && (
              <p className="text-sm text-destructive">{form.formState.errors.steps.root.message}</p>
            )}
          </CardContent>
        </Card>

        <EnumReference />

        <div className="flex justify-end gap-3 pt-2 border-t">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>Cancel</Button>
          <Button type="submit" disabled={isLoading} className="min-w-[140px]">
            {isLoading ? (
              <><Spinner size="sm" className="mr-2" />{isEditing ? 'Saving...' : 'Creating...'}</>
            ) : isEditing ? 'Save Changes' : 'Create Workflow'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
