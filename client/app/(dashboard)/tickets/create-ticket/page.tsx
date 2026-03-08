"use client";  //create ticket page
import { useState } from "react";
import { TicketForm } from "@/common/form/TicketForm";
import { defaultValues } from "@/common/form/TicketSchema";
import { toast } from "sonner";
import { useCreateTicket } from "@/apiClient/tickets";
import { useNavigation } from "@/contexts/NavigationContext";

export default function CreateTicket() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createTicket = useCreateTicket();
    const { navigateTo } = useNavigation();

    const OnSubmit = async (data: typeof defaultValues) => {
        setIsSubmitting(true);
        try {
            const ticket = await createTicket.mutateAsync(data);
            if (ticket.triageStatus === 'AutoAssigned') {
                toast.success("Ticket auto-assigned by AI");
            } else if (ticket.triageStatus === 'AssignedWithReview') {
                toast.warning("Ticket assigned — please verify assignment");
            } else {
                toast.info("Ticket created and queued for review");
            }
            navigateTo(`/tickets/${ticket.id}`);
        } catch (error) {
            toast.error("Failed to create ticket");
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };
    return (<TicketForm defaultValues={defaultValues} onSubmit={OnSubmit} isDisabled={isSubmitting} />
    );
}
   