"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { getCurrentUserProfile, UserProfile } from "@/lib/api/users";
import {
  User,
  Mail,
  Building2,
  Briefcase,
  Phone,
  Smartphone,
  MapPin,
  Clock,
  Globe,
  Languages,
  Calendar,
  Shield,
  IdCard,
} from "lucide-react";

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-4 w-64" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string | undefined | null;
}

function InfoItem({ icon, label, value }: InfoItemProps) {
  if (!value) return null;

  return (
    <div className="flex items-start gap-3 py-2">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

function getRoleBadgeVariant(role: string): "default" | "secondary" | "outline" {
  switch (role) {
    case "Admin":
      return "default";
    case "Agent":
      return "secondary";
    default:
      return "outline";
  }
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(firstName?: string, lastName?: string, fullName?: string): string {
  if (firstName && lastName) {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  }
  if (fullName) {
    const parts = fullName.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return fullName.substring(0, 2).toUpperCase();
  }
  return "U";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      setError(null);

      const response = await getCurrentUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || "Failed to load profile");
      }

      setLoading(false);
    }

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <ProfileSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Profile</h1>
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-destructive">
              <p className="font-medium">Error loading profile</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      <div className="space-y-6">
        {/* Profile Header Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Avatar className="h-20 w-20 text-2xl">
                <AvatarImage src={profile.avatarUrl} alt={profile.fullName} />
                <AvatarFallback>
                  {getInitials(profile.firstName, profile.lastName, profile.fullName)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left space-y-2">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <CardTitle className="text-xl">{profile.fullName}</CardTitle>
                  <Badge variant={getRoleBadgeVariant(profile.role)}>
                    <Shield className="h-3 w-3 mr-1" />
                    {profile.role}
                  </Badge>
                  {profile.isActive ? (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                      Inactive
                    </Badge>
                  )}
                </div>
                <CardDescription className="flex items-center gap-1 justify-center sm:justify-start">
                  <Mail className="h-4 w-4" />
                  {profile.email}
                </CardDescription>
                {profile.jobTitle && (
                  <CardDescription className="flex items-center gap-1 justify-center sm:justify-start">
                    <Briefcase className="h-4 w-4" />
                    {profile.jobTitle}
                    {profile.department && ` at ${profile.department}`}
                  </CardDescription>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoItem
                icon={<Mail className="h-4 w-4" />}
                label="Email Address"
                value={profile.email}
              />
              <InfoItem
                icon={<Phone className="h-4 w-4" />}
                label="Phone Number"
                value={profile.phoneNumber}
              />
              <InfoItem
                icon={<Smartphone className="h-4 w-4" />}
                label="Mobile Number"
                value={profile.mobileNumber}
              />
              <InfoItem
                icon={<MapPin className="h-4 w-4" />}
                label="Office Location"
                value={profile.officeLocation}
              />
            </div>
          </CardContent>
        </Card>

        {/* Work Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Work Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoItem
                icon={<Building2 className="h-4 w-4" />}
                label="Department"
                value={profile.department}
              />
              <InfoItem
                icon={<Briefcase className="h-4 w-4" />}
                label="Job Title"
                value={profile.jobTitle}
              />
              <InfoItem
                icon={<IdCard className="h-4 w-4" />}
                label="Employee ID"
                value={profile.employeeId}
              />
              <InfoItem
                icon={<User className="h-4 w-4" />}
                label="Manager ID"
                value={profile.managerId}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        {(profile.timeZone || profile.preferredLanguage) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <InfoItem
                  icon={<Clock className="h-4 w-4" />}
                  label="Time Zone"
                  value={profile.timeZone}
                />
                <InfoItem
                  icon={<Languages className="h-4 w-4" />}
                  label="Preferred Language"
                  value={profile.preferredLanguage}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
              <InfoItem
                icon={<Calendar className="h-4 w-4" />}
                label="Account Created"
                value={formatDate(profile.createdAt)}
              />
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Last Updated"
                value={formatDate(profile.updatedAt)}
              />
              <InfoItem
                icon={<Clock className="h-4 w-4" />}
                label="Last Login"
                value={formatDate(profile.lastLoginAt)}
              />
              {profile.externalSource && (
                <InfoItem
                  icon={<Globe className="h-4 w-4" />}
                  label="External Source"
                  value={profile.externalSource}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
