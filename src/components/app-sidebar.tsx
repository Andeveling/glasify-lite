"use client";

import {
  Factory,
  GlassWater,
  Grid3x3,
  HelpCircle,
  LayoutDashboard,
  Package,
  Search,
  Settings,
  Sparkles,
  Wrench,
} from "lucide-react";
import Link from "next/link";
import type * as React from "react";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
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
} from "@/components/ui/sidebar";

const data = {
  navMain: [
    {
      icon: LayoutDashboard,
      title: "Dashboard",
      url: "/admin",
    },
    {
      icon: Grid3x3,
      title: "Modelos",
      url: "/admin/models",
    },
    {
      icon: GlassWater,
      title: "Tipos de Cristal",
      url: "/admin/glass-types",
    },
    {
      icon: Wrench,
      title: "Servicios",
      url: "/admin/services",
    },
  ],
  navSecondary: [
    {
      icon: Settings,
      title: "Configuración",
      url: "#",
    },
    {
      icon: HelpCircle,
      title: "Ayuda",
      url: "#",
    },
    {
      icon: Search,
      title: "Buscar",
      url: "#",
    },
  ],
  navSuppliers: [
    {
      icon: Factory,
      title: "Proveedores de Perfiles",
      url: "/admin/profile-suppliers",
    },
    {
      icon: Package,
      title: "Proveedores de Vidrio",
      url: "/admin/glass-suppliers",
    },
  ],
  navTaxonomy: [
    {
      icon: Sparkles,
      title: "Soluciones de Vidrio",
      url: "/admin/glass-solutions",
    },
  ],
};

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar: string;
  } | null;
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
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
        <NavMain items={data.navMain} />

        {/* Supplier management */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Proveedores</SidebarGroupLabel>
          <SidebarMenu>
            {data.navSuppliers.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Taxonomy management */}
        <SidebarGroup className="group-data-[collapsible=icon]:hidden">
          <SidebarGroupLabel>Taxonomía</SidebarGroupLabel>
          <SidebarMenu>
            {data.navTaxonomy.map((item) => (
              <SidebarMenuItem key={item.url}>
                <SidebarMenuButton asChild>
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Secondary navigation */}
        <NavSecondary className="mt-auto" items={data.navSecondary} />
      </SidebarContent>
      <SidebarFooter>{user && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
