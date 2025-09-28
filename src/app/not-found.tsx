import { FileQuestion } from 'lucide-react';
import Link from 'next/link';
import { BackButton } from '@/components/back-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-muted">
              <FileQuestion className="h-12 w-12 text-muted-foreground" />
            </div>
            <CardTitle className="font-bold text-6xl tracking-tight">404</CardTitle>
            <CardTitle className="text-2xl">Página no encontrada</CardTitle>
            <CardDescription className="text-lg">
              Lo sentimos, la página que buscas no existe o ha sido movida.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Navigation Options */}
            <div className="flex flex-col space-y-3 sm:flex-row sm:space-x-3 sm:space-y-0">
              <Button asChild className="flex-1">
                <Link href="/catalog">Ir al Catálogo</Link>
              </Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/quote">Crear Cotización</Link>
              </Button>
            </div>

            {/* Additional Help */}
            <div className="text-center text-muted-foreground text-sm">
              <p>
                ¿Necesitas ayuda?{' '}
                <Button asChild className="h-auto p-0" size="sm" variant="link">
                  <Link href="/catalog">Explora nuestro catálogo</Link>
                </Button>{' '}
                o{' '}
                <Button asChild className="h-auto p-0" size="sm" variant="link">
                  <Link href="/signin">inicia sesión</Link>
                </Button>
                .
              </p>
            </div>

            {/* Back Button */}
            <div className="text-center">
              <BackButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
