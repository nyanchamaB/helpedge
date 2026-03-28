// /components/service-request-category/CategoryForm.tsx
"use client";
import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ServiceRequestCategory, FormFieldDto, FieldType } from "@/lib/api/service-request-category";
import { SERVICE_REQUEST_TYPES, getSRTypeLabel } from "@/lib/api/service-request";
import { useActiveApprovalWorkflows } from "@/hooks/approval-workflows/useApprovalWorkflows";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Trash2,
  GripVertical,
  Palette,
  Type,
  Check,
  Hash,
  Calendar,
  List,
  Users,
  Tag,
  AlignLeft,
  Clock,
  ToggleLeft,
  Files,
  User,
  Building2,
  AppWindow,
  CheckSquare,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { CategoryIcon } from "@/components/service-request-category/CategoryIcon";

// ─── Field type definitions aligned with API FieldType enum ───────────────────

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ReactNode }[] = [
  { value: "Text",        label: "Text",          icon: <Type className="h-4 w-4" /> },
  { value: "TextArea",    label: "Text Area",      icon: <AlignLeft className="h-4 w-4" /> },
  { value: "Number",      label: "Number",         icon: <Hash className="h-4 w-4" /> },
  { value: "Date",        label: "Date",           icon: <Calendar className="h-4 w-4" /> },
  { value: "DateTime",    label: "Date & Time",    icon: <Clock className="h-4 w-4" /> },
  { value: "Select",      label: "Select",         icon: <List className="h-4 w-4" /> },
  { value: "MultiSelect", label: "Multi-Select",   icon: <List className="h-4 w-4" /> },
  { value: "Checkbox",    label: "Checkbox",       icon: <CheckSquare className="h-4 w-4" /> },
  { value: "File",        label: "File Upload",    icon: <Files className="h-4 w-4" /> },
  { value: "User",        label: "User Picker",    icon: <User className="h-4 w-4" /> },
  { value: "Department",  label: "Department",     icon: <Building2 className="h-4 w-4" /> },
  { value: "Application", label: "Application",    icon: <AppWindow className="h-4 w-4" /> },
];

// Types that need options list
const OPTION_FIELD_TYPES: FieldType[] = ["Select", "MultiSelect"];

// ─── Schemas ──────────────────────────────────────────────────────────────────

const requiredFieldSchema = z.object({
  name: z.string().min(1, "Field name is required"),
  label: z.string().min(1, "Field label is required"),
  type: z.enum(["Text", "TextArea", "Number", "Date", "DateTime", "Select", "MultiSelect", "Checkbox", "File", "User", "Department", "Application"] as const),
  isRequired: z.boolean(),
  options: z.array(z.string()).optional(),
  defaultValue: z.string().optional(),
  validationRegex: z.string().optional(),
  helpText: z.string().optional(),
  order: z.number(),
});

// isActive is NOT in Create/Update DTOs — controlled via separate activate/deactivate endpoints
const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  description: z.string().min(1, "Description is required").max(500, "Description is too long"),
  requestType: z.enum(["Access", "Equipment", "Software", "DataChange", "Workspace", "Account", "PermissionChange"] as const),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid hex color"),
  icon: z.string().min(1, "Icon is required"),
  requiresApproval: z.boolean(),
  defaultWorkflowId: z.string().optional(),
  fulfillmentRoles: z.array(z.string()),
  estimatedFulfillmentDays: z.number().min(0).max(365),
  requiredFields: z.array(requiredFieldSchema),
  keywords: z.array(z.string()),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  initialData?: Partial<ServiceRequestCategory>;
  onSubmit: (data: CategoryFormValues) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PRESET_ICONS = [
  // Emojis
  "📋", "💻", "🖥️", "🖨️", "📱", "⌨️", "🖱️",
  "🔑", "🔒", "🛡️", "🔐", "🌐", "📧", "📞",
  "🔧", "🔩", "⚙️", "🗄️", "💾", "📂", "📁",
  "👤", "👥", "🏢", "📊", "📈", "🎫", "🆘",
  // Lucide icon names (from CategoryIcon ICON_MAP)
  "laptop", "monitor", "server", "printer", "harddrive",
  "cpu", "wifi", "shield", "key", "lock",
  "database", "globe", "mail", "phone", "settings",
  "wrench", "package", "folder", "tag", "users",
];

const FULFILLMENT_ROLES = [
  "Admin", "ITManager", "TeamLead", "SystemAdmin",
  "ServiceDeskAgent", "Technician", "SecurityAdmin",
];

const requestTypeOptions = SERVICE_REQUEST_TYPES.map((t) => ({ value: t, label: getSRTypeLabel(t) }));

const presetColors = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
  "#14b8a6", "#f43f5e", "#0ea5e9", "#a855f7", "#22c55e",
];

// ─── Component ────────────────────────────────────────────────────────────────

