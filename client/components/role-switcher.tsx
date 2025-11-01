"use client";
import * as React from 'react';
import { useState } from 'react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';

import Image from 'next/image';

export function RoleSwitcher({ className }: { className?: string }) {
    const [selectedRole, setSelectedRole] = useState<string | null>(null);
    const roles = ['end_user', 'agent', 'admin'];   
    const handleRoleChange = (role: string) => {
        setSelectedRole(role);

        // Optionally, you can add logic to notify the server of the role change
        // e.g., update user session or preferences
    }
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton size="sm"  className={`data-[state=open]:bg-secondary w-full justify-start ${className || ''}`}>  
                    <div className="mr-2">
                        <Image src={`/roles/${selectedRole || 'end_user'}.svg`} alt="Role Icon" width={24} height={24} />
                    </div>
                    <div className = "grid flex-1 text-left text-sm leading-tight">
                        <span className="font-medium">{selectedRole ? selectedRole.replace('_', ' ') : 'Select Role'}</span>
                    </div>
                </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>

    );
}