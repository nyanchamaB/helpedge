//header component for mobile navigation
import React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

export function MobileNavHeader() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <div className="flex items-center justify-between px-6 py-4 border-t bg-background">
            <div className="flex items-center space-x-4">
                {siteConfig.footerLinks.map((link, index) => (
                    <Link
                        key={index}
                        href={link.href}
                        className={cn(
                            "text-sm transition-colors hover:text-foreground/80",
                            pathname === link.href && "font-medium"
                        )}
                    >
                        {link.title}
                    </Link>
                ))}
            </div>
            <div className="flex items-center space-x-4">
                <Icons.github className="h-5 w-5" />
                {!isHomePage && (
                    <Link
                        href="/"
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Home
                    </Link>
                )}
                <ThemeToggle />
                <MobileNav />
            </div>
        </div>
    );
}