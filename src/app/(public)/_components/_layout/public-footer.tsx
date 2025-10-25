import Link from 'next/link';

export default function PublicFooter() {
  return (
    <footer className="border-border border-t bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:px-6">
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
              Cotizador inteligente de productos de cristal para arquitectos e ingenieros.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
