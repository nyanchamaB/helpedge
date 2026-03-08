// components/breadcrumb.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight} from "lucide-react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";

export function Breadcrumb() {
  const pathname = usePathname();
  
  // Don't show breadcrumbs on dashboard home
{/*  if (pathname === "/dashboard") {
    return null;
  }
    */}
  
  // Generate breadcrumb items from pathname
  const pathSegments = pathname.split("/").filter(Boolean);
  
  // Create breadcrumb items
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    
    // Convert slug to title
    // "create-ticket" -> "Create Ticket"
    // "my-tickets" -> "My Tickets"
    const label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    return { href, label };
  });

  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {/* Home/Dashboard link */}
      <Link 
        href="/dashboard" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <span className="sr-only">Dashboard</span>
      </Link>

      {/* Breadcrumb items */}
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1; // Last item is the current page, so it shouldn't be a link
        
        return (
          <Fragment key={item.href}>
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="font-medium text-foreground">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href}
                className="hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}