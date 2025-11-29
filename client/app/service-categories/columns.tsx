"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ServiceRequestCategory } from "@/lib/api/service-request-category";
import { Button } from "@/components/ui/button";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Edit, Trash2, Power } from "lucide-react";
import { toast } from "sonner";

interface ColumnsProps {
  onDelete: (id: string) => void;
  onToggleActive: (category: ServiceRequestCategory) => void;
}

export const getColumns = ({ onDelete, onToggleActive }: ColumnsProps): ColumnDef<ServiceRequestCategory>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/service-request-categories/${row.original.id}`}
        className="text-blue-600 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "requestType",
    header: "Type",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.isActive ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const category = row.original;

      return (
        <div className="flex gap-2 items-center">
          {/* Edit */}
          <Link href={`/service-request-categories/edit/${category.id}`}>
            <Button variant="ghost" size="sm"><Edit /></Button>
          </Link>

          {/* Delete */}
          <ConfirmDeleteDialog onConfirm={async () => onDelete(category.id)}>
            <Button variant="ghost" size="sm"><Trash2 /></Button>
          </ConfirmDeleteDialog>

          {/* Toggle Active */}
          <Button variant="outline" size="sm" onClick={async () => onToggleActive(category)}>
            <Power className={category.isActive ? "text-green-600" : "text-gray-400"} />
          </Button>
        </div>
      );
    },
  },
];
