'use client';

import type { UserRole } from '@prisma/client';
import { Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { NavLink } from './role-based-nav';

/**
 * Navigation Items Component
 * Renders a list of navigation links with active state highlighting
 */
function NavigationItems({
  items,
  currentPath,
  onItemClick,
}: {
  items: NavLink[];
  currentPath: string;
  onItemClick?: () => void;
}) {
  return (
    <>
      {items.map((item) => {
        const isActive = currentPath === item.href || item.routes?.some((route) => currentPath.startsWith(route));

        return (
          <Link
            aria-current={isActive ? 'page' : undefined}
            aria-describedby={`nav-desc-${item.href.replace(/\//g, '-')}`}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 font-medium text-sm transition-colors',
              'hover:bg-muted focus-visible:bg-muted focus-visible:outline-none',
              isActive ? 'bg-muted text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
            href={item.href}
            key={item.href}
            onClick={onItemClick}
          >
            <item.icon aria-hidden="true" className="h-4 w-4" />
            {item.label}
            <span className="sr-only" id={`nav-desc-${item.href.replace(/\//g, '-')}`}>
              {item.description}
            </span>
          </Link>
        );
      })}
    </>
  );
}

/**
 * Navigation Menu Component
 * Task: T032 [US4]
 *
 * Client Component that renders navigation menu with mobile toggle.
 * Receives navigation links as props from RoleBasedNav server component.
 *
 * Features:
 * - Responsive design (desktop + mobile)
 * - Mobile sheet with hamburger menu
 * - Active route highlighting
 * - Accessible (ARIA labels, keyboard navigation)
 * - Spanish labels
 *
 * This is a pure presentational component - it doesn't know about roles,
 * it just renders the links it receives.
 *
 * @param links - Array of navigation links to render
 * @param userRole - Current user role (for UI customization)
 * @param className - Optional CSS class for styling
 */
export function NavigationMenu({
  links,
  userRole,
  className,
}: {
  links: NavLink[];
  userRole?: UserRole;
  className?: string;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Determine menu title based on role
  const getMenuTitle = () => {
    if (userRole === 'admin') return 'Panel Administrativo';
    if (userRole === 'seller') return 'Portal de Vendedor';
    return 'Glasify Lite';
  };

  // Determine menu description based on role
  const getMenuDescription = () => {
    if (userRole === 'admin') return 'Navegación del panel de control';
    if (userRole === 'seller') return 'Gestiona tus cotizaciones';
    return 'Cotizador inteligente de vidrios';
  };

  const menuTitle = getMenuTitle();
  const menuDescription = getMenuDescription();
  const isAuthenticated = !!userRole;

  return (
    <nav
      aria-label={userRole === 'admin' ? 'Navegación del panel administrativo' : 'Navegación principal'}
      className={cn('flex items-center space-x-4', className)}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-1">
        <NavigationItems currentPath={pathname} items={links} />
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet onOpenChange={setMobileMenuOpen} open={mobileMenuOpen}>
          <SheetTrigger asChild>
            <Button aria-label="Abrir menú de navegación" size="sm" variant="outline">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>

          <SheetContent aria-describedby="mobile-nav-description" className="w-64 p-0" side="left">
            <div className="flex h-full flex-col">
              <div className="border-b p-4">
                <h2 className="font-semibold text-lg">{menuTitle}</h2>
                <p className="text-muted-foreground text-sm" id="mobile-nav-description">
                  {menuDescription}
                </p>
              </div>

              <nav className="flex-1 space-y-1 p-4">
                <NavigationItems currentPath={pathname} items={links} onItemClick={closeMobileMenu} />
              </nav>

              {/* Sign In button for unauthenticated users */}
              {!isAuthenticated && (
                <div className="border-t p-4">
                  <Link
                    className="flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 font-medium text-primary-foreground text-sm hover:bg-primary/90"
                    href="/signin"
                    onClick={closeMobileMenu}
                  >
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
