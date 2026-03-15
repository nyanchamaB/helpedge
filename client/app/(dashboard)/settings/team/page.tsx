"use client";
//this is the page for managing team settings: viewing team members, inviting new members, and managing team roles and permissions.
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
export default function TeamSettingsPage() {
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
  }
, []);
    const handleEditClick = () => {
        setIsEditDialogOpen(true);
        setEditedName(profile?.fullName || "");
        setEditedEmail(profile?.email || "");
    };
    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        // Here you would call your API to save the updated profile
        // For example:
        // const response = await updateUserProfile({ fullName: editedName, email: editedEmail });
        // if (response.success) {
        //     toast.success("Profile updated successfully");
        //     setProfile({ ...profile, fullName: editedName, email: editedEmail } as UserProfile);
        //     setIsEditDialogOpen(false);
        // } else {
        //     setError(response.error || "Failed to update profile");
        // }
        setIsSaving(false);
        setIsEditDialogOpen(false);
};
    const handleDialogClose = () => {
        setIsEditDialogOpen(false);
        setEditedName("");
        setEditedEmail("");
    };
    const handleMemberClick = (memberId: string) => {
        router.push(`/settings/team/members/${memberId}`);

    };
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

return (
        <div className="p-4 space-y-4 mt-4">
            <Breadcrumb />
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">Team Settings</h1>
                <Button variant="outline" size="sm" onClick={handleEditClick} disabled={isLoading}>
                    <Edit className="mr-2" />
                    Edit Profile
                </Button>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <p>Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : profile ? (
                        <div className="space-y-4">
                            <div
                                className="flex items-center space-x-4 cursor-pointer"
                                onClick={() => handleMemberClick(profile.id)}
                            >
                                <Avatar>
                                    <AvatarImage src={profile.avatarUrl || undefined} alt={profile.fullName || "User Avatar"} />
                                    <AvatarFallback>
                                        {getInitials(profile.firstName, profile.lastName, profile.fullName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{profile.fullName}</p>
                                    <p className="text-sm text-muted-foreground">{profile.email}</p>
                                </div>
                            </div>
                            {/* Here you would map over your team members and render them similarly */}
                        </div>
                    ) : (
                        <p>No team members found.</p>
                    )}
                </CardContent>
            </Card>
            {/* Edit Profile Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogTrigger className="hidden" />
                <DialogContent>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>Update your name and email address.</DialogDescription>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
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
                            <Button variant="outline" onClick={handleDialogClose}>Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}