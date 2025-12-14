
None selected 

Skip to content
Using Gmail with screen readers
in:draft 
Conversations
11% of 15 GB used
Terms · Privacy · Program Policies
Last account activity: 0 minutes ago
Open in 1 other location · Details
// /components/request-category-table.tsx
"use client";
import React, { useState } from "react";
import { ServiceRequestCategory } from "@/lib/api/service-request-category";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
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
  EyeIcon, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  CheckSquare,
  Square,
  User,
  Clock,
  Hash,
  Tag,
  Palette,
  Type,
  ToggleLeft,
  ToggleRight
} from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RequestCategoryTableProps {
  categories: ServiceRequestCategory[];
  onCategoryClick: (category: ServiceRequestCategory) => void;
  onEdit?: (category: ServiceRequestCategory) => void;
  onDelete?: (categoryId: string) => Promise<void>;
  onCreate?: () => void;
  onExport?: () => void;
  onImport?: () => void;
  onBulkDelete?: (ids: string[]) => Promise<void>;
  onBulkActivate?: (ids: string[]) => Promise<void>;
  onBulkDeactivate?: (ids: string[]) => Promise<void>;
  isLoading?: boolean;
  showFilters?: boolean;
  showActions?: boolean;
}

type SortField = 'name' | 'requestType' | 'isActive' | 'createdAt' | 'updatedAt' | 'estimatedFulfillmentDays';
type SortDirection = 'asc' | 'desc';

