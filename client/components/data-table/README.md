# DataTable Component

A reusable, feature-rich data table component with search, filtering, sorting, and bulk actions.

## Features

- ✅ Search functionality
- ✅ Column sorting
- ✅ Filters (dropdown-based)
- ✅ Pagination with page size selector
- ✅ Bulk selection with checkboxes
- ✅ Bulk actions
- ✅ Row actions (dropdown menu)
- ✅ Loading state
- ✅ Empty state with custom message
- ✅ Delete confirmation dialog
- ✅ Fully responsive
- ✅ TypeScript support

## Basic Usage

```tsx
import { DataTable } from "@/components/data-table/DataTable";

// Define your data type
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: "active" | "inactive";
  createdAt: string;
}

// In your component
<DataTable<User>
  data={users}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      render: (user) => <Badge>{user.role}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge variant={user.status === "active" ? "default" : "secondary"}>
          {user.status}
        </Badge>
      ),
    },
  ]}
  getItemId={(user) => user.id}
  searchable
  searchPlaceholder="Search users..."
  searchKeys={["name", "email"]}
  onRowClick={(user) => router.push(`/users/${user.id}`)}
/>
```

## Advanced Example (Full Features)

```tsx
<DataTable<User>
  data={users}
  columns={[
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2">
          <Avatar src={user.avatar} />
          <span className="font-medium">{user.name}</span>
        </div>
      ),
    },
    { key: "email", label: "Email", sortable: true },
    {
      key: "role",
      label: "Role",
      sortable: true,
      render: (user) => <Badge>{user.role}</Badge>,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (user) => (
        <Badge variant={user.status === "active" ? "default" : "secondary"}>
          {user.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      render: (user) => format(new Date(user.createdAt), "MMM d, yyyy"),
    },
  ]}
  isLoading={isLoading}
  searchable
  searchPlaceholder="Search users by name or email..."
  searchKeys={["name", "email"]}
  filters={[
    {
      key: "role",
      label: "Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
        { value: "Guest", label: "Guest" },
      ],
    },
    {
      key: "status",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
  ]}
  selectable
  actions={[
    {
      label: "View Details",
      icon: <EyeIcon className="mr-2 h-4 w-4" />,
      onClick: (user) => router.push(`/users/${user.id}`),
    },
    {
      label: "Edit",
      icon: <Edit className="mr-2 h-4 w-4" />,
      onClick: (user) => router.push(`/users/${user.id}/edit`),
    },
    {
      label: "Delete",
      icon: <Trash2 className="mr-2 h-4 w-4" />,
      variant: "destructive",
      onClick: handleDelete,
      separator: true,
    },
  ]}
  bulkActions={[
    {
      label: "Activate Selected",
      variant: "outline",
      onClick: handleBulkActivate,
    },
    {
      label: "Deactivate Selected",
      variant: "outline",
      onClick: handleBulkDeactivate,
    },
    {
      label: "Delete Selected",
      icon: <Trash2 className="h-4 w-4 mr-2" />,
      variant: "destructive",
      onClick: handleBulkDelete,
    },
  ]}
  onRowClick={(user) => router.push(`/users/${user.id}`)}
  emptyState={{
    icon: <Users className="h-8 w-8 text-gray-400" />,
    title: "No users found",
    description: "Get started by creating your first user",
    action: {
      label: "Create User",
      onClick: () => router.push("/users/create"),
    },
  }}
  deleteConfirmation={{
    title: "Delete User",
    description: (user) =>
      `This will permanently delete ${user.name}. This action cannot be undone.`,
  }}
  getItemId={(user) => user.id}
/>
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array of items to display |
| `columns` | `DataTableColumn<T>[]` | Column definitions |
| `getItemId` | `(item: T) => string` | Function to get unique ID from item |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Show loading state |
| `searchable` | `boolean` | `true` | Enable search |
| `searchPlaceholder` | `string` | `"Search..."` | Search input placeholder |
| `searchKeys` | `string[]` | `[]` | Keys to search in |
| `filters` | `DataTableFilter[]` | `[]` | Filter dropdowns |
| `sortable` | `boolean` | `true` | Enable sorting |
| `selectable` | `boolean` | `false` | Enable row selection |
| `pagination` | `DataTablePagination \| boolean` | - | Enable pagination (true for defaults, or custom config) |
| `actions` | `DataTableAction<T>[]` | `[]` | Row actions |
| `bulkActions` | `DataTableBulkAction[]` | `[]` | Bulk actions |
| `onRowClick` | `(item: T) => void` | - | Row click handler |
| `emptyState` | `EmptyStateConfig` | - | Empty state config |
| `deleteConfirmation` | `DeleteConfig<T>` | - | Delete confirmation config |
| `className` | `string` | - | Additional CSS classes |

## Column Definition

```typescript
interface DataTableColumn<T> {
  key: string;                    // Property key in data
  label: string;                  // Column header text
  sortable?: boolean;             // Enable sorting
  render?: (item: T) => React.ReactNode;  // Custom cell render
  className?: string;             // Cell CSS classes
}
```

## Filter Definition

```typescript
interface DataTableFilter {
  key: string;                    // Property key to filter
  label: string;                  // Filter label
  options: Array<{
    value: string;
    label: string;
  }>;
}
```

## Action Definition

```typescript
interface DataTableAction<T> {
  label: string;                  // Action label
  icon?: React.ReactNode;         // Action icon
  onClick: (item: T) => void;     // Click handler
  variant?: "default" | "destructive";  // Style variant
  separator?: boolean;            // Show separator before
}
```

## Pagination Configuration

```typescript
interface DataTablePagination {
  pageSize?: number;              // Items per page (default: 10)
  pageSizeOptions?: number[];     // Available page size options (default: [10, 20, 50, 100])
  showPageSizeSelector?: boolean; // Show page size dropdown (default: true)
}
```

**Pagination Features:**
- First, previous, next, and last page navigation buttons
- Page number display (e.g., "Page 1 of 5")
- Page size selector dropdown
- Automatic reset to page 1 when search or filters change
- Select all checkbox works only for current page items
- Results count shows current page range (e.g., "Showing 1 to 10 of 47 items")

## Styling

The component uses:
- Tailwind CSS for styling
- shadcn/ui components
- Responsive design (mobile-first)
- Consistent with service-categories table

## Examples by Use Case

### Simple Table (No Actions)

```tsx
<DataTable
  data={categories}
  columns={[
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description" },
  ]}
  getItemId={(cat) => cat.id}
