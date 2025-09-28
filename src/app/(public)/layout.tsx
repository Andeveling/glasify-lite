import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Main Navigation */}
      <header className="border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
          <div className="flex gap-6 md:gap-10">
            <Link className="flex items-center space-x-2" href="/catalog">
              <span className="inline-block font-bold">Glasify</span>
            </Link>
            <nav className="flex gap-6">
              <Button asChild size="sm" variant="ghost">
                <Link href="/catalog">Catálogo</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/quote">Cotizar</Link>
              </Button>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/signin">Iniciar Sesión</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-border border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <p className="text-center text-muted-foreground text-sm leading-loose md:text-left">
              © 2025 Glasify Lite. Cotizador inteligente de productos de vidrio.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild size="sm" variant="ghost">
              <Link href="/catalog">Catálogo</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/quote">Cotizar</Link>
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
