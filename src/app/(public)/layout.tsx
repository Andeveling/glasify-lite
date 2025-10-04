import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-screen flex-col">
      {/* Minimalist Navigation - Saleor Style */}
      <header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-7xl">
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            {/* Logo & Navigation */}
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
              <Button asChild className="text-sm" size="sm" variant="ghost">
                <Link href="/signin">Iniciar Sesión</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Minimalist Footer - Saleor Style */}
      <footer className="border-border border-t bg-background">
        <div className="container mx-auto px-4 py-12 md:px-6">
          <div className="grid gap-8 md:grid-cols-3">
            {/* Company Info */}
            <div>
              <h3 className="mb-4 font-semibold text-sm">Glasify</h3>
              <ul className="space-y-2 text-foreground/60 text-sm">
                <li>
                  <Link className="transition-colors hover:text-foreground" href="/catalog">
                    Acerca de
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-foreground" href="/catalog">
                    Documentación
                  </Link>
                </li>
              </ul>
            </div>

            {/* Products */}
            <div>
              <h3 className="mb-4 font-semibold text-sm">Productos</h3>
              <ul className="space-y-2 text-foreground/60 text-sm">
                <li>
                  <Link className="transition-colors hover:text-foreground" href="/catalog">
                    Catálogo completo
                  </Link>
                </li>
                <li>
                  <Link className="transition-colors hover:text-foreground" href="/quote">
                    Cotizador
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-foreground/60 text-sm">
                © 2025 Glasify Lite
                <br />
                Cotizador inteligente de productos de vidrio para arquitectos e ingenieros.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
