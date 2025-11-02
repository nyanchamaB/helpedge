import { useQuery,useMutation,useQueryClient } from "@tanstack/react-query";
//status enum
export enum TicketStatus{
    resolved = 3,
    assigned = 0,
    unassigned = 1,
    closed = 4,
}
//ticket interface
export interface Ticket{
    id:string,
    ticketNumber:string,
    subject:string,
    description:string,
    status:number,
    priority:number,
    categoryId:string,
    assignedToId:string,
    createdById:string,
    emailMassageId:string,
    emailSender:string,
    emailRecipients: string[],
    createdAt:string,
    updatedAt:string
    resolvedAt?:string
}
// fetch tickets
export const fetchTickets = async():Promise<Ticket[]>=>{
    const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets`,{
        credentials:'include',
    });
    if(!response.ok){
        const error = await response.json().catch(()=>({message:'An error occurred'}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};

// fetch ticket by id
export const fetchTicketById = async(id:string):Promise<Ticket>=>{
    const response = await fetch(`https://helpedge-api.onrender.com/api/Tickets/${id}`,{
        credentials:'include',
    });
    if(!respon
    se.ok){
        const error = await response.json().catch(()=>({message:'An error occurred'}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }
    return response.json();
};
// 