export default function RequestCategoryTable({ 
  categories, 
  onCategoryClick, 
  onEdit, 
  onDelete, 
  onCreate,
  onExport,
  onImport,
  onBulkDelete,
  onBulkActivate,
  onBulkDeactivate,
  isLoading = false,
  showFilters = true,
  showActions = true
}: RequestCategoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkActionDialogOpen, setBulkActionDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceRequestCategory | null>(null);

  // Filter and sort categories
  const filteredCategories = categories
    .filter(category => {
      const matchesSearch = 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.keywords && category.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchTerm.toLowerCase())
        ));

      const matchesType = filterType === "all" || category.requestType === filterType;
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" && category.isActive) ||
        (filterStatus === "inactive" && !category.isActive);

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'requestType':
          aValue = a.requestType;
          bValue = b.requestType;
          break;
        case 'isActive':
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        case 'updatedAt':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        case 'estimatedFulfillmentDays':
          aValue = a.estimatedFulfillmentDays || 0;
          bValue = b.estimatedFulfillmentDays || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getRequestTypeColor = (type: string) => {
    switch (type) {
      case 'Access': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Hardware': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Software': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Support': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const handleDeleteClick = (category: ServiceRequestCategory, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedCategory(category);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedCategory && onDelete) {
      await onDelete(selectedCategory.id);
    }
    setDeleteDialogOpen(false);
    setSelectedCategory(null);
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredCategories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredCategories.map(cat => cat.id));
    }
  };

  const handleSelectCategory = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'activate' | 'deactivate') => {
    if (selectedIds.length === 0) return;

    try {
      switch (action) {
        case 'delete':
          if (onBulkDelete) await onBulkDelete(selectedIds);
          break;
        case 'activate':
          if (onBulkActivate) await onBulkActivate(selectedIds);
          break;
        case 'deactivate':
          if (onBulkDeactivate) await onBulkDeactivate(selectedIds);
          break;
      }
      setSelectedIds([]);
      setBulkActionDialogOpen(false);
    } catch (error) {
      console.error('Bulk action failed:', error);
    }
  };

  const SortableHeader = ({ 
    field, 
    children 
  }: { 
    field: SortField; 
    children: React.ReactNode;
  }) => (
    <TableHead 
      className="cursor-pointer hover:bg-gray-50"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  const getStatusBadge = (category: ServiceRequestCategory) => {
    if (category.isActive) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          Active
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="gap-1">
          <XCircle className="h-3 w-3" />
          Inactive
        </Badge>
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center space-y-4">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            <p className="text-gray-500">Loading categories...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          {/* Header with controls */}
                      {/*

          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Service Request Categories</h2>
              <p className="text-gray-500">
                Manage and organize different types of service requests
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {onExport && (
                <Button variant="outline" size="sm" onClick={onExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
              
              {onImport && (
                <Button variant="outline" size="sm" onClick={onImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
              )}
              
              {onCreate && (
                <Button onClick={onCreate} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Category
                </Button>
              )}
            </div>

          </div>
                        /* Controls */}

          {/* Bulk Actions Bar */}
          {selectedIds.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">
                    {selectedIds.length} category{selectedIds.length !== 1 ? 'ies' : ''} selected
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {onBulkActivate && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('activate')}
                    >
                      Activate Selected
                    </Button>
                  )}
                  
                  {onBulkDeactivate && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleBulkAction('deactivate')}
                    >
                      Deactivate Selected
                    </Button>
                  )}
                  
                  {onBulkDelete && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => setBulkActionDialogOpen(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  )}
                  
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

          {/* Filters and Search */}
          {showFilters && (
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-x-4 md:space-y-0 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by name, description, or keywords..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="Access">Access</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Results count */}
          <div className="mb-4 text-sm text-gray-500 flex justify-between items-center">
            <div>
              Showing {filteredCategories.length} of {categories.length} categories
              {searchTerm && (
                <span className="ml-2">
                  matching "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {filteredCategories.length > 0 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                    onCheckedChange={handleSelectAll}
                    className="h-4 w-4"
                  />
                  <span className="text-sm">Select all</span>
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                      checked={selectedIds.length === filteredCategories.length && filteredCategories.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="h-4 w-4"
                    />
                  </TableHead>
                  <SortableHeader field="name">Name</SortableHeader>
                  <TableHead>Description</TableHead>
                  <SortableHeader field="requestType">Type</SortableHeader>
                  <TableHead>Configuration</TableHead>
                  <SortableHeader field="isActive">Status</SortableHeader>
                  <SortableHeader field="createdAt">Created</SortableHeader>
                  {showActions && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActions ? 8 : 7} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="rounded-full bg-gray-100 p-4">
                          <Type className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">No categories found</p>
                          <p className="text-sm text-gray-400 mt-1">
                            {searchTerm ? "Try a different search term" : "Create your first category to get started"}
                          </p>
                        </div>
                        {!searchTerm && onCreate && (
                          <Button onClick={onCreate} className="mt-2">
                            <Plus className="h-4 w-4 mr-2" />
                            Create Category
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow 
                      key={category.id} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors group"
                      onClick={() => onCategoryClick(category)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.includes(category.id)}
                          onCheckedChange={() => handleSelectCategory(category.id)}
                          className="h-4 w-4"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="flex items-center justify-center w-10 h-10 rounded-md"
                            style={{ backgroundColor: `${category.color}20`, color: category.color }}
                          >
                            <span className="text-lg">{category.icon}</span>
                          </div>
                          <div>
                            <div className="font-medium">{category.name}</div>
                            {category.keywords && category.keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {category.keywords.slice(0, 2).map((keyword, idx) => (
                                  <TooltipProvider key={idx}>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded cursor-help">
                                          {keyword}
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>{keyword}</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                ))}
                                {category.keywords.length > 2 && (
                                  <span className="text-xs text-gray-500">
                                    +{category.keywords.length - 2} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate" title={category.description}>
                          {category.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={getRequestTypeColor(category.requestType)}
                        >
                          {category.requestType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center space-x-2">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1">
                                    <Hash className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{category.requiredFields?.length || 0}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Required fields</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1">
                                    <User className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{category.fulfillmentRoles?.length || 0}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Fulfillment roles</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{category.estimatedFulfillmentDays || 0}</span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Estimated days</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            
                            {category.requiresApproval && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <div className="flex items-center space-x-1">
                                      <AlertCircle className="h-3 w-3 text-yellow-500" />
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Requires approval</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(category)}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div>
                                  {category.isActive ? (
                                    <ToggleRight className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{category.isActive ? 'Active' : 'Inactive'}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{format(new Date(category.createdAt), 'MMM d, yyyy')}</div>
                          <div className="text-gray-500 text-xs">
                            {format(new Date(category.createdAt), 'h:mm a')}
                          </div>
                        </div>
                      </TableCell>
                      {showActions && (
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
                              <DropdownMenuItem onClick={() => onCategoryClick(category)}>
                                <EyeIcon className="mr-2 h-4 w-4" />
                                View details
                              </DropdownMenuItem>
                              
                              {onEdit && (
                                <DropdownMenuItem onClick={() => onEdit(category)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                              )}
                              
                              {onDelete && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={(e) => handleDeleteClick(category, e)}
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category <span className="font-semibold">"{selectedCategory?.name}"</span>. 
              This action cannot be undone and may affect existing service requests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Category
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkActionDialogOpen} onOpenChange={setBulkActionDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedIds.length} Categories</AlertDialogTitle>
            <AlertDialogDescription>
              You are about to delete {selectedIds.length} categor{selectedIds.length === 1 ? 'y' : 'ies'}. 
              This action cannot be undone. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleBulkAction('delete')}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete {selectedIds.length} Categor{selectedIds.length === 1 ? 'y' : 'ies'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


