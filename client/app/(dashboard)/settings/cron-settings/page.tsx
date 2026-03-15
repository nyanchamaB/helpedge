"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getCronSettings,
  updateCronSettings,
  CronSettings,
  INTERVAL_OPTIONS,
} from "@/lib/api/cron-settings";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  Activity,
  Info,
  Save,
} from "lucide-react";
import { toast } from "sonner";

function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-9" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-9 w-full max-w-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CronSettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<CronSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(false);
  const [intervalMinutes, setIntervalMinutes] = useState(5);
  const [hasChanges, setHasChanges] = useState(false);

  // Check if user has permission (Admin or ITManager)
  const hasPermission = user?.role === "Admin" || user?.role === "ITManager";

  useEffect(() => {
    async function fetchSettings() {
      setLoading(true);
      setError(null);

      const response = await getCronSettings();

      if (response.success && response.data) {
        setSettings(response.data);
        setAutoFetchEnabled(response.data.autoFetchEnabled);
        setIntervalMinutes(response.data.intervalMinutes);
      } else {
        setError(response.error || "Failed to load cron settings");
      }

      setLoading(false);
    }

    if (hasPermission) {
      fetchSettings();
    } else {
      setLoading(false);
      setError("You do not have permission to view this page");
    }
  }, [hasPermission]);

  // Track changes
  useEffect(() => {
    if (settings) {
      const changed =
        autoFetchEnabled !== settings.autoFetchEnabled ||
        intervalMinutes !== settings.intervalMinutes;
      setHasChanges(changed);
    }
  }, [autoFetchEnabled, intervalMinutes, settings]);

  async function handleSave() {
    if (!settings || !hasChanges) return;

    setSaving(true);

    const response = await updateCronSettings({
      autoFetchEnabled,
      intervalMinutes,
    });

    if (response.success && response.data) {
      setSettings(response.data);
      setHasChanges(false);
      toast.success("Cron settings updated successfully", {
        description: `Auto-fetch is ${response.data.autoFetchEnabled ? "enabled" : "disabled"} with ${response.data.intervalMinutes} minute interval`,
      });
    } else {
      toast.error("Failed to update cron settings", {
        description: response.error || "An error occurred",
      });
    }

    setSaving(false);
  }

  function handleReset() {
    if (settings) {
      setAutoFetchEnabled(settings.autoFetchEnabled);
      setIntervalMinutes(settings.intervalMinutes);
      setHasChanges(false);
    }
  }

  if (loading) {
    return (
      <div className="container max-w-4xl py-6">
        <h1 className="text-2xl font-bold mb-6">Cron Settings</h1>
        <SettingsSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-6">
        <h1 className="text-2xl font-bold mb-6">Cron Settings</h1>
        <Card>
          <CardContent className="py-10">
            <div className="text-center text-destructive">
              <XCircle className="h-12 w-12 mx-auto mb-4" />
              <p className="font-medium">Error loading cron settings</p>
              <p className="text-sm text-muted-foreground mt-1">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!settings) {
    return null;
  }

  return (
    <div className="container max-w-4xl py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Email Auto-Fetch Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Configure automated email fetching from your mailbox
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {user?.role}
        </Badge>
      </div>

      <div className="space-y-6">
        {/* Configuration Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Auto-Fetch Configuration
            </CardTitle>
            <CardDescription>
              Enable or disable automatic email fetching and set the fetch interval
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Enable/Disable Switch */}
            <div className="flex items-center justify-between py-2">
              <div className="space-y-1">
                <Label htmlFor="auto-fetch" className="text-base font-medium">
                  Enable Auto-Fetch
                </Label>
                <p className="text-sm text-muted-foreground">
                  Automatically fetch new emails from the mailbox
                </p>
              </div>
              <Switch
                id="auto-fetch"
                checked={autoFetchEnabled}
                onCheckedChange={setAutoFetchEnabled}
                disabled={saving}
              />
            </div>

            {/* Interval Selector */}
            <div className="space-y-2">
              <Label htmlFor="interval" className="text-base font-medium">
                Fetch Interval
              </Label>
              <p className="text-sm text-muted-foreground mb-3">
                How often should emails be fetched when auto-fetch is enabled
              </p>
              <Select
                value={intervalMinutes.toString()}
                onValueChange={(value) => setIntervalMinutes(parseInt(value))}
                disabled={saving || !autoFetchEnabled}
              >
                <SelectTrigger id="interval" className="w-full max-w-xs">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {INTERVAL_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Current Status
            </CardTitle>
            <CardDescription>
              Real-time status of the email fetching service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Enabled Status */}
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  {settings.autoFetchEnabled ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Auto-Fetch Status</p>
                  <p className="text-sm font-medium">
                    {settings.autoFetchEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>

              {/* Current Interval */}
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <Clock className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Current Interval</p>
                  <p className="text-sm font-medium">
                    {INTERVAL_OPTIONS.find((opt) => opt.value === settings.intervalMinutes)
                      ?.label || `${settings.intervalMinutes} minutes`}
                  </p>
                </div>
              </div>

              {/* Last Fetch Time */}
              <div className="flex items-start gap-3">
                <div className="text-muted-foreground mt-0.5">
                  <Calendar className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Last Fetch</p>
                  <p className="text-sm font-medium">
                    {formatDate(settings.lastFetchAt)}
                  </p>
                </div>
              </div>

              {/* Last Fetch Status */}
              {settings.lastFetchStatus && (
                <div className="flex items-start gap-3">
                  <div className="text-muted-foreground mt-0.5">
                    {settings.lastFetchStatus.startsWith("Success") ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">Last Status</p>
                    <p className="text-sm font-medium break-words">
                      {settings.lastFetchStatus}
                    </p>
                  </div>
                </div>
              )}

              {/* Email Count */}
              {settings.lastFetchEmailCount !== undefined &&
                settings.lastFetchEmailCount !== null && (
                  <div className="flex items-start gap-3">
                    <div className="text-muted-foreground mt-0.5">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-muted-foreground">
                        Emails Fetched (Last Run)
                      </p>
                      <p className="text-sm font-medium">
                        {settings.lastFetchEmailCount}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  How Auto-Fetch Works
                </p>
                <ul className="list-disc list-inside space-y-1 text-blue-800 dark:text-blue-200">
                  <li>
                    The background service runs automatically on server startup
                  </li>
                  <li>
                    It checks for new emails at the specified interval when enabled
                  </li>
                  <li>
                    Changes to settings take effect within 30 seconds
                  </li>
                  <li>
                    The service persists across server restarts
                  </li>
                  <li>
                    Only Admin and IT Manager roles can modify these settings
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
