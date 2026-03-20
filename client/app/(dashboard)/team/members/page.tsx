"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
import {
  AlertCircle, Plus, RefreshCw, Pencil, Trash2,
  ToggleLeft, ToggleRight, Users, Search,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  getAllUsers, createUser, updateUser, deleteUser,
  activateUser, deactivateUser,
  getRoleDisplayString, getRoleBadgeColor,
  type User, type CreateUserRequest, type UpdateUserRequest, type UserRoleString,
} from '@/lib/api/users';

// ─── Constants ────────────────────────────────────────────────────────────────

const ALL_ROLES: UserRoleString[] = [
  'Admin', 'ITManager', 'TeamLead', 'SystemAdmin',
  'ServiceDeskAgent', 'Technician', 'SecurityAdmin', 'EndUser',
];

// ─── Zod schemas ──────────────────────────────────────────────────────────────

const CreateUserSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(ALL_ROLES as [UserRoleString, ...UserRoleString[]]),
  department: z.string().max(100).optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  phoneNumber: z.string().max(30).optional().or(z.literal('')),
  mobileNumber: z.string().max(30).optional().or(z.literal('')),
  officeLocation: z.string().max(100).optional().or(z.literal('')),
});
type CreateUserForm = z.infer<typeof CreateUserSchema>;

const EditUserSchema = z.object({
  email: z.string().email('Enter a valid email address').optional().or(z.literal('')),
  firstName: z.string().min(1, 'First name is required').max(50),
  lastName: z.string().min(1, 'Last name is required').max(50),
  role: z.enum(ALL_ROLES as [UserRoleString, ...UserRoleString[]]),
  department: z.string().max(100).optional().or(z.literal('')),
  jobTitle: z.string().max(100).optional().or(z.literal('')),
  phoneNumber: z.string().max(30).optional().or(z.literal('')),
  mobileNumber: z.string().max(30).optional().or(z.literal('')),
  officeLocation: z.string().max(100).optional().or(z.literal('')),
});
type EditUserForm = z.infer<typeof EditUserSchema>;

// ─── Create User Dialog ───────────────────────────────────────────────────────

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSaved: () => void;
}

