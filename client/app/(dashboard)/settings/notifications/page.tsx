//notifications settings page: managing notification preferences, channels, and templates.
//logged in user, update profile, team member update and ticket status change notifications, service-category specific notifications, and notification history.
// hardcoded for now, will be dynamic in future
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserProfile, UserProfile } from "@/lib/api/users";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/layout/breadcrumb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
export default function NotificationsSettingsPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
    });
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
    const handleToggle = (setting: string) => {
        setNotificationSettings((prev) => ({
            ...prev,
            [setting]: !prev[setting as keyof typeof prev],
        }));
        toast.success("Notification settings updated");
    };
    if (isLoading) {
        return <div className="p-4">Loading...</div>;
    }
    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }
    return (
        <div className="p-4 space-y-4 mt-4">
            <Breadcrumb />
            <h1 className="text-2xl font-bold">Notification Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-4">
                        <span>Email Notifications</span>
                        <Switch
                            checked={notificationSettings.emailNotifications}
                            onCheckedChange={() => handleToggle("emailNotifications")}
                        />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span>SMS Notifications</span>
                        <Switch
                            checked={notificationSettings.smsNotifications}
                            onCheckedChange={() => handleToggle("smsNotifications")}
                        />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span>Push Notifications</span>
                        <Switch
                            checked={notificationSettings.pushNotifications}
                            onCheckedChange={() => handleToggle("pushNotifications")}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

