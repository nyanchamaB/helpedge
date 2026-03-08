"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  assignTicket,
  unassignTicket,
  updateTicketPriority,
  Ticket,
  TicketPriority,
  TicketPriorityString,
} from "@/lib/api/tickets";
import { getAllUsers, User, getUserDisplayName } from "@/lib/api/users";
import { getAllCategories, Category } from "@/lib/api/categories";
import {
  UserPlus,
  UserMinus,
  Loader2,
  User as UserIcon,
  Tag,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

const STAFF_ROLES = [
  "Admin",
  "ITManager",
  "TeamLead",
  "SystemAdmin",
  "ServiceDeskAgent",
  "Technician",
  "SecurityAdmin",
];

const priorityMap: Record<TicketPriorityString, TicketPriority> = {
  Low: TicketPriority.Low,
  Medium: TicketPriority.Medium,
  High: TicketPriority.High,
  Critical: TicketPriority.Critical,
};

const priorityStyle: Record<TicketPriorityString, string> = {
  Low: "bg-gray-50 text-gray-600 border-gray-200",
  Medium: "bg-blue-50 text-blue-600 border-blue-200",
  High: "bg-orange-50 text-orange-600 border-orange-200",
  Critical: "bg-red-50 text-red-600 border-red-200",
};

interface TicketAssignmentPanelProps {
  ticket: Ticket;
  currentUserId: string;
  onUpdate: () => void;
}

export function TicketAssignmentPanel({
  ticket,
  currentUserId,
  onUpdate,
}: TicketAssignmentPanelProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedUser, setSelectedUser] = useState(ticket.assignedToId ?? "");
  const [selectedPriority, setSelectedPriority] = useState<TicketPriorityString>(
    ticket.priority
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Promise.all([getAllUsers(), getAllCategories()]).then(([u, c]) => {
      if (u.success && u.data)
        setUsers(u.data.filter((x) => STAFF_ROLES.includes(x.role)));
      if (c.success && c.data) setCategories(c.data.filter((x) => x.isActive));
    });
  }, []);

  const assignedUser = users.find((u) => u.id === ticket.assignedToId);

  async function handleAssignToMe() {
    setIsLoading(true);
    const res = await assignTicket(ticket.id, currentUserId);
    if (res.success) {
      toast.success("Ticket assigned to you");
      onUpdate();
    } else {
      toast.error("Failed to assign ticket");
    }
    setIsLoading(false);
  }

  async function handleAssignTo() {
    if (!selectedUser) return;
    setIsLoading(true);
    const res = await assignTicket(ticket.id, selectedUser);
    if (res.success) {
      toast.success("Ticket assigned");
      onUpdate();
    } else {
      toast.error("Failed to assign ticket");
    }
    setIsLoading(false);
  }

  async function handleUnassign() {
    setIsLoading(true);
    const res = await unassignTicket(ticket.id);
    if (res.success) {
      toast.success("Ticket unassigned");
      onUpdate();
    } else {
      toast.error("Failed to unassign");
    }
    setIsLoading(false);
  }

  async function handlePriorityChange(value: string) {
    const priority = value as TicketPriorityString;
    setSelectedPriority(priority);
    setIsLoading(true);
    const res = await updateTicketPriority(ticket.id, priorityMap[priority]);
    if (res.success) {
      toast.success("Priority updated");
      onUpdate();
    } else {
      toast.error("Failed to update priority");
      setSelectedPriority(ticket.priority);
    }
    setIsLoading(false);
  }

  return (
    <div className="space-y-4">
      {/* Current assignee */}
      <div>
        <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1.5">
          <UserIcon className="h-3.5 w-3.5" />
          Assigned To
        </p>
        {assignedUser ? (
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-gray-800">
              {getUserDisplayName(assignedUser)}
            </p>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-gray-400 hover:text-red-500"
              onClick={handleUnassign}
              disabled={isLoading}
            >
              <UserMinus className="h-3.5 w-3.5 mr-1" />
              Unassign
            </Button>
          </div>
        ) : (
          <p className="text-sm text-gray-400 italic">Unassigned</p>
        )}
      </div>

      {/* Assign to me */}
      {ticket.assignedToId !== currentUserId && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleAssignToMe}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <UserPlus className="h-3.5 w-3.5 mr-1.5" />
          )}
          Assign to Me
        </Button>
      )}

      {/* Assign to user */}
      <div className="space-y-1.5">
        <p className="text-xs text-gray-500">Assign to agent</p>
        <div className="flex gap-2">
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="flex-1 h-8 text-sm">
              <SelectValue placeholder="Select agent..." />
            </SelectTrigger>
            <SelectContent>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {getUserDisplayName(u)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8"
            onClick={handleAssignTo}
            disabled={!selectedUser || isLoading}
          >
            Assign
          </Button>
        </div>
      </div>

      <Separator />

      {/* Priority */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
          <Flame className="h-3.5 w-3.5" />
          Priority
        </p>
        <Select value={selectedPriority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["Low", "Medium", "High", "Critical"] as TicketPriorityString[]).map(
              (p) => (
                <SelectItem key={p} value={p}>
                  <Badge
                    variant="outline"
                    className={`text-xs ${priorityStyle[p]}`}
                  >
                    {p}
                  </Badge>
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
