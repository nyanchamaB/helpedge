"use client";

import { useNavigation } from "@/contexts/NavigationContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableColumn, DataTableFilter, DataTableAction } from "@/components/data-table";
import {
  Ticket,
  TicketPriorityString,
  getPriorityString,
  getEffectiveStatusLabel,
  getEffectiveStatusStyle,
} from "@/lib/api/tickets";
import { Eye, Ticket as TicketIcon, TrendingUp } from "lucide-react";

interface TicketsTableProps {
  tickets: Ticket[];
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
  title?: string;
  showFilters?: boolean;
  emptyMessage?: string;
}

// Priority badge styling
function getPriorityBadgeStyle(priority: TicketPriorityString): string {
  switch (priority) {
    case "Low":
      return "bg-gray-100 text-gray-700 border-gray-200";
    case "Medium":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "High":
      return "bg-orange-100 text-orange-700 border-orange-200";
    case "Critical":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

export function TicketsTable({
  tickets,
  isLoading = false,
  error = null,
  onRefresh,
  title = "Tickets",
  showFilters = true,
  emptyMessage = "No tickets found",
}: TicketsTableProps) {
  const { navigateTo } = useNavigation();

  // Define columns
  const columns: DataTableColumn<Ticket>[] = [
    {
      key: "ticketNumber",
      label: "Ticket #",
      sortable: true,
      render: (ticket) => (
        <span className="font-mono text-sm text-gray-600">
          {ticket.ticketNumber || "-"}
        </span>
      ),
    },
    {
      key: "subject",
      label: "Subject",
      sortable: true,
      render: (ticket) => (
        <div className="max-w-md">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">
              {ticket.subject || "No Subject"}
            </p>
            {ticket.isEscalated && (
              <Badge variant="outline" className="shrink-0 bg-orange-100 text-orange-700 border-orange-200">
                <TrendingUp className="h-3 w-3 mr-1" />
                Escalated
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">
            {ticket.description || "No description"}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (ticket) => (
        <Badge variant="outline" className={getEffectiveStatusStyle(ticket.status, ticket.assignedToId)}>
          {getEffectiveStatusLabel(ticket.status, ticket.assignedToId)}
        </Badge>
      ),
    },
    {
      key: "priority",
      label: "Priority",
      sortable: true,
      render: (ticket) => (
        <Badge variant="outline" className={getPriorityBadgeStyle(ticket.priority)}>
          {getPriorityString(ticket.priority)}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (ticket) => (
        <div className="text-sm text-gray-600">
          {format(new Date(ticket.createdAt), "MMM d, yyyy")}
          <br />
          <span className="text-xs text-gray-400">
            {format(new Date(ticket.createdAt), "h:mm a")}
          </span>
        </div>
      ),
    },
  ];

  // Define filters (only if showFilters is true)
  const filters: DataTableFilter[] = showFilters
    ? [
        {
          key: "status",
          label: "Status",
          options: [
            { value: "Open", label: "Open" },
            { value: "InProgress", label: "In Progress" },
            { value: "Resolved", label: "Resolved" },
            { value: "Closed", label: "Closed" },
            { value: "OnHold", label: "On Hold" },
            { value: "AwaitingInfo", label: "Awaiting Info" },
          ],
        },
        {
          key: "priority",
          label: "Priority",
          options: [
            { value: "Low", label: "Low" },
            { value: "Medium", label: "Medium" },
            { value: "High", label: "High" },
            { value: "Critical", label: "Critical" },
          ],
        },
      ]
    : [];

  // Define actions
  const actions: DataTableAction<Ticket>[] = [
    {
      label: "View Details",
      icon: <Eye className="h-4 w-4 mr-2" />,
      onClick: (ticket) => navigateTo(`/tickets/${ticket.id}`),
    },
  ];

  return (
    <DataTable<Ticket>
      data={tickets}
      columns={columns}
      isLoading={isLoading}
      searchable={true}
      searchPlaceholder="Search tickets..."
      searchKeys={["subject", "description", "ticketNumber"]}
      filters={filters}
      actions={actions}
      pagination={true}
      onRowClick={(ticket) => navigateTo(`/tickets/${ticket.id}`)}
      getItemId={(ticket) => ticket.id}
      emptyState={{
        icon: <TicketIcon className="h-8 w-8 text-gray-400" />,
        title: emptyMessage,
        description: "Try adjusting your search or filter criteria",
      }}
    />
  );
}

export default TicketsTable;