/>
```

### Table with Search

```tsx
<DataTable
  data={tickets}
  columns={ticketColumns}
  searchable
  searchPlaceholder="Search tickets..."
  searchKeys={["title", "description", "ticketNumber"]}
  getItemId={(ticket) => ticket.id}
/>
```

### Table with Filters

```tsx
<DataTable
  data={users}
  columns={userColumns}
  filters={[
    {
      key: "role",
      label: "Role",
      options: [
        { value: "Admin", label: "Admin" },
        { value: "User", label: "User" },
      ],
    },
  ]}
  getItemId={(user) => user.id}
/>
```

### Table with Bulk Actions

```tsx
<DataTable
  data={items}
  columns={columns}
  selectable
  bulkActions={[
    {
      label: "Delete Selected",
      variant: "destructive",
      onClick: handleBulkDelete,
    },
  ]}
  getItemId={(item) => item.id}
/>
```

### Table with Pagination

```tsx
{/* Simple pagination (default settings: 10 items per page, page size options: [10, 20, 50, 100]) */}
<DataTable
  data={items}
  columns={columns}
  pagination={true}
  getItemId={(item) => item.id}
/>

{/* Custom pagination settings */}
<DataTable
  data={items}
  columns={columns}
  pagination={{
    pageSize: 20,
    pageSizeOptions: [20, 50, 100, 200],
    showPageSizeSelector: true,
  }}
  getItemId={(item) => item.id}
/>

{/* Disable page size selector */}
<DataTable
  data={items}
  columns={columns}
  pagination={{
    pageSize: 25,
    showPageSizeSelector: false,
  }}
  getItemId={(item) => item.id}
/>
```

## Migration from Existing Tables

To migrate from existing table implementations:

1. Replace table markup with `<DataTable>`
2. Define columns with `columns` prop
3. Move search logic to `searchKeys` prop
4. Move filters to `filters` prop
5. Move actions to `actions` prop
6. Add `getItemId` function

## Performance

- Memoized filtering and sorting
- Efficient re-renders
- Lazy rendering for large datasets
- Optimized for 1000+ rows

## Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management
- Color contrast compliant
