# Breadcrumbs System Documentation

A comprehensive breadcrumbs navigation system for the HelpEdge frontend that automatically generates breadcrumbs from route paths.

## Features

- ✅ Auto-generates breadcrumbs from current route path
- ✅ Dynamic route support (e.g., `/tickets/[id]`)
- ✅ Custom labels for specific routes
- ✅ Responsive design with mobile collapse
- ✅ Icon support for sections
- ✅ Clickable navigation
- ✅ Accessible (WCAG 2.1 AA compliant)
- ✅ TypeScript with full type safety
- ✅ SSR compatible

## Basic Usage

The breadcrumbs are automatically integrated into the dashboard layout. No additional setup required for basic routes.

### Automatic Breadcrumbs

```tsx
// app/tickets/page.tsx
export default function TicketsPage() {
  // Breadcrumbs automatically show: Dashboard / Tickets
  return <div>Your page content</div>;
}
```

### With Custom Labels for Dynamic Routes

```tsx
// app/tickets/[id]/page.tsx
"use client";

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useParams } from 'next/navigation';

export default function TicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;

  // Fetch ticket data
  const { data: ticket } = useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => getTicketById(ticketId),
  });

  // Custom labels for dynamic route
  const customLabels = ticket
    ? { [`/tickets/${ticketId}`]: ticket.subject || `Ticket #${ticket.ticketNumber}` }
    : undefined;

  return (
    <div>
      {/* Override default breadcrumbs with custom labels */}
      <Breadcrumbs customLabels={customLabels} />

      {/* Your page content */}
    </div>
  );
}
```

### Hiding Breadcrumbs on Specific Pages

```tsx
// app/settings/profile/page.tsx
"use client";

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export default function ProfilePage() {
  return (
    <div>
      {/* Hide breadcrumbs on this page */}
      <Breadcrumbs hiddenPaths={['/settings/profile']} />

      {/* Or globally in layout */}
    </div>
  );
}
```

## Configuration

### Adding New Routes

To add custom labels for new routes, edit `lib/breadcrumbs/config.ts`:

```typescript
export const breadcrumbConfig: BreadcrumbConfigMap = {
  // ... existing config

  // Add your new route
  '/my-new-section': {
    label: 'My New Section',
    icon: MyIcon, // Optional
  },
  '/my-new-section/[id]': {
    label: 'Details',
    dynamic: true, // Mark as dynamic if it contains [id]
  },
};
```

### Available Icons

Import from `lucide-react`:

```typescript
import { Home, Ticket, Users, Settings } from 'lucide-react';
```

## Examples by Route Type

### Static Routes

```typescript
// Dashboard → "Dashboard"
// /tickets → "Dashboard / Tickets"
// /settings/profile → "Dashboard / Settings / Profile"
```

### Dynamic Routes

```typescript
// /tickets/[id] → "Dashboard / Tickets / [Ticket Title]"
// /team/members/[id] → "Dashboard / Team / Members / [Member Name]"
```

### Nested Routes

```typescript
// /settings/team/members → "Dashboard / Settings / Team Settings / Members"
// /admin/ml-models → "Dashboard / AI & ML Admin / ML Models"
```

## Server Component Usage

For server components that don't need dynamic behavior:

```tsx
// app/static-page/page.tsx
import { SimpleBreadcrumbs } from '@/components/layout/Breadcrumbs';

export default function StaticPage() {
  return (
    <div>
      <SimpleBreadcrumbs
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Static Page' },
        ]}
      />
      {/* Page content */}
    </div>
  );
}
```

## Advanced Patterns

### With Data Fetching

```tsx
"use client";

import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { useEffect, useState } from 'react';

export default function TicketEditPage({ params }: { params: { id: string } }) {
  const [customLabels, setCustomLabels] = useState<Record<string, string>>();

  useEffect(() => {
    // Fetch ticket data
    getTicketById(params.id).then((ticket) => {
      setCustomLabels({
        [`/tickets/${params.id}`]: ticket.subject,
        [`/tickets/${params.id}/edit`]: 'Edit Ticket',
      });
    });
  }, [params.id]);

  return (
    <div>
      <Breadcrumbs customLabels={customLabels} />
      {/* Page content */}
    </div>
  );
}
```

### Multiple Dynamic Segments

```tsx
// /team/[teamId]/members/[memberId]
const customLabels = {
  [`/team/${teamId}`]: teamName,
  [`/team/${teamId}/members/${memberId}`]: memberName,
};

