"use client";
import {
  Laptop, Monitor, Server, Printer, HardDrive, Cpu, Wifi,
  Shield, Key, Lock, Database, Globe, Mail, Phone, Settings,
  Wrench, Package, Folder, Tag, Users, type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  laptop: Laptop,
  monitor: Monitor,
  server: Server,
  printer: Printer,
  'hard-drive': HardDrive,
  harddrive: HardDrive,
  cpu: Cpu,
  wifi: Wifi,
  shield: Shield,
  key: Key,
  lock: Lock,
  database: Database,
  globe: Globe,
  mail: Mail,
  phone: Phone,
  settings: Settings,
  wrench: Wrench,
  package: Package,
  folder: Folder,
  tag: Tag,
  users: Users,
};

interface CategoryIconProps {
  icon: string;
  color?: string;
  className?: string;
}

export function CategoryIcon({ icon, color, className }: CategoryIconProps) {
  if (!icon) {
    return <Tag className={`h-6 w-6 ${className ?? ''}`} style={color ? { color } : undefined} />;
  }
  const isEmoji = /\p{Emoji}/u.test(icon) && icon.length <= 4;
  if (isEmoji) {
    return (
      <span className={`text-2xl leading-none ${className ?? ''}`} style={color ? { color } : undefined}>
        {icon}
      </span>
    );
  }
  const LucideComponent = ICON_MAP[icon.toLowerCase()];
  if (LucideComponent) {
    return <LucideComponent className={`h-6 w-6 ${className ?? ''}`} style={color ? { color } : undefined} />;
  }
  return <Tag className={`h-6 w-6 ${className ?? ''}`} style={color ? { color } : undefined} />;
}
