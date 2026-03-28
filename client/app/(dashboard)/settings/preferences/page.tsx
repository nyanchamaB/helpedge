'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import {
  getCurrentUserProfile,
  updateUser,
  getRoleDisplayString,
  getRoleBadgeColor,
  UserProfile,
} from '@/lib/api/users';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  User,
  Mail,
  Phone,
  Smartphone,
  MapPin,
  Briefcase,
  Building2,
  ShieldCheck,
  CalendarDays,
  Save,
  RotateCcw,
  Clock,
  Globe,
  Languages,
  IdCard,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';

function getInitials(firstName?: string, lastName?: string): string {
  const f = firstName?.[0] ?? '';
  const l = lastName?.[0] ?? '';

  return (f + l).toUpperCase() || 'U';
}

function formatDate(iso?: string, withTime = false) {
  if (!iso) {return '—';}

  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

interface EditForm {
  firstName: string;
  lastName: string;
  department: string;
  jobTitle: string;
  phoneNumber: string;
  mobileNumber: string;
  officeLocation: string;
}

function profileToForm(p: UserProfile): EditForm {
  return {
    firstName: p.firstName ?? '',
    lastName: p.lastName ?? '',
    department: p.department ?? '',
    jobTitle: p.jobTitle ?? '',
    phoneNumber: p.phoneNumber ?? '',
    mobileNumber: p.mobileNumber ?? '',
    officeLocation: p.officeLocation ?? '',
  };
}

function isDirty(form: EditForm, profile: UserProfile): boolean {
  return (
    form.firstName !== (profile.firstName ?? '') ||
    form.lastName !== (profile.lastName ?? '') ||
    form.department !== (profile.department ?? '') ||
    form.jobTitle !== (profile.jobTitle ?? '') ||
    form.phoneNumber !== (profile.phoneNumber ?? '') ||
    form.mobileNumber !== (profile.mobileNumber ?? '') ||
    form.officeLocation !== (profile.officeLocation ?? '')
  );
}

export default function PreferencesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    firstName: '',
    lastName: '',
    department: '',
    jobTitle: '',
    phoneNumber: '',
    mobileNumber: '',
    officeLocation: '',
  });

  useEffect(() => {
    getCurrentUserProfile().then((res) => {
      if (res.success && res.data) {
        setProfile(res.data);
        setForm(profileToForm(res.data));
      } else {
        toast.error(res.error ?? 'Failed to load profile');
      }
      setIsLoading(false);
    });
  }, []);

  const set = (key: keyof EditForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleReset = () => {
    if (profile) {setForm(profileToForm(profile));}
  };

  const handleSave = async () => {
    if (!profile) {return;}
    setIsSaving(true);
    try {
      const res = await updateUser(profile.id, {
        firstName: form.firstName,
        lastName: form.lastName,
        department: form.department || undefined,
        jobTitle: form.jobTitle || undefined,
        phoneNumber: form.phoneNumber || undefined,
        mobileNumber: form.mobileNumber || undefined,
        officeLocation: form.officeLocation || undefined,
      });

      if (res.success && res.data) {
        setProfile(res.data);
        setForm(profileToForm(res.data));
        toast.success('Profile updated');
      } else {
        toast.error(res.error ?? 'Failed to update profile');
      }
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const dirty = profile ? isDirty(form, profile) : false;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" className="text-muted-foreground" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container max-w-3xl mx-auto py-10 text-center text-muted-foreground">
        Could not load profile.
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto py-8 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Profile &amp; Preferences</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Manage your personal information and account details.
        </p>
      </div>

      {/* ── Profile summary card ── */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <Avatar className="h-20 w-20 text-2xl border-2 border-border">
                <AvatarImage src={profile.avatarUrl ?? ''} alt={profile.firstName} />
                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl">
                  {getInitials(profile.firstName, profile.lastName)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Identity */}
            <div className="flex-1 text-center sm:text-left space-y-1.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                <h2 className="text-xl font-semibold">
                  {profile.firstName} {profile.lastName}
                </h2>
                <Badge
                  className={`text-xs self-center sm:self-auto border ${getRoleBadgeColor(profile.role)}`}
                  variant="outline"
                >
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  {getRoleDisplayString(profile.role)}
                </Badge>
                {profile.isActive ? (
                  <Badge
                    variant="outline"
                    className="text-xs self-center sm:self-auto bg-green-50 text-green-700 border-green-200"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-xs self-center sm:self-auto bg-red-50 text-red-700 border-red-200"
                  >
                    <XCircle className="h-3 w-3 mr-1" /> Inactive
                  </Badge>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-x-4 gap-y-1 text-sm text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  {profile.email}
                </span>
                {profile.department && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Building2 className="h-3.5 w-3.5 shrink-0" />
                    {profile.department}
                  </span>
                )}
                {profile.jobTitle && (
                  <span className="flex items-center gap-1.5 justify-center sm:justify-start">
                    <Briefcase className="h-3.5 w-3.5 shrink-0" />
                    {profile.jobTitle}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex items-center gap-1.5 justify-center sm:justify-start">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                Member since {formatDate(profile.createdAt)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Personal Information ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Personal Information</CardTitle>
          </div>
          <CardDescription>Your name and work identity details.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={form.firstName}
                onChange={set('firstName')}
                placeholder="First name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={form.lastName}
                onChange={set('lastName')}
                placeholder="Last name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                value={form.jobTitle}
                onChange={set('jobTitle')}
                placeholder="e.g. IT Support Analyst"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                value={form.department}
                onChange={set('department')}
                placeholder="e.g. IT Operations"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Contact Details ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Contact Details</CardTitle>
          </div>
          <CardDescription>How people can reach you.</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="phoneNumber" className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone Number
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={form.phoneNumber}
                onChange={set('phoneNumber')}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mobileNumber" className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-muted-foreground" /> Mobile Number
              </Label>
              <Input
                id="mobileNumber"
                type="tel"
                value={form.mobileNumber}
                onChange={set('mobileNumber')}
                placeholder="+1 (555) 000-0000"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="officeLocation" className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-muted-foreground" /> Office Location
              </Label>
              <Input
                id="officeLocation"
                value={form.officeLocation}
                onChange={set('officeLocation')}
                placeholder="e.g. Building A, Floor 3, Desk 42"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Account (read-only) ── */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">Account</CardTitle>
          </div>
          <CardDescription>
            Managed by your administrator. Contact IT to change these.
          </CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <ReadOnlyRow
              icon={<Mail className="h-3.5 w-3.5" />}
              label="Email"
              value={profile.email}
            />
            <ReadOnlyRow
              icon={<ShieldCheck className="h-3.5 w-3.5" />}
              label="Role"
              value={getRoleDisplayString(profile.role)}
            />
            {profile.employeeId && (
              <ReadOnlyRow
                icon={<IdCard className="h-3.5 w-3.5" />}
                label="Employee ID"
                value={profile.employeeId}
              />
            )}
            {profile.timeZone && (
              <ReadOnlyRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Time Zone"
                value={profile.timeZone}
              />
            )}
            {profile.preferredLanguage && (
              <ReadOnlyRow
                icon={<Languages className="h-3.5 w-3.5" />}
                label="Preferred Language"
                value={profile.preferredLanguage}
              />
            )}
            {profile.externalSource && (
              <ReadOnlyRow
                icon={<Globe className="h-3.5 w-3.5" />}
                label="External Source"
                value={profile.externalSource}
              />
            )}
            <ReadOnlyRow
              icon={<CalendarDays className="h-3.5 w-3.5" />}
              label="Member Since"
              value={formatDate(profile.createdAt)}
            />
            <ReadOnlyRow
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Last Updated"
              value={formatDate(profile.updatedAt, true)}
            />
            {profile.lastLoginAt && (
              <ReadOnlyRow
                icon={<Clock className="h-3.5 w-3.5" />}
                label="Last Login"
                value={formatDate(profile.lastLoginAt, true)}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Sticky save bar ── */}
      {dirty && (
        <div className="sticky bottom-4 z-10">
          <div className="rounded-xl border bg-background/95 backdrop-blur shadow-lg px-5 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">You have unsaved changes.</p>
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleReset} disabled={isSaving}>
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <Spinner size="xs" className="mr-1.5" />
                ) : (
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReadOnlyRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="font-medium text-sm">{value || '—'}</p>
      </div>
    </div>
  );
}