export function CategoryForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  isEditing = false,
}: CategoryFormProps) {
  const [keywordInput, setKeywordInput] = useState("");
  const [optionsInput, setOptionsInput] = useState<Record<number, string>>({});

  // Load real workflows for the defaultWorkflowId selector
  const { data: workflows = [] } = useActiveApprovalWorkflows();

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: initialData
      ? {
          name: initialData.name ?? "",
          description: initialData.description ?? "",
          requestType: initialData.requestType as CategoryFormValues["requestType"] ?? "Access",
          color: initialData.color ?? "#3b82f6",
          icon: initialData.icon ?? "📋",
          requiresApproval: initialData.requiresApproval ?? false,
          defaultWorkflowId: initialData.defaultWorkflowId ?? "",
          fulfillmentRoles: initialData.fulfillmentRoles ?? [],
          estimatedFulfillmentDays: initialData.estimatedFulfillmentDays ?? 7,
          requiredFields: (initialData.requiredFields ?? []) as CategoryFormValues["requiredFields"],
          keywords: initialData.keywords ?? [],
        }
      : {
          name: "",
          description: "",
          requestType: "Access",
          color: "#3b82f6",
          icon: "📋",
          requiresApproval: false,
          defaultWorkflowId: "",
          fulfillmentRoles: [],
          estimatedFulfillmentDays: 7,
          requiredFields: [],
          keywords: [],
        },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "requiredFields",
  });

  const handleSubmit = async (data: CategoryFormValues) => {
    const orderedData = {
      ...data,
      defaultWorkflowId: data.defaultWorkflowId || undefined,
      requiredFields: data.requiredFields
        .map((f, i) => ({ ...f, order: f.order ?? i }))
        .sort((a, b) => a.order - b.order),
    };
    await onSubmit(orderedData);
  };

  const addKeyword = () => {
    if (keywordInput.trim()) {
      const current = form.getValues("keywords") || [];
      form.setValue("keywords", [...current, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (index: number) => {
    const current = form.getValues("keywords") || [];
    form.setValue("keywords", current.filter((_, i) => i !== index));
  };

  const addOption = (fieldIndex: number) => {
    const val = optionsInput[fieldIndex];
    if (val?.trim()) {
      const current = form.getValues(`requiredFields.${fieldIndex}.options`) || [];
      form.setValue(`requiredFields.${fieldIndex}.options`, [...current, val.trim()]);
      setOptionsInput((prev) => ({ ...prev, [fieldIndex]: "" }));
    }
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const current = form.getValues(`requiredFields.${fieldIndex}.options`) || [];
    form.setValue(`requiredFields.${fieldIndex}.options`, current.filter((_, i) => i !== optionIndex));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

        {/* ── Basic Information ── */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Core details about the service request category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Access Request" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Request Type *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {requestTypeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isEditing && (
                      <FormDescription>Request type cannot be changed after creation.</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Describe what this category is for..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Icon + Color */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="flex space-x-2 cursor-pointer">
                            <Input readOnly value={field.value || ""} placeholder="Pick an icon" className="cursor-pointer" />
                            <div
                              className="w-12 h-12 rounded-md border flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: `${form.watch("color")}20` }}
                            >
                              <CategoryIcon icon={field.value || "📋"} color={form.watch("color")} />
                            </div>
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-72">
                        <div className="space-y-3">
                          <p className="text-xs text-muted-foreground font-medium">Select an icon</p>
                          <div className="grid grid-cols-7 gap-1">
                            {PRESET_ICONS.map((icon) => (
                              <button
                                key={icon}
                                type="button"
                                onClick={() => field.onChange(icon)}
                                className={cn(
                                  "flex items-center justify-center w-9 h-9 rounded-md border hover:bg-accent transition-colors",
                                  field.value === icon && "border-primary bg-accent"
                                )}
                                style={{ backgroundColor: field.value === icon ? `${form.watch("color")}20` : undefined }}
                              >
                                <CategoryIcon icon={icon} color={field.value === icon ? form.watch("color") : undefined} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <div className="flex space-x-2">
                            <Input
                              placeholder="#3b82f6"
                              {...field}
                              onChange={(e) => { field.onChange(e); form.trigger("color"); }}
                            />
                            <div
                              className="w-12 h-12 rounded-md border cursor-pointer flex items-center justify-center"
                              style={{ backgroundColor: field.value }}
                            >
                              <Palette className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-64">
                        <div className="space-y-4">
                          <div className="grid grid-cols-5 gap-2">
                            {presetColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => form.setValue("color", color)}
                              >
                                {field.value === color && <Check className="h-4 w-4 text-white mx-auto" />}
                              </button>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground">Click a color to select, or type a hex value</p>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Toggles */}
            <div className="flex flex-wrap gap-6">
              <FormField
                control={form.control}
                name="requiresApproval"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-3">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-0.5">
                      <FormLabel>Requires Approval</FormLabel>
                      <FormDescription>Requests need manager approval</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Default Workflow — select from real workflows */}
            <FormField
              control={form.control}
              name="defaultWorkflowId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Approval Workflow</FormLabel>
                  <Select
                    onValueChange={(v) => field.onChange(v === '__none__' ? undefined : v)}
                    value={field.value || '__none__'}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="None (auto-match by request type)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {workflows.map((wf) => (
                        <SelectItem key={wf.id} value={wf.id}>
                          {wf.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Optionally pin a specific workflow to this category. Leave blank to auto-match.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* ── Fulfillment Settings ── */}
        <Card>
          <CardHeader>
            <CardTitle>Fulfillment Settings</CardTitle>
            <CardDescription>Configure how requests in this category are fulfilled</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="estimatedFulfillmentDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estimated Fulfillment Time</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="number"
                        min="0"
                        max="365"
                        className="w-32"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <FormLabel>Fulfillment Roles</FormLabel>
              </div>
              <div className="flex flex-wrap gap-2">
                {FULFILLMENT_ROLES.map((role) => {
                  const selected = (form.watch("fulfillmentRoles") || []).includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        const current = form.getValues("fulfillmentRoles") || [];
                        form.setValue("fulfillmentRoles", selected ? current.filter((r) => r !== role) : [...current, role]);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm transition-colors",
                        selected ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent"
                      )}
                    >
                      <Users className="h-3 w-3" />
                      {role}
                    </button>
                  );
                })}
              </div>
              {(form.watch("fulfillmentRoles") || []).length === 0 && (
                <p className="text-sm text-muted-foreground italic">No roles selected</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Keywords ── */}
        <Card>
          <CardHeader>
            <CardTitle>Keywords</CardTitle>
            <CardDescription>Keywords help users and the AI find this category when searching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Input
                  placeholder="Add a keyword..."
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
                />
                <Button type="button" onClick={addKeyword} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {(form.watch("keywords") || []).map((keyword, index) => (
                  <Badge key={index} variant="outline" className="gap-1 pl-3">
                    <Tag className="h-3 w-3" />
                    {keyword}
                    <button type="button" onClick={() => removeKeyword(index)} className="ml-1 hover:text-destructive">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
                {(form.watch("keywords") || []).length === 0 && (
                  <p className="text-sm text-muted-foreground italic">No keywords added yet</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Required Fields ── */}
        <Card>
          <CardHeader>
            <CardTitle>Required Fields</CardTitle>
            <CardDescription>Additional fields to collect when users submit requests in this category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-6 space-y-4 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">Field {index + 1}</h4>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., reason" {...field} />
                          </FormControl>
                          <FormDescription>Internal identifier (no spaces)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.label`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Label *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., Reason for request" {...field} />
                          </FormControl>
                          <FormDescription>Label shown to users</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.type`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Field Type *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {FIELD_TYPES.map(({ value, label, icon }) => (
                                <SelectItem key={value} value={value}>
                                  <div className="flex items-center space-x-2">
                                    {icon}
                                    <span>{label}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.order`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Order</FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} onChange={(e) => field.onChange(parseInt(e.target.value) || 0)} />
                          </FormControl>
                          <FormDescription>Lower numbers appear first</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Options for Select / MultiSelect */}
                  {OPTION_FIELD_TYPES.includes(form.watch(`requiredFields.${index}.type`) as FieldType) && (
                    <div className="space-y-3 p-4 bg-background rounded-lg border">
                      <FormLabel>Options</FormLabel>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Add an option..."
                          value={optionsInput[index] || ""}
                          onChange={(e) => setOptionsInput((prev) => ({ ...prev, [index]: e.target.value }))}
                          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addOption(index))}
                        />
                        <Button type="button" onClick={() => addOption(index)} variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(form.watch(`requiredFields.${index}.options`) || []).map((option, optIndex) => (
                          <Badge key={optIndex} variant="secondary" className="gap-1">
                            {option}
                            <button type="button" onClick={() => removeOption(index, optIndex)} className="ml-1 hover:text-destructive">
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                        {!(form.watch(`requiredFields.${index}.options`) || []).length && (
                          <p className="text-sm text-muted-foreground italic">No options added</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.defaultValue`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Value</FormLabel>
                          <FormControl>
                            <Input placeholder="Default value (optional)" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`requiredFields.${index}.validationRegex`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Validation Regex</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., ^[a-zA-Z0-9]+$" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`requiredFields.${index}.helpText`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Help Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Hint shown to users below the field..." {...field} value={field.value || ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`requiredFields.${index}.isRequired`}
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3">
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel>Required Field</FormLabel>
                        <FormDescription>User must fill this field before submitting</FormDescription>
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed"
                onClick={() => append({ name: "", label: "", type: "Text", isRequired: false, order: fields.length })}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Required Field
              </Button>

              {fields.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <Type className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
                  <p className="text-muted-foreground">No required fields added yet</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Add fields to collect additional information from users
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ── */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading} className="min-w-[140px]">
            {isLoading ? (
              <>
                <Spinner size="sm" className="mr-2" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : isEditing ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