function CreateUserDialog({ open, onOpenChange, onSaved }: CreateDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateUserForm>({
    resolver: zodResolver(CreateUserSchema),
    defaultValues: {
      email: '', password: '', firstName: '', lastName: '',
      role: 'EndUser', department: '', jobTitle: '',
      phoneNumber: '', mobileNumber: '', officeLocation: '',
    },
  });

  useEffect(() => {
    if (open) form.reset();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (values: CreateUserForm) => {
      const payload: CreateUserRequest = {
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        department: values.department || undefined,
        jobTitle: values.jobTitle || undefined,
        phoneNumber: values.phoneNumber || undefined,
        mobileNumber: values.mobileNumber || undefined,
        officeLocation: values.officeLocation || undefined,
      };
      return createUser(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('User created successfully');
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => toast.error('Failed to create user', { description: err.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
          <DialogDescription>Create a new user account and assign a role.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Jane" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input placeholder="Smith" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input type="email" placeholder="jane.smith@company.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input type="password" placeholder="Min. 6 characters" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{getRoleDisplayString(r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl><Input placeholder="IT Operations" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input placeholder="Service Desk Agent" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input placeholder="+1 555 0100" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="officeLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Location</FormLabel>
                  <FormControl><Input placeholder="HQ – Floor 2" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Create User
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit User Dialog ─────────────────────────────────────────────────────────

interface EditDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  member: User | null;
  onSaved: () => void;
}

function EditUserDialog({ open, onOpenChange, member, onSaved }: EditDialogProps) {
  const queryClient = useQueryClient();

  const form = useForm<EditUserForm>({
    resolver: zodResolver(EditUserSchema),
    defaultValues: {
      email: '', firstName: '', lastName: '', role: 'EndUser',
      department: '', jobTitle: '', phoneNumber: '', mobileNumber: '', officeLocation: '',
    },
  });

  useEffect(() => {
    if (open && member) {
      form.reset({
        email: member.email,
        firstName: member.firstName,
        lastName: member.lastName,
        role: member.role,
        department: member.department ?? '',
        jobTitle: member.jobTitle ?? '',
        phoneNumber: member.phoneNumber ?? '',
        mobileNumber: member.mobileNumber ?? '',
        officeLocation: member.officeLocation ?? '',
      });
    }
  }, [open, member]); // eslint-disable-line react-hooks/exhaustive-deps

  const mutation = useMutation({
    mutationFn: (values: EditUserForm) => {
      if (!member) throw new Error('No member selected');
      const payload: UpdateUserRequest = {
        email: values.email || undefined,
        firstName: values.firstName,
        lastName: values.lastName,
        role: values.role,
        department: values.department || undefined,
        jobTitle: values.jobTitle || undefined,
        phoneNumber: values.phoneNumber || undefined,
        mobileNumber: values.mobileNumber || undefined,
        officeLocation: values.officeLocation || undefined,
      };
      return updateUser(member.id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('User updated successfully');
      onOpenChange(false);
      onSaved();
    },
    onError: (err: Error) => toast.error('Failed to update user', { description: err.message }),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
          <DialogDescription>Update {member?.fullName ?? member?.email}'s profile.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="firstName" render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="lastName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name <span className="text-destructive">*</span></FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl><Input type="email" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ALL_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>{getRoleDisplayString(r)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="phoneNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="officeLocation" render={({ field }) => (
                <FormItem>
                  <FormLabel>Office Location</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function TeamMembersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const role = user?.role ?? '';

  // Role permissions
  // Admin: full CRUD + activate/deactivate
  // ITManager: create + edit + activate/deactivate (no delete)
  // TeamLead: read-only
  const canCreate = ['Admin', 'ITManager'].includes(role);
  const canEdit = ['Admin', 'ITManager'].includes(role);
  const canDelete = role === 'Admin';
  const canToggleStatus = ['Admin', 'ITManager'].includes(role);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const {
    data: response,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['team-members'],
    queryFn: getAllUsers,
    staleTime: 2 * 60 * 1000,
  });

  const members: User[] = Array.isArray(response?.data) ? response.data : [];

  // Client-side filter
  const filtered = members.filter((m) => {
    const matchesRole = roleFilter === 'all' || m.role === roleFilter;
    if (!matchesRole) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      m.fullName?.toLowerCase().includes(q) ||
      m.firstName?.toLowerCase().includes(q) ||
      m.lastName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.department?.toLowerCase().includes(q) ||
      m.jobTitle?.toLowerCase().includes(q)
    );
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      active ? deactivateUser(id) : activateUser(id),
    onSuccess: (_, { active }) => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success(active ? 'User deactivated' : 'User activated');
    },
    onError: (err: Error) => toast.error('Failed to update status', { description: err.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast.success('User deleted');
      setDeleteTarget(null);
    },
    onError: (err: Error) => toast.error('Failed to delete user', { description: err.message }),
  });

  function formatLastLogin(date?: string) {
    if (!date) return '—';
    return new Date(date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function getInitials(m: User) {
    return `${m.firstName?.[0] ?? ''}${m.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h3 className="text-lg font-semibold mb-2">Failed to load team members</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {(error as Error).message || 'An unexpected error occurred'}
            </p>
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
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">
            View and manage user accounts and role assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={cn('h-4 w-4 mr-2', isFetching && 'animate-spin')} />
            Refresh
          </Button>
          {canCreate && (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Stats row */}
      {!isLoading && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">{members.length}</strong> total</span>
          <span><strong className="text-foreground">{members.filter((m) => m.isActive).length}</strong> active</span>
          <span><strong className="text-foreground">{members.filter((m) => !m.isActive).length}</strong> inactive</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, department…"
            className="pl-9"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ALL_ROLES.map((r) => (
              <SelectItem key={r} value={r}>{getRoleDisplayString(r)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {roleFilter === 'all' ? 'All Members' : getRoleDisplayString(roleFilter as UserRoleString)}
            {!isLoading && (
              <Badge variant="secondary" className="ml-1">{filtered.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Authorized roles: Admin (full access), IT Manager (create/edit), Team Lead (view only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {search || roleFilter !== 'all' ? 'No members match your filters' : 'No team members yet'}
              </h3>
              {canCreate && !search && roleFilter === 'all' && (
                <Button onClick={() => setCreateOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />Add First Member
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Job Title</TableHead>
                    <TableHead className="w-24">Status</TableHead>
                    <TableHead className="w-32">Last Login</TableHead>
                    {(canEdit || canDelete || canToggleStatus) && (
                      <TableHead className="w-28 text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((m) => (
                    <TableRow key={m.id}>
                      {/* Avatar + name + email */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0',
                            m.isActive ? 'bg-blue-600' : 'bg-muted-foreground'
                          )}>
                            {getInitials(m)}
                          </div>
                          <div>
                            <div className="font-medium leading-tight">
                              {m.fullName || `${m.firstName} ${m.lastName}`.trim()}
                            </div>
                            <div className="text-xs text-muted-foreground">{m.email}</div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Role badge */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn('text-xs font-medium border', getRoleBadgeColor(m.role))}
                        >
                          {getRoleDisplayString(m.role)}
                        </Badge>
                      </TableCell>

                      {/* Department */}
                      <TableCell>
                        <span className="text-sm">{m.department || '—'}</span>
                      </TableCell>

                      {/* Job Title */}
                      <TableCell>
                        <span className="text-sm">{m.jobTitle || '—'}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-xs',
                            m.isActive
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {m.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Last Login */}
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{formatLastLogin(m.lastLoginAt)}</span>
                      </TableCell>

                      {/* Actions */}
                      {(canEdit || canDelete || canToggleStatus) && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {canToggleStatus && (
                              <Button
                                variant="ghost" size="icon"
                                title={m.isActive ? 'Deactivate user' : 'Activate user'}
                                onClick={() => toggleMutation.mutate({ id: m.id, active: m.isActive })}
                                disabled={toggleMutation.isPending}
                              >
                                {m.isActive
                                  ? <ToggleRight className="h-4 w-4 text-green-600" />
                                  : <ToggleLeft className="h-4 w-4 text-muted-foreground" />}
                              </Button>
                            )}
                            {canEdit && (
                              <Button
                                variant="ghost" size="icon" title="Edit"
                                onClick={() => setEditTarget(m)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost" size="icon" title="Delete"
                                className="text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(m)}
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

      {/* Create Dialog */}
      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSaved={() => {}}
      />

      {/* Edit Dialog */}
      <EditUserDialog
        open={!!editTarget}
        onOpenChange={(v) => !v && setEditTarget(null)}
        member={editTarget}
        onSaved={() => setEditTarget(null)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete "{deleteTarget?.fullName || deleteTarget?.email}"?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the user account. Any tickets assigned to this user will
              remain but will become unassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <RefreshCw className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
