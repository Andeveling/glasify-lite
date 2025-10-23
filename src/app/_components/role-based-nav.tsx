import type { UserRole } from '@prisma/client';
import { auth } from '@/server/auth';
import { NavigationMenu } from './navigation-menu';

/**
 * Icon names for navigation
 * Serializable string literals that can pass from Server to Client Components
 */
export type IconName =
  | 'LayoutDashboard'
  | 'Package'
  | 'FileText'
  | 'Settings'
  | 'Calculator'
  | 'Glasses';

/**
 * Navigation Item Type
 * Defines the structure of a navigation link
 * Uses icon name (string) instead of component to be serializable
 */
export type NavLink = {
  href: string;
  label: string;
  icon: IconName; // Changed from React.ComponentType to string
  description: string;
  routes?: string[]; // Additional routes that should highlight this item
};

/**
 * Get Navigation Links for Role
 * Task: T031 [US4]
 *
 * Pure function that returns NavLink[] based on user role.
 * This is the single source of truth for role-based navigation.
 *
 * Role Navigation Rules:
 * - Admin: Dashboard, Modelos, Cotizaciones, Configuración
 * - Seller: Mis Cotizaciones, Catálogo
 * - User: Catálogo, Mis Cotizaciones
 * - Unauthenticated: Catálogo, Cotizar
 *
 * @param role - User role from session (or undefined if not authenticated)
 * @returns Array of navigation links appropriate for the role
 */
export function getNavLinksForRole(role: UserRole | undefined): NavLink[] {
  // Admin navigation: Full access to dashboard and management
  if (role === 'admin') {
    return [
      {
        description: 'Resumen y estadísticas del negocio',
        href: '/admin',
        icon: 'LayoutDashboard',
        label: 'Dashboard',
      },
      {
        description: 'Gestionar modelos y precios de vidrio',
        href: '/admin/models',
        icon: 'Package',
        label: 'Modelos',
      },
      {
        description: 'Ver y gestionar todas las cotizaciones',
        href: '/dashboard/quotes',
        icon: 'FileText',
        label: 'Cotizaciones',
      },
      {
        description: 'Configuración del sistema',
        href: '/dashboard/settings',
        icon: 'Settings',
        label: 'Configuración',
      },
    ];
  }

  // Seller navigation: Access to all quotes, users, and catalog (no models/settings)
  if (role === 'seller') {
    return [
      {
        description: 'Ver todas las cotizaciones de clientes',
        href: '/dashboard/quotes',
        icon: 'FileText',
        label: 'Cotizaciones',
        routes: [ '/dashboard/quotes' ],
      },
      {
        description: 'Explorar catálogo de productos',
        href: '/catalog',
        icon: 'Package',
        label: 'Catálogo',
        routes: [ '/catalog' ],
      },
      {
        description: 'Descubrir soluciones de vidrio especializadas',
        href: '/glasses/solutions',
        icon: 'Glasses',
        label: 'Soluciones',
        routes: [ '/glasses/solutions' ],
      },
    ];
  }

  // User (authenticated client) navigation: Catalog and own quotes
  if (role === 'user') {
    return [
      {
        description: 'Explorar catálogo de productos',
        href: '/catalog',
        icon: 'Package',
        label: 'Catálogo',
        routes: [ '/catalog' ],
      },
      {
        description: 'Descubrir soluciones de vidrio especializadas',
        href: '/glasses/solutions',
        icon: 'Glasses',
        label: 'Soluciones',
        routes: [ '/glasses/solutions' ],
      },
      {
        description: 'Ver mis cotizaciones',
        href: '/my-quotes',
        icon: 'FileText',
        label: 'Mis Cotizaciones',
        routes: [ '/my-quotes' ],
      },
    ];
  }

  // Unauthenticated user navigation: Public routes only
  return [
    {
      description: 'Explorar catálogo de productos',
      href: '/catalog',
      icon: 'Package',
      label: 'Catálogo',
      routes: [ '/catalog' ],
    },
    {
      description: 'Descubrir soluciones de vidrio especializadas',
      href: '/glasses/solutions',
      icon: 'Glasses',
      label: 'Soluciones',
      routes: [ '/glasses/solutions' ],
    }
  ];
}

/**
 * Role-Based Navigation
 * Task: T030 [US4]
 *
 * Server Component that gets session, determines user role,
 * and renders navigation appropriate for that role.
 *
 * This component is the entry point for role-based navigation.
 * It delegates to getNavLinksForRole() for link filtering logic
 * and NavigationMenu for UI rendering.
 *
 * Benefits:
 * - Server-side session access (no client-side auth checks)
 * - Type-safe role checking
 * - Single source of truth for navigation structure
 * - Easy to test (pure function for link filtering)
 *
 * @returns Navigation menu with role-appropriate links
 */
export async function RoleBasedNav({ className }: { className?: string }) {
  const session = await auth();
  const userRole = session?.user?.role;

  // Get navigation links based on user role
  const navLinks = getNavLinksForRole(userRole);

  // Render navigation menu with filtered links
  return <NavigationMenu className={className} links={navLinks} userRole={userRole} />;
}
