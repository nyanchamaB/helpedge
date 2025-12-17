"use client";

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Brain,
  Settings,
  Save,
  AlertCircle,
  Info,
  CheckCircle,
} from 'lucide-react';
import {
  getUserAIPreferences,
  updateUserAIPreferences,
} from '@/lib/api/users';
import type {
  AIUserPreferences,
  ExplanationDisplayMode,
  ExplanationDetailLevel,
  AINotificationType,
} from '@/lib/types/ai';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/**
 * User Preferences Page
 * Authorization: All roles
 * Manage user preferences including AI settings
 */
export default function PreferencesPage() {
  const queryClient = useQueryClient();
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch current AI preferences
  const {
    data: preferencesResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['user-ai-preferences'],
    queryFn: getUserAIPreferences,
    staleTime: 5 * 60 * 1000,
  });

  const currentPreferences = preferencesResponse?.data;

  // Local state for form
  const [formData, setFormData] = useState<AIUserPreferences>({
    showExplanations: 'Always',
    autoApproveThreshold: undefined,
    detailLevel: 'Detailed',
    enableNotifications: true,
    notificationTypes: [
      'LowConfidence',
      'ReviewQueueAlert',
      'ModelRetrained',
      'OverrideRecorded',
      'TrainingDataAdded',
    ],
  });

  // Initialize form data when preferences load
  useEffect(() => {
    if (currentPreferences) {
      setFormData(currentPreferences);
    }
  }, [currentPreferences]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: updateUserAIPreferences,
    onSuccess: () => {
      toast.success('Preferences saved successfully');
      queryClient.invalidateQueries({ queryKey: ['user-ai-preferences'] });
      setHasChanges(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save preferences');
    },
  });

  // Handle form changes
  const handleChange = (key: keyof AIUserPreferences, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // Handle notification type toggle
  const handleNotificationTypeToggle = (type: AINotificationType) => {
    setFormData((prev) => {
      const currentTypes = prev.notificationTypes || [];
      const newTypes = currentTypes.includes(type)
        ? currentTypes.filter((t) => t !== type)
        : [...currentTypes, type];
      return { ...prev, notificationTypes: newTypes };
    });
    setHasChanges(true);
  };

  // Handle save
  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  // Handle reset
  const handleReset = () => {
    if (currentPreferences) {
      setFormData(currentPreferences);
      setHasChanges(false);
    }
  };

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load preferences. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Preferences</h1>
        <p className="text-muted-foreground">
          Manage your personal settings and AI preferences
        </p>
      </div>

      {/* AI Preferences Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            <CardTitle>AI Preferences</CardTitle>
          </div>
          <CardDescription>
            Customize how AI explanations and notifications are displayed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Show AI Explanations */}
              <div className="space-y-3">
                <Label htmlFor="show-explanations" className="text-base font-medium">
                  Show AI Explanations
                </Label>
                <Select
                  value={formData.showExplanations}
                  onValueChange={(value: ExplanationDisplayMode) =>
                    handleChange('showExplanations', value)
                  }
                >
                  <SelectTrigger id="show-explanations">
                    <SelectValue placeholder="Select when to show explanations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Always">
                      <div className="flex flex-col">
                        <span className="font-medium">Always</span>
                        <span className="text-xs text-muted-foreground">
                          Show AI explanations for all tickets
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="LowConfidenceOnly">
                      <div className="flex flex-col">
                        <span className="font-medium">Low Confidence Only</span>
                        <span className="text-xs text-muted-foreground">
                          Only show when AI confidence is below 80%
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Never">
                      <div className="flex flex-col">
                        <span className="font-medium">Never</span>
                        <span className="text-xs text-muted-foreground">
                          Don't show AI explanations
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Explanation Detail Level */}
              <div className="space-y-3">
                <Label htmlFor="detail-level" className="text-base font-medium">
                  Explainability Detail Level
                </Label>
                <Select
                  value={formData.detailLevel}
                  onValueChange={(value: ExplanationDetailLevel) =>
                    handleChange('detailLevel', value)
                  }
                >
                  <SelectTrigger id="detail-level">
                    <SelectValue placeholder="Select detail level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Simple">
                      <div className="flex flex-col">
                        <span className="font-medium">Simple</span>
                        <span className="text-xs text-muted-foreground">
                          Show basic confidence and category only
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Detailed">
                      <div className="flex flex-col">
                        <span className="font-medium">Detailed</span>
                        <span className="text-xs text-muted-foreground">
                          Include keywords, reasoning, and similar tickets
                        </span>
                      </div>
                    </SelectItem>
                    <SelectItem value="Technical">
                      <div className="flex flex-col">
                        <span className="font-medium">Technical</span>
                        <span className="text-xs text-muted-foreground">
                          Show all technical details and model metrics
                        </span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Auto-approve High Confidence */}
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="auto-approve"
                      className="text-base font-medium cursor-pointer"
                    >
                      Auto-approve High Confidence
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically approve AI classifications above 80% confidence
                    </p>
                  </div>
                  <Switch
                    id="auto-approve"
                    checked={formData.autoApproveThreshold !== undefined}
                    onCheckedChange={(checked) =>
                      handleChange('autoApproveThreshold', checked ? 0.8 : undefined)
                    }
                  />
                </div>
                {formData.autoApproveThreshold !== undefined && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Classifications with confidence e{' '}
                      {(formData.autoApproveThreshold * 100).toFixed(0)}% will be
                      automatically approved without review.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <Separator />

              {/* Enable Notifications */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <Label
                      htmlFor="enable-notifications"
                      className="text-base font-medium cursor-pointer"
                    >
                      Enable AI Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications for AI events and alerts
                    </p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={formData.enableNotifications}
                    onCheckedChange={(checked) =>
                      handleChange('enableNotifications', checked)
                    }
                  />
                </div>

                {/* Notification Types */}
                {formData.enableNotifications && (
                  <div className="ml-4 space-y-3 pt-2">
                    <Label className="text-sm font-medium">
                      Notification Types
                    </Label>
                    <div className="space-y-2">
                      {/* Low Confidence */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="notif-low-confidence"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Low Confidence Classifications
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when AI confidence is below threshold
                          </p>
                        </div>
                        <Switch
                          id="notif-low-confidence"
                          checked={formData.notificationTypes?.includes(
                            'LowConfidence'
                          )}
                          onCheckedChange={() =>
                            handleNotificationTypeToggle('LowConfidence')
                          }
                        />
                      </div>

                      {/* Review Queue */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="notif-review-queue"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Review Queue Alerts
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when tickets are added to review queue
                          </p>
                        </div>
                        <Switch
                          id="notif-review-queue"
                          checked={formData.notificationTypes?.includes(
                            'ReviewQueueAlert'
                          )}
                          onCheckedChange={() =>
                            handleNotificationTypeToggle('ReviewQueueAlert')
                          }
                        />
                      </div>

                      {/* Model Retrained */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="notif-model-retrained"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Model Retraining
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when AI model is retrained
                          </p>
                        </div>
                        <Switch
                          id="notif-model-retrained"
                          checked={formData.notificationTypes?.includes(
                            'ModelRetrained'
                          )}
                          onCheckedChange={() =>
                            handleNotificationTypeToggle('ModelRetrained')
                          }
                        />
                      </div>

                      {/* Override Recorded */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="notif-override"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Override Confirmations
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when your corrections are recorded
                          </p>
                        </div>
                        <Switch
                          id="notif-override"
                          checked={formData.notificationTypes?.includes(
                            'OverrideRecorded'
                          )}
                          onCheckedChange={() =>
                            handleNotificationTypeToggle('OverrideRecorded')
                          }
                        />
                      </div>

                      {/* Training Data Added */}
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label
                            htmlFor="notif-training-data"
                            className="text-sm font-normal cursor-pointer"
                          >
                            Training Data Updates
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Notify when new training data is added
                          </p>
                        </div>
                        <Switch
                          id="notif-training-data"
                          checked={formData.notificationTypes?.includes(
                            'TrainingDataAdded'
                          )}
                          onCheckedChange={() =>
                            handleNotificationTypeToggle('TrainingDataAdded')
                          }
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save/Reset Buttons */}
      {!isLoading && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasChanges && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                <span>You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={!hasChanges || saveMutation.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={!hasChanges || saveMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      )}

      {/* Success Indicator */}
      {saveMutation.isSuccess && !hasChanges && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your preferences have been saved successfully.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
