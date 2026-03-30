// for  mobile navigation
import React, { useState } from 'react';
import { cn as _cn } from '@/lib/utils';
import { Icons as _Icons } from '@/components/icons';
import { MobileNavHeader as _MobileNavHeader } from '@/components/mobile-nav-header';
import { MobileNavLink } from '@/components/mobile-nav-link';
import { MobileNavFooter } from '@/components/mobile-nav-footer';
import { siteConfig } from '@/config/site';
import { usePathname as _usePathname } from 'next/navigation';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { buttonVariants as _buttonVariants } from '@/components/ui/button';
import _Link from 'next/link';
import { ThemeToggle as _ThemeToggle } from '@/components/theme-toggle';
import { MobileNavIcon } from '@/components/mobile-nav-icon';

export function MobileNav({ links: _links }: { links: { href: string; title: string }[] }) {
  const _pathname = _usePathname();
  const [open, setOpen] = useState(false);
  const _toggleOpen = () => setOpen(!open);

  return (
    <div className="md:hidden">
      <MobileNavIcon />
      <AnimatePresence>
        {open && (
          <LazyMotion features={domAnimation} strict>
            <m.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
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
            </m.div>
          </LazyMotion>
        )}
      </AnimatePresence>
    </div>
  );
}
