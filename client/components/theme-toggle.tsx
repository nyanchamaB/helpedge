// for theme toggle
import * as React from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { SunIcon, MoonIcon } from "lucide-react";

export function ThemeToggle() {
    const { setTheme, theme } = useTheme();
    return (
        <button
            className={cn(buttonVariants({ variant: "ghost" }))}
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        >
            <SunIcon className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <MoonIcon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
        </button>
    );
}
                                    
                                