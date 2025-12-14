"use client";

import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

const Footer = dynamic(() => import("@/app/onboarding/footer"));

// Routes where footer should be hidden
const HIDE_FOOTER_ROUTES = [
  "/dashboard",
  "/tickets",
  "/serive-requests",
  "/service-categories",
  "/team",
  "/reports",
  "/systems",
  "/security",
  "/knowledge-base",
  "/settings",
  "/auth",
];

export default function ConditionalFooter() {
  const pathname = usePathname();

  // Hide footer on dashboard and related routes
  const shouldHideFooter = HIDE_FOOTER_ROUTES.some((route) =>
    pathname?.startsWith(route)
  );

  if (shouldHideFooter) {
    return null;
  }

  return <Footer />;
}
