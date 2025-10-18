import {
  IconBuildingFactory2,
  IconGlass,
  IconPackage,
  IconSettings,
  IconSparkles,
  IconTool,
  IconWindow,
} from '@tabler/icons-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { auth } from '@/server/auth';
import { AdminBreadcrumbs } from './_components/admin-breadcrumbs';
import { AdminSidebar } from './_components/admin-sidebar';

export const metadata: Metadata = {
  description: 'Panel de administración para gestionar catálogo de productos',
  robots: 'noindex, nofollow', // Admin pages should not be indexed
  title: 'Admin Dashboard | Glasify Lite',
};

/**
 * Admin Dashboard Layout
 *
 * Provides consistent sidebar navigation and content container for all admin pages.
 * Uses Shadcn/ui AppSidebar component with standardized navigation structure.
 *
 * Navigation includes all 7 catalog entity types:
 * - Models (window/door products)
 * - Glass Types (glass configurations)
 * - Services (additional services)
 * - Profile Suppliers (window/door manufacturers)
 * - Glass Suppliers (glass manufacturers)
 * - Glass Solutions (categorization taxonomy)
 * - Glass Characteristics (flexible property tagging)
 *
 * @see https://ui.shadcn.com/blocks - dashboard-01 block
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verify admin role (defense-in-depth: middleware also checks)
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/signin?callbackUrl=/admin');
  }

  // Admin navigation structure
  const navMain = [
    {
      icon: IconSettings,
      title: 'Dashboard',
      url: '/admin',
    },
    {
      description: 'Ventanas y puertas',
      icon: IconWindow,
      title: 'Modelos',
      url: '/admin/models',
    },
    {
      description: 'Configuraciones de vidrio',
      icon: IconGlass,
      title: 'Tipos de Vidrio',
      url: '/admin/glass-types',
    },
    {
      description: 'Servicios adicionales',
      icon: IconTool,
      title: 'Servicios',
      url: '/admin/services',
    },
  ];

  const navSuppliers = [
    {
      description: 'Fabricantes de perfiles',
      icon: IconBuildingFactory2,
      title: 'Proveedores de Perfiles',
      url: '/admin/profile-suppliers',
    },
    {
      description: 'Fabricantes de vidrio',
      icon: IconPackage,
      title: 'Proveedores de Vidrio',
      url: '/admin/glass-suppliers',
    },
  ];

  const navTaxonomy = [
    {
      description: 'Categorización por uso',
      icon: IconSparkles,
      title: 'Soluciones de Vidrio',
      url: '/admin/glass-solutions',
    },
    {
      description: 'Propiedades del vidrio',
      icon: IconSettings,
      title: 'Características de Vidrio',
      url: '/admin/glass-characteristics',
    },
  ];

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar
        navMain={navMain}
        navSuppliers={navSuppliers}
        navTaxonomy={navTaxonomy}
        user={{
          avatar: session.user.image ?? undefined,
          email: session.user.email ?? '',
          name: session.user.name ?? 'Admin',
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <AdminBreadcrumbs />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
