// footer component for mobile navigation
import React from "react";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export function MobileNavFooter() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-background/80">
            <ThemeToggle />
            {!isHomePage && (
                <Link
                    href="/"
                    className={cn(buttonVariants({ variant: "outline" }))}
                >
                    Home
                </Link>
            )}
        </div>
    );
}