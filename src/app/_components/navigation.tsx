'use client';

import { Calculator, FileText, Menu, Package, Settings, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type NavigationItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  routes?: string[]; // Additional routes that should highlight this item
};

const publicNavigation: NavigationItem[] = [
  {
    description: 'Explora nuestros modelos de vidrio disponibles',
    href: '/catalog',
    icon: Package,
    label: 'Catálogo',
    routes: ['/catalog'],
  },
  {
    description: 'Crea una nueva cotización de vidrios',
    href: '/quote',
    icon: Calculator,
    label: 'Cotizar',
    routes: ['/quote'],
  },
];

const adminNavigation: NavigationItem[] = [
  {
    description: 'Resumen y estadísticas del negocio',
    href: '/dashboard',
    icon: Users,
    label: 'Panel',
  },
  {
    description: 'Gestionar modelos y precios de vidrio',
    href: '/dashboard/models',
    icon: Package,
    label: 'Modelos',
  },
  {
    description: 'Ver y gestionar todas las cotizaciones',
    href: '/dashboard/quotes',
    icon: FileText,
    label: 'Cotizaciones',
  },
  {
    description: 'Configuración del sistema y usuarios',
    href: '/dashboard/settings',
    icon: Settings,
    label: 'Configuración',
  },
];

type MainNavigationProps = {
  variant?: 'public' | 'admin';
  className?: string;
};

function NavigationItems({
  items,
  currentPath,
  onItemClick,
}: {
  items: NavigationItem[];
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

export function MainNavigation({ variant = 'public', className }: MainNavigationProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems = variant === 'admin' ? adminNavigation : publicNavigation;

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav
      aria-label={variant === 'admin' ? 'Navegación del panel administrativo' : 'Navegación principal'}
      className={cn('flex items-center space-x-4', className)}
    >
      {/* Desktop Navigation */}
      <div className="hidden md:flex md:items-center md:space-x-1">
        <NavigationItems currentPath={pathname} items={navigationItems} />
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
                <h2 className="font-semibold text-lg">
                  {variant === 'admin' ? 'Panel Administrativo' : 'Glasify Lite'}
                </h2>
                <p className="text-muted-foreground text-sm" id="mobile-nav-description">
                  {variant === 'admin' ? 'Navegación del panel de control' : 'Cotizador inteligente de vidrios'}
                </p>
              </div>

              <nav className="flex-1 space-y-1 p-4">
                <NavigationItems currentPath={pathname} items={navigationItems} onItemClick={closeMobileMenu} />
              </nav>

              {variant === 'public' && (
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

// Brand/Logo component that can be used alongside MainNavigation
export function BrandLogo({ variant = 'public' }: { variant?: 'public' | 'admin' }) {
  const href = variant === 'admin' ? '/dashboard' : '/';

  return (
    <Link
      aria-label="Ir a la página principal"
      className="flex items-center space-x-2 font-bold text-lg hover:opacity-80 focus-visible:opacity-80 focus-visible:outline-none"
      href={href}
    >
      <Package aria-hidden="true" className="h-6 w-6 text-primary" />
      <span>Glasify Lite</span>
    </Link>
  );
}