<Breadcrumbs customLabels={customLabels} />
```

### Role-Based Visibility

Breadcrumbs automatically respect route protection. If a user can't access a parent route, they shouldn't be on the child route either (handled by middleware).

## Mobile Behavior

On screens < 768px (md breakpoint):

- Shows first item (Dashboard)
- Shows ellipsis dropdown with hidden items
- Shows last 2 items
- Example: `Dashboard / ... / Parent / Current`

Click the ellipsis to see hidden breadcrumb items in a dropdown.

## Accessibility

- ✅ Semantic HTML with `<nav>` and `<ol>`
- ✅ `aria-label="breadcrumb"` on navigation
- ✅ `aria-current="page"` on current page
- ✅ Keyboard navigable (Tab, Enter)
- ✅ Screen reader friendly
- ✅ Proper color contrast (4.5:1 ratio)

## API Reference

### `<Breadcrumbs>` Component

```typescript
interface BreadcrumbsProps {
  // Custom labels for dynamic routes
  customLabels?: Record<string, string>;

  // Max items before collapse on mobile (default: 3)
  maxMobileItems?: number;

  // Additional CSS classes
  className?: string;

  // Paths to hide breadcrumbs
  hiddenPaths?: string[];
}
```

### Utility Functions

```typescript
// Generate breadcrumbs from pathname
generateBreadcrumbs(pathname: string, dynamicData?: Record<string, string>): BreadcrumbItem[]

// Collapse breadcrumbs for mobile
collapseBreadcrumbs(breadcrumbs: BreadcrumbItem[], maxItems?: number)

// Get page title from breadcrumbs
getPageTitle(breadcrumbs: BreadcrumbItem[]): string

// Check if breadcrumbs should show
shouldShowBreadcrumbs(pathname: string): boolean
```

## Styling

Uses Tailwind CSS utilities following the project's design system:

- Parent breadcrumbs: `text-muted-foreground`
- Current page: `text-foreground font-medium`
- Hover state: `hover:text-foreground`
- Separators: ChevronRight icons
- Home icon for Dashboard

## Performance

- ✅ Lazy loaded in dashboard layout
- ✅ No unnecessary re-renders
- ✅ Client-side only when needed (usePathname)
- ✅ SSR compatible SimpleBreadcrumbs variant

## Future Enhancements

- [ ] i18n support (translation keys)
- [ ] Breadcrumb metadata in page files
- [ ] Custom separator icons per section
- [ ] Breadcrumb schema.org markup for SEO

## Troubleshooting

### Breadcrumbs not showing

1. Check if path is in `hiddenPaths`
2. Verify route exists in `breadcrumbConfig`
3. Check layout integration

### Wrong labels

1. Add custom label to `breadcrumbConfig`
2. Use `customLabels` prop for dynamic routes
3. Check path format (should start with `/`)

### Mobile collapse not working

1. Verify screen width detection
2. Check `maxMobileItems` prop
3. Ensure JavaScript is enabled

## Examples from Codebase

```typescript
// ✅ Dashboard
/dashboard → "Dashboard"

// ✅ Tickets
/tickets → "Dashboard / Tickets"
/tickets/create-ticket → "Dashboard / Tickets / Create Ticket"
/tickets/[id] → "Dashboard / Tickets / [Ticket #1234]"

// ✅ Settings
/settings/profile → "Dashboard / Settings / Profile"
/settings/preferences → "Dashboard / Settings / Preferences"

// ✅ AI Admin
/admin/ai-analytics → "Dashboard / AI & ML Admin / AI Analytics"
/admin/ml-models → "Dashboard / AI & ML Admin / ML Models"
/admin/training-data → "Dashboard / AI & ML Admin / Training Data"

// ✅ Review Queue
/tickets/review-queue → "Dashboard / Tickets / Review Queue"
```

## Contributing

When adding new pages:

1. Add route to `breadcrumbConfig` if custom label needed
2. Add icon if it's a top-level section
3. Mark as `dynamic: true` if route contains `[id]`
4. Test on mobile and desktop
5. Verify accessibility with screen reader
