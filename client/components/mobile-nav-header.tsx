// mobile header component
import React from "react";
import { cn } from "@/lib/utils";
import { Icons, IconsList } from "@/components/icons";
import { siteConfig } from "@/config/site";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNavHeader() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";

    return (
        <div className="flex items-center justify-between px-6 py-4 border-b bg-background">
            <div className="flex items-center space-x-4">
                {siteConfig.navlinks.map((link, index) => (
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
            <IconsList.moon className="h-5 w-5" />
            {!isHomePage && (
                <Link
                    href="/"
                    className={cn("text-sm font-medium")}
                >
                    Home
                </Link>
            )}
        </div>
    );
}