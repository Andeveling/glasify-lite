'use client';

import { Factory, GlassWater, Grid3x3, Package, Settings, Sparkles, Wrench } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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

interface AdminSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string;
    email: string;
    avatar?: string;
  };
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
export const AdminSidebar: FC<AdminSidebarProps> = ({ user, ...props }) => {
  const pathname = usePathname();

  // Navigation configuration (must be in Client Component to use Lucide icons)
  const navMain = [
    {
      icon: Settings,
      title: 'Dashboard',
      url: '/admin',
    },
    {
      description: 'Ventanas y puertas',
      icon: Grid3x3,
      title: 'Modelos',
      url: '/admin/models',
    },
    {
      description: 'Configuraciones de vidrio',
      icon: GlassWater,
      title: 'Tipos de Vidrio',
      url: '/admin/glass-types',
    },
    {
      description: 'Servicios adicionales',
      icon: Wrench,
      title: 'Servicios',
      url: '/admin/services',
    },
  ];

  const navSuppliers = [
    {
      description: 'Fabricantes de perfiles',
      icon: Factory,
      title: 'Proveedores de Perfiles',
      url: '/admin/profile-suppliers',
    },
    {
      description: 'Fabricantes de vidrio',
      icon: Package,
      title: 'Proveedores de Vidrio',
      url: '/admin/glass-suppliers',
    },
  ];

  const navTaxonomy = [
    {
      description: 'Categorización por uso',
      icon: Sparkles,
      title: 'Soluciones de Vidrio',
      url: '/admin/glass-solutions',
    },
    {
      description: 'Propiedades del vidrio',
      icon: Settings,
      title: 'Características de Vidrio',
      url: '/admin/glass-characteristics',
    },
  ];

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/admin">
                <Sparkles className="!size-5" />
                <span className="font-semibold text-base">Glasify Admin</span>
              </Link>
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
            {navSuppliers.map((item) => {
              // Prevent top-level '/admin' from matching all child routes.
              // Only allow prefix matching for items with at least two segments (e.g. '/admin/profile-suppliers').
              const segmentsCount = item.url.split('/').filter(Boolean).length;
              const isActive = pathname === item.url || (segmentsCount > 1 && pathname.startsWith(`${item.url}/`));

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* Taxonomy management */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Taxonomía</SidebarGroupLabel>
          <SidebarMenu>
            {navTaxonomy.map((item) => {
              const segmentsCount = item.url.split('/').filter(Boolean).length;
              const isActive = pathname === item.url || (segmentsCount > 1 && pathname.startsWith(`${item.url}/`));

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
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
