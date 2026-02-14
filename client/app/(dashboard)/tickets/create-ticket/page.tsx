"use client";  //create ticket page
import { useState } from "react";
import { TicketForm } from "@/common/form/TicketForm";
import { defaultValues } from "@/common/form/TicketSchema";
import { toast } from "sonner";
import { useCreateTicket } from "@/apiClient/tickets";
export default  function CreateTicket() {
    const [isSubmitting, setIsSubmitting] = useState(false); 
    const createTicket = useCreateTicket();
    const OnSubmit = async (data: typeof defaultValues) => {
        setIsSubmitting(true);
        try {
            await createTicket.mutateAsync(data);
            toast.success("Ticket created successfully");
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
   