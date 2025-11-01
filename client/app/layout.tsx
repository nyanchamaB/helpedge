import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ScrollTop from "@/components/scrolltop";
import Footer from "./onboarding/footer";
import { SessionWrapper } from "@/components/SessionWrapper"; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HelpEdge",
  description: "Manage your workspace",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* ✅ Wrap everything in SessionWrapper */}
        <SessionWrapper>
          {children}
          <ScrollTop />
          <Footer />
        </SessionWrapper>
      </body>
    </html>
  );
}
