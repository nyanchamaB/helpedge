"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/app/onboarding/footer").then(mod => mod.default), {
  ssr: false,
});

// Only show footer on the landing page
const SHOW_FOOTER_ROUTES = ["/"];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Only show footer on landing page (root path)
  const shouldShowFooter = SHOW_FOOTER_ROUTES.includes(pathname || "");

  if (!shouldShowFooter) {
    return null;
  }

  return <Footer />;
}
