// for mobile navigation
import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";  
import { cn } from "@/lib/utils";  
import { buttonVariants } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { icons } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MobileNavIcon } from "@/components/mobile-nav-icon";
import { MobileNavLink } from "@/components/mobile-nav-link";
import { MobileNavHeader } from "@/components/mobile-nav-header";
import { MobileNavFooter } from "@/components/mobile-nav-footer";

export function MobileNav() {
    const pathname = usePathname();
    const isHomePage = pathname === "/";
    const [isOpen, setIsOpen] = React.useState(false);
    const toggleOpen = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button
                    className={cn(
                        buttonVariants({ variant: "ghost", size: "sm" }),
                        "mr-2 px-0 text-base hover:bg-transparent focus:bg-transparent focus:outline-none md:hidden"
                    )}
                    onClick={toggleOpen}
                    aria-label="Toggle Menu"
                    type="button"
                    title="Toggle Menu"
                    >
                    <MobileNavIcon isOpen={isOpen} />
                </button>
            </DialogTrigger>
            <DialogContent
                className="sm:top-0 sm:right-0 sm:h-full sm:w-full sm:max-w-sm sm:p-0"
                onClick={close}
                asChild
            >
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: isOpen ? 0 : "100%" }}
                    transition={{ duration: 0.2 }}
                    className="fixed top-0 right-0 z-50 flex h-full w-full flex-col overflow-y-auto bg-background sm:static sm:translate-x-0"   
                    onClick={(e) => e.stopPropagation()}
                >
                    <MobileNavHeader />
                    <div className="flex flex-col gap-6 px-6 py-6">
                        {siteConfig.mainNav?.map((item, index) => (
                            item.href && (
                                <MobileNavLink
                                    key={index}
                                    href={item.href}
                                    title={item.title}
                                    disabled={item.disabled}
                                    active={pathname === item.href}
                                    onClick={close}
                                />
                            )
                        ))}
                        <div className="flex flex-1 flex-col justify-end">
                            <div className="flex gap-4">
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
                            </div>
                            <MobileNavFooter />
                        </div>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
