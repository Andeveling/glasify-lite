'use client';

import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import type { FC } from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  description?: string;
}

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
  navMain: NavItem[];
  navSuppliers: NavItem[];
  navTaxonomy: NavItem[];
}

/**
 * Admin Dashboard Sidebar
 *
 * Customized sidebar for admin catalog management with three navigation sections:
 * 1. Main navigation: Dashboard, Models, Glass Types, Services
 * 2. Suppliers: Profile Suppliers, Glass Suppliers
 * 3. Taxonomy: Glass Solutions, Glass Characteristics
 *
 * Uses Shadcn/ui sidebar primitives with responsive collapsible behavior.
 */
export const AdminSidebar: FC<AdminSidebarProps> = ({ user, navMain, navSuppliers, navTaxonomy, ...props }) => {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/admin">
                <Sparkles className="!size-5" />
                <span className="font-semibold text-base">Glasify Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* Main catalog entities */}
        <NavMain items={navMain} />

        {/* Supplier management */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Proveedores</SidebarGroupLabel>
          <SidebarMenu>
            {navSuppliers.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Taxonomy management */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Taxonomía</SidebarGroupLabel>
          <SidebarMenu>
            {navTaxonomy.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            avatar: user.avatar ?? '/avatars/default.jpg',
            email: user.email,
            name: user.name,
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
};
