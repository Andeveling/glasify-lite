import { Mail, MapPin, Package, Phone } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type FooterProps = {
  variant?: 'full' | 'minimal';
  className?: string;
};

// Use a static year to prevent hydration mismatches
// Update this annually or use a more dynamic approach after hydration
const CURRENT_YEAR = 2024;

export function Footer({ variant = 'full', className }: FooterProps) {
  if (variant === 'minimal') {
    return (
      <footer className={cn('border-t bg-background px-4 py-6', className)}>
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 text-muted-foreground text-sm">
            <Package aria-hidden="true" className="h-4 w-4 text-primary" />
            <span>© {CURRENT_YEAR} Glasify Lite</span>
            <span>•</span>
            <span>Cotizador inteligente de cristales</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className={cn('border-t bg-background', className)}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 font-bold text-lg">
              <Package aria-hidden="true" className="h-6 w-6 text-primary" />
              <span>Glasify Lite</span>
            </div>

            <p className="mt-2 max-w-md text-muted-foreground text-sm">
              Cotizador inteligente de cristales para profesionales y clientes. Calcula precios en tiempo real con los
              mejores modelos disponibles en el mercado.
            </p>

            <div className="mt-4 space-y-2">
              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Mail aria-hidden="true" className="h-4 w-4" />
                <a
                  aria-label="Enviar correo a contacto@glasify.com"
                  className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  href="mailto:contacto@glasify.com"
                >
                  contacto@glasify.com
                </a>
              </div>

              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <Phone aria-hidden="true" className="h-4 w-4" />
                <a
                  aria-label="Llamar al +57 300 123 4567"
                  className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                  href="tel:+573001234567"
                >
                  +57 300 123 4567
                </a>
              </div>

              <div className="flex items-center space-x-2 text-muted-foreground text-sm">
                <MapPin aria-hidden="true" className="h-4 w-4" />
                <span>Bogotá, Colombia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-sm">Enlaces Rápidos</h3>
            <nav aria-label="Enlaces rápidos del pie de página" className="mt-4 space-y-2">
              <Link
                className="block text-muted-foreground text-sm hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                href="/catalog"
              >
                Catálogo de Vidrios
              </Link>
              <Link
                className="block text-muted-foreground text-sm hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                href="/quote"
              >
                Nueva Cotización
              </Link>
              <Link
                className="block text-muted-foreground text-sm hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
                href="/signin"
              >
                Panel Administrativo
              </Link>
            </nav>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-sm">Soporte</h3>
            <div className="mt-4 space-y-2">
              <div className="text-muted-foreground text-sm">Horario de atención:</div>
              <div className="text-muted-foreground text-sm">Lun - Vie: 8:00 AM - 6:00 PM</div>
              <div className="text-muted-foreground text-sm">Sáb: 8:00 AM - 12:00 PM</div>
              <div className="mt-3 text-muted-foreground text-sm">
                Tiempo de respuesta promedio:
                <br />
                <span className="text-primary">Menos de 2 horas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 text-muted-foreground text-sm md:flex-row">
          <div className="flex items-center space-x-4">
            <span>© {CURRENT_YEAR} Glasify Lite</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">Todos los derechos reservados</span>
          </div>

          <div className="mt-4 flex items-center space-x-4 md:mt-0">
            <Link
              className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              href="/privacy"
            >
              Privacidad
            </Link>
            <Link
              className="hover:text-foreground focus-visible:text-foreground focus-visible:outline-none"
              href="/terms"
            >
              Términos
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
