"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  getServiceRequestCategoryById,
  updateServiceRequestCategory,
  ServiceRequestCategory,
} from "@/lib/api/service-request-category";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  requestType: z.enum(["Access", "Incident", "Change", "Other"]),
  color: z.string().optional(),
  icon: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditServiceRequestCategoryPage() {
  const router = useRouter();
  const params = useParams();
  //const { toast } = useToast();

  const [category, setCategory] = useState<ServiceRequestCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      requestType: "Access",
      color: "",
      icon: "",
    },
  });

  useEffect(() => {
    const loadCategory = async () => {
      if (!params.id) return;
      try {
        const data = await getServiceRequestCategoryById(z.string().parse(params.id));
        setCategory(data);
        form.reset({
          name: data.name,
          description: data.description || "",
          requestType: data.requestType,
          color: data.color || "",
          icon: data.icon || "",
        });
      } catch (err) {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    loadCategory();
  }, [params.id]);

  const onSubmit = async (values: FormValues) => {
    if (!params.id) return;

    try {
      await updateServiceRequestCategory(z.string().parse(params.id), values);
      toast.success("Category updated successfully");
      router.push("/service-request-categories");
    } catch {
      toast.error("Update failed");
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!category) return <p className="p-6 text-red-600">Category not found</p>;

  return (
    <div className="p-6 space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold">Edit Service Request Category</h1>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

        {/* Name */}
        <div>
          <Label>Name</Label>
          <Input {...form.register("name")} />
          {form.formState.errors.name && (
            <p className="text-red-600 text-sm">{form.formState.errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div>
          <Label>Description</Label>
          <Input {...form.register("description")} />
        </div>

        {/* Request Type */}
        <div>
          <Label>Request Type</Label>
          <select
            {...form.register("requestType")}
            className="border rounded p-2 w-full"
          >
            <option value="Access">Access</option>
            <option value="Incident">Incident</option>
            <option value="Change">Change</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Color */}
        <div>
          <Label>Color</Label>
          <Input type="color" {...form.register("color")} />
        </div>

        {/* Icon */}
        <div>
          <Label>Icon</Label>
          <Input {...form.register("icon")} />
        </div>

        {/* Submit Button */}
        <Button type="submit">Update Category</Button>

      </form>
    </div>
  );
}
