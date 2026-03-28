"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigation } from '@/contexts/NavigationContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertCircle, Plus, RefreshCw, Pencil, Trash2, ToggleLeft, ToggleRight, Tag,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getAllCategories, createCategory, updateCategory, deleteCategory,
  activateCategory, deactivateCategory,
  type Category, type CreateCategoryRequest,
} from '@/lib/api/categories';

// ─── Role helpers ────────────────────────────────────────────────────────────
const ASSIGNABLE_ROLES = [
  'Admin', 'ITManager', 'TeamLead', 'SystemAdmin',
  'ServiceDeskAgent', 'Technician', 'SecurityAdmin',
];

// ─── Zod schema ──────────────────────────────────────────────────────────────
const CategorySchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().max(500).optional().or(z.literal('')),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color (e.g. #3b82f6)').optional().or(z.literal('')),
  supportTier: z.enum(['L1', 'L2']).optional(),
  assignableRoles: z.array(z.string()).optional(),
});
type CategoryFormValues = z.infer<typeof CategorySchema>;

// ─── Keyword tag input ────────────────────────────────────────────────────────
function KeywordInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState('');

  const addKeyword = () => {
    const trimmed = input.trim().toLowerCase();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInput('');
  };

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addKeyword();
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          onBlur={addKeyword}
          placeholder="Type keyword and press Enter"
          className="flex-1"
        />
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 p-2 border rounded-md bg-muted/30">
          {value.map((kw) => (
            <Badge key={kw} variant="secondary" className="gap-1 text-xs">
              {kw}
              <button
                type="button"
                onClick={() => onChange(value.filter((k) => k !== kw))}
                className="ml-0.5 hover:text-destructive"
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Category form dialog ─────────────────────────────────────────────────────
interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  category?: Category | null;
  onSaved: () => void;
}

function CategoryDialog({ open, onOpenChange, category, onSaved }: CategoryDialogProps) {
  const [keywords, setKeywords] = useState<string[]>(category?.keywords ?? []);
  const isEdit = !!category;

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3b82f6',
      supportTier: 'L1',
      assignableRoles: [],
    },
  });

  // Reset form whenever the dialog opens or the target category changes
  useEffect(() => {
    if (open) {
      form.reset({
        name: category?.name ?? '',
        description: category?.description ?? '',
        color: category?.color ?? '#3b82f6',
        supportTier: category?.supportTier ?? 'L1',
        assignableRoles: category?.assignableRoles ?? [],
      });
      setKeywords(category?.keywords ?? []);
    }
  }, [open, category]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpenChange = (v: boolean) => onOpenChange(v);

  const queryClient = useQueryClient();

  const saveMutation = useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const payload: CreateCategoryRequest = {
        name: values.name,
        description: values.description || undefined,
        color: values.color || undefined,
        supportTier: values.supportTier,
        assignableRoles: values.assignableRoles,
        assignableUserIds: category?.assignableUserIds ?? [],
        keywords,
      };
      if (isEdit && category) {
        return updateCategory(category.id, payload);
      }
      return createCategory(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(isEdit ? 'Category updated' : 'Category created');
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => {
      toast.error(isEdit ? 'Failed to update category' : 'Failed to create category', {
        description: err.message,
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update category details and keywords.' : 'Add a new ticket classification category.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => saveMutation.mutate(v))} className="space-y-4">
            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Name <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="e.g. Network & Connectivity" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl><Textarea placeholder="Briefly describe this category" rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Color + Support Tier */}
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={field.value || '#3b82f6'}
                        onChange={(e) => field.onChange(e.target.value)}
                        className="h-9 w-10 rounded border cursor-pointer p-0.5"
                      />
                      <Input
                        value={field.value || ''}
                        onChange={field.onChange}
                        placeholder="#3b82f6"
                        className="font-mono text-sm"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="supportTier" render={({ field }) => (
                <FormItem>
                  <FormLabel>Support Tier</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select tier" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="L1">L1 — First line</SelectItem>
                      <SelectItem value="L2">L2 — Escalation</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Keywords */}
            <div className="space-y-1">
              <FormLabel>Keywords</FormLabel>
              <p className="text-xs text-muted-foreground">Used by the AI engine to classify tickets into this category.</p>
              <KeywordInput value={keywords} onChange={setKeywords} />
            </div>

            {/* Assignable Roles */}
            <FormField control={form.control} name="assignableRoles" render={({ field }) => (
              <FormItem>
                <FormLabel>Assignable Roles</FormLabel>
                <p className="text-xs text-muted-foreground">Roles whose members can be assigned tickets in this category.</p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {ASSIGNABLE_ROLES.map((role) => (
                    <div key={role} className="flex items-center gap-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={(field.value ?? []).includes(role)}
                        onCheckedChange={(checked) => {
                          const current = field.value ?? [];
                          field.onChange(
                            checked ? [...current, role] : current.filter((r) => r !== role)
                          );
                        }}
                      />
                      <label htmlFor={`role-${role}`} className="text-sm cursor-pointer">{role}</label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )} />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Spinner size="sm" className="mr-2" />}
                {isEdit ? 'Save Changes' : 'Create Category'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { navigateTo } = useNavigation();
  const queryClient = useQueryClient();
  const role = user?.role ?? '';
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user?.role === 'EndUser') {
      router.push('/portal/my-tickets');
    }
  }, [authLoading, user?.role]);

  const canEdit = ['Admin', 'ITManager'].includes(role);
  const canDelete = role === 'Admin';

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: getAllCategories,
    staleTime: 5 * 60 * 1000,
  });

  const categories: Category[] = Array.isArray(response?.data) ? response.data : [];

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateCategory(id) : activateCategory(id),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success(active ? 'Category deactivated' : 'Category activated');
    },
    onError: (err: Error) => toast.error('Failed to update status', { description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('Category deleted');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error('Failed to delete category', { description: err.message }),
  });

  const handleEdit = (cat: Category) => {
    setEditTarget(cat);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditTarget(null);
    setDialogOpen(true);
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load categories</h3>
            <Button onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold">Ticket Categories</h1>
          <p className="text-muted-foreground">
            Manage categories used by the AI engine to classify and route tickets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          {canEdit && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Category
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{categories.length}</strong> total</span>
          <span><strong className="text-foreground">{categories.filter((c) => c.isActive).length}</strong> active</span>
          <span><strong className="text-foreground">{categories.filter((c) => !c.isActive).length}</strong> inactive</span>
        </div>
      )}

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            All Categories
          </CardTitle>
          <CardDescription>
            Categories with their keywords, support tier, and assigned roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              {canEdit && (
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />Create First Category
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8"></TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead className="w-20">Tier</TableHead>
                    <TableHead>Keywords</TableHead>
                    <TableHead>Assignable Roles</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    {canEdit && <TableHead className="w-28 text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      {/* Color dot */}
                      <TableCell>
                        <div
                          className="h-4 w-4 rounded-full border border-border"
                          style={{ backgroundColor: cat.color || '#94a3b8' }}
                        />
                      </TableCell>

                      {/* Name + description */}
                      <TableCell>
                        <div className="font-medium">{cat.name}</div>
                        {cat.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">{cat.description}</div>
                        )}
                      </TableCell>

                      {/* Support Tier */}
                      <TableCell>
                        {cat.supportTier ? (
                          <Badge variant="outline" className={cn(
                            'text-xs font-semibold',
                            cat.supportTier === 'L1' ? 'border-blue-500 text-blue-600' : 'border-purple-500 text-purple-600'
                          )}>
                            {cat.supportTier}
                          </Badge>
                        ) : '—'}
                      </TableCell>

                      {/* Keywords */}
                      <TableCell>
                        {(cat.keywords?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[280px]">
                            {(cat.keywords ?? []).slice(0, 5).map((kw) => (
                              <Badge key={kw} variant="secondary" className="text-xs">{kw}</Badge>
                            ))}
                            {(cat.keywords?.length ?? 0) > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{(cat.keywords?.length ?? 0) - 5} more
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No keywords</span>
                        )}
                      </TableCell>

                      {/* Assignable Roles */}
                      <TableCell>
                        {(cat.assignableRoles?.length ?? 0) > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-[200px]">
                            {(cat.assignableRoles ?? []).slice(0, 3).map((r) => (
                              <Badge key={r} variant="outline" className="text-xs">{r}</Badge>
                            ))}
                            {(cat.assignableRoles?.length ?? 0) > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{(cat.assignableRoles?.length ?? 0) - 3}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge className={cn(
                          'text-xs',
                          cat.isActive
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-muted text-muted-foreground'
                        )} variant="outline">
                          {cat.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      {canEdit && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost" size="icon"
                              title={cat.isActive ? 'Deactivate' : 'Activate'}
                              onClick={() => toggleMutation.mutate({ id: cat.id, active: cat.isActive })}
                              disabled={toggleMutation.isPending}
                            >
                              {cat.isActive
                                ? <ToggleRight className="h-4 w-4 text-green-600" />
                                : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(cat)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {canDelete && (
                              <Button
                                variant="ghost" size="icon" title="Delete"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(cat)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editTarget}
        onSaved={() => setEditTarget(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &quot;{deleteTarget?.name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the category and all its keyword rules. Existing tickets assigned
              to this category will not be affected. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Spinner size="sm" className="mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
