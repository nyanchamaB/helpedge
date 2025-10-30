// mobile navigation link component
import React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { usePathname } from "next/navigation";
import Link from "next/link";

interface MobileNavLinkProps extends React.ComponentProps<"a"> {
    href: string;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

export function MobileNavLink({ href, children, icon, ...props }: MobileNavLinkProps) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            className={cn(
                "flex items-center space-x-2 px-4 py-2 text-sm transition-colors",
                isActive ? "text-primary font-medium" : "text-secondary hover:text-primary"
            )}
            {...props}
        >
            {icon && <span className="flex-shrink-0">{icon}</span>}
            <span>{children}</span>
        </Link>
    );
}