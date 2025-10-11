import { User } from 'lucide-react';
import Link from 'next/link';
import { CartIndicator } from '@/app/_components/cart-indicator';
import { ModeToggle } from '@/app/_components/mode-toggle';
import { Button } from '@/components/ui/button';
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl">
        <div className="flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-8">
            <Link className="flex items-center" href="/catalog">
              <span className="font-bold text-xl tracking-tight">GLASIFY</span>
            </Link>
            <nav aria-label="Navegación principal" className="hidden items-center gap-6 md:flex">
              <Link className="text-foreground/80 text-sm transition-colors hover:text-foreground" href="/catalog">
                Todos los productos
              </Link>
              <Link className="text-foreground/80 text-sm transition-colors hover:text-foreground" href="/quote">
                Cotizar
              </Link>
            </nav>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <CartIndicator variant="compact" />
            <ModeToggle />
            <Button aria-label="Iniciar sesión" asChild className="text-sm" size="icon" variant="outline">
              <Link href="/signin">
                <User className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
