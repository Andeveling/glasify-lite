'use client';

import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log error to console (winston is server-only)
    console.error('Model page error', {
      digest: error.digest,
      message: error.message,
      stack: error.stack,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>

          <h1 className="mb-2 font-bold text-2xl">Algo salió mal</h1>

          <p className="mb-6 text-muted-foreground">
            Ocurrió un error al cargar los detalles del modelo. Por favor, intenta nuevamente.
          </p>

          {error.digest && (
            <p className="mb-4 rounded-md bg-muted px-3 py-2 font-mono text-muted-foreground text-xs">
              Error ID: {error.digest}
            </p>
          )}

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            <Button className="flex-1" onClick={reset} size="lg" variant="default">
              <RefreshCcw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>

            <Button asChild className="flex-1" size="lg" variant="outline">
              <Link href="/catalog">
                <Home className="mr-2 h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
