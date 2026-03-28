"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  MoreHorizontal,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Trash2,
  EyeIcon,
  Edit,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface DataTableColumn<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
  className?: string;
}

export interface DataTableFilter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

export interface DataTableAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (item: T) => void;
  variant?: "default" | "destructive";
  separator?: boolean;
}

export interface DataTableBulkAction {
  label: string;
  icon?: React.ReactNode;
  onClick: (ids: string[]) => void | Promise<void>;
  variant?: "default" | "outline" | "destructive";
}

export interface DataTablePagination {
  pageSize?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  filters?: DataTableFilter[];
  sortable?: boolean;
  defaultSortField?: string;
  defaultSortDirection?: "asc" | "desc";
  selectable?: boolean;
  pagination?: DataTablePagination | boolean;
  actions?: DataTableAction<T>[];
  bulkActions?: DataTableBulkAction[];
  onRowClick?: (item: T) => void;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  };
  getItemId: (item: T) => string;
  deleteConfirmation?: {
    title: string;
    description: (item: T) => string;
  };
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  searchable = true,
  searchPlaceholder = "Search...",
  searchKeys = [],
  filters = [],
  sortable = true,
  defaultSortField = "",
  defaultSortDirection = "asc",
  selectable = false,
  pagination,
  actions = [],
  bulkActions = [],
  onRowClick,
  emptyState,
  getItemId,
  deleteConfirmation,
  className,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState<string>(defaultSortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">(defaultSortDirection);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<T | null>(null);

  // Pagination state
  const paginationConfig = useMemo(() => {
    if (!pagination) return null;
    if (pagination === true) {
      return {
        pageSize: 10,
        pageSizeOptions: [10, 20, 50, 100],
        showPageSizeSelector: true,
      };
    }
    return {
      pageSize: pagination.pageSize || 10,
      pageSizeOptions: pagination.pageSizeOptions || [10, 20, 50, 100],
      showPageSizeSelector: pagination.showPageSizeSelector !== false,
    };
  }, [pagination]);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(paginationConfig?.pageSize || 10);

  // Initialize filter values
  React.useEffect(() => {
    const initialFilters: Record<string, string> = {};
    filters.forEach((filter) => {
      initialFilters[filter.key] = "all";
    });
    setFilterValues(initialFilters);
  }, [filters]);

  // When items are removed from data (e.g. after delete), clear their IDs from selection
  React.useEffect(() => {
    const validIds = new Set(data.map(getItemId));
    setSelectedIds((prev) => prev.filter((id) => validIds.has(id)));
  }, [data]);

  // Filter and sort data
  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchTerm && searchKeys.length > 0) {
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const value = (item as any)[key];
          if (typeof value === "string") {
            return value.toLowerCase().includes(searchTerm.toLowerCase());
          }
          if (Array.isArray(value)) {
            return value.some((v) =>
              String(v).toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          return false;
        })
      );
    }

    // Apply filters
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value !== "all") {
        result = result.filter((item) => (item as any)[key] === value);
      }
    });

    // Apply sorting
    if (sortField) {
      result.sort((a, b) => {
        const aValue = (a as any)[sortField];
        const bValue = (b as any)[sortField];

        let comparison = 0;
        if (aValue < bValue) comparison = -1;
        if (aValue > bValue) comparison = 1;

        return sortDirection === "asc" ? comparison : -comparison;
      });
    }

    return result;
  }, [data, searchTerm, searchKeys, filterValues, sortField, sortDirection]);

  // Pagination calculations
  const totalPages = paginationConfig
    ? Math.ceil(filteredAndSortedData.length / pageSize)
    : 1;

  const paginatedData = useMemo(() => {
    if (!paginationConfig) return filteredAndSortedData;

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, pageSize, paginationConfig]);

  // Reset to page 1 when search/filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterValues]);

  // Reset to page 1 if current page exceeds total pages
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = () => {
    const currentPageIds = paginatedData.map(getItemId);
    const allCurrentPageSelected = currentPageIds.every((id) =>
      selectedIds.includes(id)
    );

    if (allCurrentPageSelected) {
      // Deselect all on current page
      setSelectedIds((prev) => prev.filter((id) => !currentPageIds.includes(id)));
    } else {
      // Select all on current page
      setSelectedIds((prev) => [...new Set([...prev, ...currentPageIds])]);
    }
  };

  const handleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleDeleteClick = (item: T, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      const deleteAction = actions.find(
        (action) => action.variant === "destructive"
      );
      if (deleteAction) {
        deleteAction.onClick(selectedItem);
      }
    }
    setDeleteDialogOpen(false);
    setSelectedItem(null);
  };

  const SortableHeader = ({
    column,
  }: {
    column: DataTableColumn<T>;
  }) => {
    if (!column.sortable || !sortable) {
      return <TableHead className={column.className}>{column.label}</TableHead>;
    }

    return (
      <TableHead
        className={cn(
          "cursor-pointer hover:bg-accent",
          column.className
        )}
        onClick={() => handleSort(column.key)}
      >
        <div className="flex items-center space-x-1">
          <span>{column.label}</span>
          {sortField === column.key &&
            (sortDirection === "asc" ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            ))}
        </div>
      </TableHead>
    );
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <Spinner size="lg" className="text-muted-foreground" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardContent className="p-6">
          {/* Bulk Actions Bar */}
          {selectable && selectedIds.length > 0 && bulkActions.length > 0 && (
            <div className="bg-blue-100 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedIds.length} item{selectedIds.length !== 1 ? "s" : ""}{" "}
                    selected
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {bulkActions.map((action, index) => (
                    <Button
                      key={index}
                      variant={action.variant || "outline"}
                      size="sm"
                      onClick={() => action.onClick(selectedIds)}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedIds([])}
                  >
                    Clear Selection
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {(searchable || filters.length > 0) && (
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 mb-6">
              {searchable && (
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}

              {filters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground mt-2" />
                  {filters.map((filter) => (
                    <Select
                      key={filter.key}
                      value={filterValues[filter.key] || "all"}
                      onValueChange={(value) =>
                        setFilterValues((prev) => ({ ...prev, [filter.key]: value }))
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder={filter.label} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {filter.label}</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 text-sm text-muted-foreground flex justify-between items-center">
            <div>
              {paginationConfig ? (
                <>
                  Showing {(currentPage - 1) * pageSize + 1} to{" "}
                  {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of{" "}
                  {filteredAndSortedData.length} items
                </>
              ) : (
                <>
                  Showing {filteredAndSortedData.length} of {data.length} items
                </>
              )}
              {searchTerm && (
                <span className="ml-2">
                  matching "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
            {selectable && paginatedData.length > 0 && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={
                    paginatedData.length > 0 &&
                    paginatedData.every((item) =>
                      selectedIds.includes(getItemId(item))
                    )
                  }
                  onCheckedChange={handleSelectAll}
                  className="h-4 w-4"
                />
                <span className="text-sm">
                  Select {paginationConfig ? "all on page" : "all"}
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {selectable && (
                    <TableHead className="w-[50px]">
                      <Checkbox
                        checked={
                          selectedIds.length === filteredAndSortedData.length &&
                          filteredAndSortedData.length > 0
                        }
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                  )}
                  {columns.map((column) => (
                    <SortableHeader key={column.key} column={column} />
                  ))}
                  {actions.length > 0 && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedData.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        columns.length +
                        (selectable ? 1 : 0) +
                        (actions.length > 0 ? 1 : 0)
                      }
                      className="text-center py-12"
                    >
                      {emptyState ? (
                        <div className="flex flex-col items-center justify-center space-y-4">
                          {emptyState.icon && (
                            <div className="rounded-full bg-muted p-4">
                              {emptyState.icon}
                            </div>
                          )}
                          <div>
                            <p className="text-muted-foreground font-medium">
                              {emptyState.title}
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-1">
                              {emptyState.description}
                            </p>
                          </div>
                          {emptyState.action && (
                            <Button onClick={emptyState.action.onClick}>
                              {emptyState.action.label}
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted-foreground">No data available</p>
                      )}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((item) => {
                    const itemId = getItemId(item);
                    return (
                      <TableRow
                        key={itemId}
                        className={cn(
                          "transition-colors group",
                          onRowClick && "hover:bg-accent cursor-pointer"
                        )}
                        onClick={() => onRowClick?.(item)}
                      >
                        {selectable && (
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.includes(itemId)}
                              onCheckedChange={() => handleSelectItem(itemId)}
                              className="h-4 w-4"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                        )}
                        {columns.map((column) => (
                          <TableCell key={column.key} className={column.className}>
                            {column.render ? column.render(item) : (item as any)[column.key]}
                          </TableCell>
                        ))}
                        {actions.length > 0 && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                asChild
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <span className="sr-only">Open menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                {actions.map((action, index) => (
                                  <React.Fragment key={index}>
                                    {action.separator && <DropdownMenuSeparator />}
                                    <DropdownMenuItem
                                      className={cn(
                                        action.variant === "destructive" && "text-red-600"
                                      )}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (
                                          action.variant === "destructive" &&
                                          deleteConfirmation
                                        ) {
                                          handleDeleteClick(item, e);
                                        } else {
                                          action.onClick(item);
                                        }
                                      }}
                                    >
                                      {action.icon}
                                      {action.label}
                                    </DropdownMenuItem>
                                  </React.Fragment>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {paginationConfig && totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                {/* Page size selector */}
                {paginationConfig.showPageSizeSelector && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Show:</span>
                    <Select
                      value={String(pageSize)}
                      onValueChange={(value) => {
                        setPageSize(Number(value));
                        setCurrentPage(1);
                      }}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {paginationConfig.pageSizeOptions.map((size) => (
                          <SelectItem key={size} value={String(size)}>
                            {size} / page
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Navigation buttons */}
                <div className="flex items-center space-x-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    aria-label="First page"
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    aria-label="Last page"
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmation && (
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{deleteConfirmation.title}</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedItem && deleteConfirmation.description(selectedItem)}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  );
}
