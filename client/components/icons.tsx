// for icons, see https://react-icons.github.io/react-icons/
import {
  LucideIcon,
  Loader2,
  MoonIcon,
  SunIcon,
  ArrowRight,
  ArrowLeft,
  ArrowUp,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';
import { siteConfig as _siteConfig } from '@/config/site';
import Image from 'next/image';
import { IconType } from 'react-icons';
import { TbBrandVercel } from 'react-icons/tb';
import {
  SiOpenai,
  SiNextdotjs,
  SiTailwindcss,
  SiTypescript,
  SiReact,
  SiNodedotjs,
  SiJavascript,
  SiExpress,
  SiMongodb,
  SiPrisma,
  SiPostgresql,
  SiRedis,
  SiDocker,
  SiKubernetes,
} from 'react-icons/si';
import {
  FaGoogle,
  FaHome,
  FaRegLightbulb,
  FaBookOpen,
  FaLifeRing,
  FaUserPlus,
} from 'react-icons/fa';
export type Icons = LucideIcon | IconType;

export function Icons(props: { icon: Icons; className?: string }) {
  const Icon = props.icon;

  return <Icon className={cn('h-6 w-6', props.className)} />;
}

export function Logo(props: { className?: string }) {
  return <Image src="/globe.svg" alt="Logo" width={24} height={24} className={cn('h-6 w-6', props.className)} />;
}
export const IconsList = {
  logo: Logo,
  sun: SunIcon,
  moon: MoonIcon,
  loader: Loader2,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  arrowUp: ArrowUp,
  menu: Menu,
  close: X,
  loading: Loader2,
  openai: SiOpenai,
  google: FaGoogle,
  vercel: TbBrandVercel,
  nextjs: SiNextdotjs,
  tailwindcss: SiTailwindcss,
  typescript: SiTypescript,
  react: SiReact,
  nodejs: SiNodedotjs,
  javascript: SiJavascript,
  express: SiExpress,
  mongodb: SiMongodb,
  prisma: SiPrisma,
  postgresql: SiPostgresql,
  redis: SiRedis,
  docker: SiDocker,
  kubernetes: SiKubernetes,
  //  icons for landing page navigation
  home: FaHome,
  features: FaRegLightbulb,
  resources: FaBookOpen,
  support: FaLifeRing,
  signup: FaUserPlus,
};
