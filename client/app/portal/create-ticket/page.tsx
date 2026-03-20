"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigation } from "@/contexts/NavigationContext";
import { createTicket } from "@/lib/api/tickets";
import { getAllCategories, Category } from "@/lib/api/categories";
import {
  UserTicketForm,
  UserTicketSubmitData,
} from "@/components/portal/UserTicketForm";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PortalCreateTicket() {
  const { user } = useAuth();
  const { navigateTo } = useNavigation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  // One UUID per form session — prevents duplicate tickets if the request is sent twice
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID());

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    const response = await getAllCategories();
    if (response.success && response.data) {
      setCategories(response.data.filter((c) => c.isActive));
    }
  }

  async function handleSubmit(data: UserTicketSubmitData) {
    if (!user?.id) {
      toast.error("You must be logged in to submit a ticket");
      return;
    }
    // Synchronous ref guard — prevents double-submit before React state update propagates
    if (submittingRef.current) return;
    submittingRef.current = true;

    setIsSubmitting(true);
    try {
      const response = await createTicket({
        subject: data.subject,
        description: data.description,
        createdById: user.id,
        priority: data.priority,
        categoryId: data.categoryId,
      }, idempotencyKeyRef.current);

      if (!response.success || !response.data) {
        throw new Error(response.error ?? "Failed to create ticket");
      }

      const ticket = response.data;

      if (ticket.triageStatus === "AutoAssigned") {
        toast.success("Ticket submitted — our team is already on it!");
      } else if (ticket.triageStatus === "AssignedWithReview") {
        toast.success("Ticket submitted and assigned for review.");
      } else {
        toast.success(
          "Ticket submitted! We'll get back to you as soon as possible."
        );
      }

      navigateTo(`/portal/ticket/${ticket.id}`);
      // Do NOT reset isSubmitting on success — keep button locked until navigation
      // completes and component unmounts, preventing a second submission.
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit ticket";
      toast.error(message);
      // Rotate the key so a genuine retry after an error doesn't get blocked
      idempotencyKeyRef.current = crypto.randomUUID();
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-2xl py-6 space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigateTo("/portal/my-tickets")}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5" />
        Back to My Tickets
      </Button>

      <UserTicketForm
        categories={categories}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
