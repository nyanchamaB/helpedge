// components/layout/Sidebar.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  BarChart3,
  Tag
} from 'lucide-react';

interface SidebarProps {
  userRole: string;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>(['tickets']);

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      roles: ['admin', 'agent', 'end_user']
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: Ticket,
      roles: ['admin', 'agent', 'end_user'],
      children: [
        { label: 'All Tickets', href: '/tickets', roles: ['admin', 'agent'] },
        { label: 'My Tickets', href: '/tickets/my', roles: ['admin', 'agent', 'end_user'] },
        { label: 'Create Ticket', href: '/tickets/create', roles: ['admin', 'agent', 'end_user'] },
        { label: 'Assigned to Me', href: '/tickets/assigned', roles: ['admin', 'agent'] }
      ]
    },
    {
      id: 'users',
      label: 'Users',
      icon: Users,
      href: '/users',
      roles: ['admin', 'agent']
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tag,
      href: '/categories',
      roles: ['admin']
    },
    {
      id: 'knowledge',
      label: 'Knowledge Base',
      icon: HelpCircle,
      href: '/knowledge',
      roles: ['admin', 'agent', 'end_user']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: BarChart3,
      href: '/reports',
      roles: ['admin', 'agent']
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      roles: ['admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 h-full">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">H</span>
          </div>
          <span className="text-xl font-bold text-gray-900">HelpEdge</span>
        </Link>
      </div>

      <nav className="px-4 space-y-1">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          const isExpanded = expandedItems.includes(item.id);
          const hasChildren = item.children && item.children.length > 0;

          return (
            <div key={item.id}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-3" />
                  {item.label}
                </Link>
              )}

              {hasChildren && isExpanded && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.children!
                    .filter(child => child.roles.includes(userRole))
                    .map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                          pathname === child.href
                            ? 'bg-blue-50 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        {child.label}
                      </Link>
                    ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}