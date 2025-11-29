"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { createServiceRequestCategory } from "@/lib/api/service-request-category";
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

export default function CreateServiceRequestCategoryPage() {
  const router = useRouter();
  //const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      requestType: "Access",
      color: "#000000",
      icon: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      await createServiceRequestCategory(values);
      toast.success("Category created successfully");
      router.push("/service-request-categories");
    } catch {
      toast.error( "Category creation failed");
    }
  };

  return (
    <div className="p-6 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Create Service Request Category</h1>

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
        <Button type="submit">Create Category</Button>
      </form>
    </div>
  );
}
