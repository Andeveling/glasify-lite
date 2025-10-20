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
 * Navigation configuration is now in AdminSidebar (Client Component) to avoid
 * Next.js 15 serialization errors with Lucide icon components.
 *
 * @see https://ui.shadcn.com/blocks - dashboard-01 block
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Verify admin role (defense-in-depth: middleware also checks)
  const session = await auth();

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/signin?callbackUrl=/admin');
  }

  return (
    <SidebarProvider defaultOpen>
      <AdminSidebar
        user={{
          avatar: session.user.image ?? undefined,
          email: session.user.email ?? '',
          name: session.user.name ?? 'Admin',
        }}
      />
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-6">
          <AdminBreadcrumbs />
        </header>
        <main className='flex flex-1 flex-col gap-4 p-4'>{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
