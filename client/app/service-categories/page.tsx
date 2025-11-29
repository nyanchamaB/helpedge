"use client";

import { useMemo, useState } from "react";
import { flexRender, NoInfer } from "@tanstack/react-table";
import { ColumnDef, useReactTable, getCoreRowModel } from "@tanstack/react-table";
import Link from "next/link";
import { toast } from "sonner";
import {Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceRequestCategory, deleteServiceRequestCategory, activateServiceRequestCategory, deactivateServiceRequestCategory } from "@/lib/api/service-request-category";
import { Edit, Trash2, Power } from "lucide-react";

interface Props {
  data: ServiceRequestCategory[];
  onUpdate: () => void;
}

export default function ServiceRequestCategoriesTable ({ data, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [filterActive, setFilterActive] = useState<boolean | undefined>(undefined);
  const [page, setPage] = useState(1);
  const perPage = 10;

  const filteredData = useMemo(() => {
    return (data || []).filter((c) =>
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())) &&
      (filterType ? c.requestType === filterType : true) &&
      (filterActive !== undefined ? c.isActive === filterActive : true)
    );
  }, [data, search, filterType, filterActive]);

  const totalPages = Math.ceil(filteredData.length / perPage);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * perPage;
    return filteredData.slice(start, start + perPage);
  }, [filteredData, page]);

  const handleDelete = async (id: string): Promise<void> => {
    try {
      await deleteServiceRequestCategory(id);
      toast.success("Category deleted");
      onUpdate();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleToggle = async (category: ServiceRequestCategory): Promise<void> => {
    try {
      if (category.isActive) {
        await deactivateServiceRequestCategory(category.id);
        toast.success("Category deactivated");
      } else {
        await activateServiceRequestCategory(category.id);
        toast.success("Category activated");
      }
      onUpdate();
    } catch {
      toast.error("Toggle failed");
    }
  };

  const columns = useMemo<ColumnDef<ServiceRequestCategory>[]>(() => [
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
        const cat = row.original;
        return (
          <div className="flex gap-2 items-center">
            {/* Edit */}
            <Link href={`/service-request-categories/edit/${cat.id}`}>
              <Button variant="ghost" size="sm"><Edit /></Button>
            </Link>

            {/* Delete */}
            <ConfirmDeleteDialog onConfirm={() => handleDelete(cat.id)}>
              <Button variant="ghost" size="sm"><Trash2 /></Button>
            </ConfirmDeleteDialog>

            {/* Toggle Active */}
            <Button variant="outline" size="sm" onClick={() => handleToggle(cat)}>
              <Power className={cat.isActive ? "text-green-600" : "text-gray-400"} />
            </Button>
          </div>
        );
      },
    },
  ], [handleDelete, handleToggle]);

  const table = useReactTable({
    data: paginatedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleFilterChange = () => setPage(1);

  return (
    <div className="flex flex-col gap-4">
        <Card>
        <CardHeader>
            <CardTitle>Service Request Categories</CardTitle>        
        </CardHeader>
        <CardContent>
        <div className="flex flex-col gap-4">
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex gap-4 flex-wrap mb-2">
        <Input
          placeholder="Search name or description..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); handleFilterChange(); }}
          className="max-w-xs"
        />
        <select
          className="border rounded p-2"
          value={filterType ?? ""}
          onChange={(e) => { setFilterType(e.target.value || undefined); handleFilterChange(); }}
        >
          <option value="">All Types</option>
          <option value="Access">Access</option>
          <option value="Incident">Incident</option>
          <option value="Change">Change</option>
          <option value="Other">Other</option>
        </select>
        <select
          className="border rounded p-2"
          value={filterActive === undefined ? "" : filterActive ? "Active" : "Inactive"}
          onChange={(e) => {
            setFilterActive(
              e.target.value === "" ? undefined : e.target.value === "Active" ? true : false
            );
            handleFilterChange();
          }}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>

        <TableBody>
          {table.getRowModel().rows.map(row => (
            <TableRow key={row.id} className="hover:bg-gray-50">
              {row.getVisibleCells().map(cell => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between mt-4">
          <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span>Page {page} / {totalPages}</span>
          <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
    </div>
    </CardContent>
    </Card>
    </div>
  );
};
