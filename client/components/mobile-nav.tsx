// for  mobile navigation
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { MobileNavHeader } from "@/components/mobile-nav-header";
import { MobileNavLink } from "@/components/mobile-nav-link";
import { MobileNavFooter } from "@/components/mobile-nav-footer";
import { siteConfig } from "@/config/site";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import Link from "next/link";   
import { ThemeToggle } from "@/components/theme-toggle";    
import { MobileNavIcon } from "@/components/mobile-nav-icon";   

export function MobileNav({ links }: { links: { href: string; title: string }[] }) {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const toggleOpen = () => setOpen(!open);
    return (
        <div className="md:hidden">
            <MobileNavIcon />
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute top-16 left-0 w-full bg-background border-b z-50"
                    >
                        <div className="flex flex-col space-y-1 py-2">
                            {siteConfig.mainNav.map((link, index) => (
                                <MobileNavLink
                                    key={index}
                                    href={link.href}
                                   // icon={link.icon ? <link.icon className="h-5 w-5" /> : null}
                                >
                                    {link.title}
                                </MobileNavLink>
                            ))}
                        </div>
                        <MobileNavFooter />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}