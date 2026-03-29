import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { ReactQueryProvider } from './providers';
import { Toaster } from '@/components/ui/sonner';
import ThemeProviders from '@/components/theme-provider';

// Lazy load non-critical components for better initial load performance
// Note: In Next.js 15 App Router, default is Server Component, so we use dynamic imports
// without ssr option (it will default to true for SEO benefits)
const ScrollTop = dynamic(() => import('@/components/scrolltop'));
const ConditionalFooter = dynamic(() => import('@/components/layout/ConditionalFooter'));

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'HelpEdge',
  description: 'Manage your workspace',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProviders>
          <ReactQueryProvider>
            <AuthProvider>
              {children}
              <ScrollTop />
              <Toaster />
              <ConditionalFooter />
            </AuthProvider>
          </ReactQueryProvider>
        </ThemeProviders>
      </body>
    </html>
  );
}
