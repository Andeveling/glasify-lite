import type { UserRole } from "@prisma/generated/client"
import { headers } from "next/headers"
import { auth } from "@/server/auth"

/**
 * Icon names for navigation
 * Serializable string literals that can pass from Server to Client Components
 */
export type IconName =
  | "LayoutDashboard"
  | "Package"
  | "FileText"
  | "Settings"
  | "Calculator"
  | "Glasses"

/**
 * Navigation Item Type
 * Defines the structure of a navigation link
 * Uses icon name (string) instead of component to be serializable
 */
export type NavLink = {
  href: string
  label: string
  icon: IconName // Changed from React.ComponentType to string
  description: string
  routes?: string[] // Additional routes that should highlight this item
}

/**
 * Get Navigation Links for Role
 * Task: T031 [US4]
 *
 * Pure function that returns NavLink[] based on user role.
 * This is the single source of truth for role-based navigation.
 *
 * Role Navigation Rules:
 * - Admin: Dashboard only (internal B2B tool)
 * - Seller: Cotizaciones (all quotes)
 * - Unauthenticated: Sign In only
 *
 * @param role - User role from session (or undefined if not authenticated)
 * @returns Array of navigation links appropriate for the role
 */
export function getNavLinksForRole(role: UserRole | undefined): NavLink[] {
  // Admin navigation: Internal B2B tool - dashboard and management only
  if (role === "admin") {
    return [
      {
        description: "Resumen y estadísticas del negocio",
        href: "/admin",
        icon: "LayoutDashboard",
        label: "Dashboard",
      },
    ]
  }

  // Seller navigation: Access to all quotes (client-scoped now via clientId)
  if (role === "seller") {
    return [
      {
        description: "Ver todas las cotizaciones de clientes",
        href: "/dashboard/quotes",
        icon: "FileText",
        label: "Cotizaciones",
        routes: ["/dashboard/quotes"],
      },
    ]
  }

  // Unauthenticated user: redirect to signin
  return []
}

/**
 * Role-Based Navigation
 * Task: T030 [US4]
 *
 * Server Component that gets session, determines user role,
 * and renders navigation appropriate for that role.
 *
 * This component is the entry point for role-based navigation.
 * It delegates to getNavLinksForRole() for link filtering logic.
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
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  const userRole = session?.user?.role as UserRole | undefined

  // Get navigation links based on user role
  const navLinks = getNavLinksForRole(userRole)

  // Render minimal navigation - no public catalog anymore (B2B internal tool)
  if (navLinks.length === 0) {
    return null
  }

  return (
    <nav className={className}>
      {navLinks.map((link) => (
        <a key={link.href} href={link.href}>
          {link.label}
        </a>
      ))}
    </nav>
  )
}
