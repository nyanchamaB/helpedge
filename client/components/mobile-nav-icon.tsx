// navigation icon for mobile view
import React from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/mobile-nav";

export function MobileNavIcon() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    return (
        <div className="flex items-center justify-between px-4 py-2 bg-background border-b">
            <Link href="/" className="flex items-center space-x-2">
                <Icons.logo className="h-6 w-6" />
                <span className="font-bold">{siteConfig.name}</span>
            </Link>
            <div className="flex items-center space-x-4">
                <ThemeToggle />
                {siteConfig.links.github && (
                    <Link
                        href={siteConfig.links.github}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ size: "sm", variant: "ghost" }))}
                    >
                        <span className="sr-only">GitHub</span>
                        <Icons.github className="h-5 w-5" />
                    </Link>
                )}
                {!isHomePage && (
                    <Link
                        href="/"
                        className={cn(buttonVariants({ size: "sm" }))}
                    >
                        Home
                    </Link>
                )}
                <MobileNav />
            </div>
        </div>
    );
    }
    
