import Link from 'next/link';
import { CartIndicator } from '@/app/_components/cart-indicator';
import { auth } from '@/server/auth';
import { GuestMenu } from './guest-menu';
import { UserMenu } from './user-menu';

export default async function Header() {
  const session = await auth();

  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo y Navegación Principal */}
          <div className="flex items-center gap-8">
            <Link className="flex items-center" href="/catalog">
              <span className="font-bold text-xl tracking-tight">GLASIFY</span>
            </Link>
            <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
              <Link className="text-foreground/80 text-sm transition-colors hover:text-foreground" href="/catalog">
                Catálogo
              </Link>
              <Link className="text-foreground/80 text-sm transition-colors hover:text-foreground" href="/quote">
                Cotizar
              </Link>
              {session?.user && (
                <Link className="text-foreground/80 text-sm transition-colors hover:text-foreground" href="/my-quotes">
                  Mis Cotizaciones
                </Link>
              )}
            </nav>
          </div>

          {/* Acciones: Carrito y Menú de Usuario */}
          <div className="flex items-center gap-3">
            <CartIndicator variant="compact" />
            {session?.user ? <UserMenu userEmail={session.user.email} userName={session.user.name} /> : <GuestMenu />}
          </div>
        </div>
      </div>
    </header>
  );
}
