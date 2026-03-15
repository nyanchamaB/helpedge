"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchUserById } from '@/apiClient/users';
import { getCurrentUserProfile, UserProfile } from "@/lib/api/users";
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';
import { Breadcrumb } from '@/components/layout/breadcrumb';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback} from '@/components/ui/avatar';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Home01Icon } from "hugeicons-react";

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
export default function PreferencesPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editedName, setEditedName] = useState("");
    const [editedEmail, setEditedEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

     useEffect(() => {
    async function fetchProfile() {
      setIsLoading(true);
      setError(null);

      const response = await getCurrentUserProfile();

      if (response.success && response.data) {
        setProfile(response.data);
      } else {
        setError(response.error || "Failed to load profile");
      }

      setIsLoading(false);
    }

    fetchProfile();
  }, []);

    const handleEditClick = () => {
        setIsEditDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsEditDialogOpen(false);
    };

    return (
        <div className="p-4 space-y-4 mt-4">
            <Breadcrumb />
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Preferences</h1>
                <Button variant="outline" size="sm" onClick={handleEditClick} disabled={isLoading}>
                    <Edit className="mr-2" />
                    Edit Profile
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>User Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : profile ? (
                        <div className="flex items-center space-x-4">
                            <Avatar>
                                <AvatarImage src={profile.avatarUrl || "/default-avatar.png"} alt={profile.firstName || "User"} />
                                <AvatarFallback>
                                    {getInitials(profile.firstName, profile.lastName)}
                                </AvatarFallback>                                
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{profile.firstName} {profile.lastName}</p>
                                <p className="text-sm text-gray-500">{profile.email}</p>
                            </div>
                        </div>
                    ) : (
                        <p>No user profile found.</p>
                    )}
                </CardContent>
            </Card>
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger className="hidden" />
                <DialogContent>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your name and email address.</DialogDescription>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={editedEmail}
                                onChange={(e) => setEditedEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-4 flex justify-end space-x-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>

                        </DialogClose>
                        <Button onClick={() => {
                            // Here you would typically call an API to update the user profile
                            toast.success('Profile updated successfully');
                            setProfile(prev => prev ? { ...prev, firstName: editedName.split(' ')[0], lastName: editedName.split(' ')[1] || '', email: editedEmail } : prev);
                            setIsEditDialogOpen(false);
                            setIsSaving(true);
                            setTimeout(() => {
                                setIsSaving(false);
                            }, 2000);
                        }}>
                            Save
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}