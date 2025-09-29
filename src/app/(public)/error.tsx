'use client';

import { AlertTriangle, Home, RefreshCw, RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to error reporting service
    // In production, use proper error reporting service like Sentry
    // Only log in development to avoid console usage lint error
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      // console.error('Public route error:', error);
    }
  }, []);

  const handleGoHome = () => {
    window.location.href = '/catalog';
  };

  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isNotFound = error.message.includes('404') || error.message.includes('not found');

  // Get error title
  const getErrorTitle = () => {
    if (isNotFound) {
      return 'Producto no encontrado';
    }
    if (isNetworkError) {
      return 'Error de conexión';
    }
    return 'Algo salió mal';
  };

  // Get error description
  const getErrorDescription = () => {
    if (isNotFound) {
      return 'El producto que buscas no está disponible. Revisa nuestro catálogo completo.';
    }
    if (isNetworkError) {
      return 'No pudimos cargar la información. Verifica tu conexión a internet.';
    }
    return 'Ocurrió un error inesperado al cargar el catálogo. Puedes intentar nuevamente.';
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>

          <h2 className="font-semibold text-foreground text-xl">{getErrorTitle()}</h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground text-sm">{getErrorDescription()}</p>

          {/* Development error details */}
          {process.env.NODE_ENV === 'development' && (
            <details className="rounded border p-3 text-left">
              <summary className="cursor-pointer font-medium text-muted-foreground text-xs">
                Detalles del error (solo en desarrollo)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button className="flex-1" onClick={reset} variant="default">
              <RotateCcw className="mr-2 h-4 w-4" />
              Intentar de nuevo
            </Button>

            {isNetworkError && (
              <Button className="flex-1" onClick={() => window.location.reload()} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
            )}

            <Button className="flex-1" onClick={handleGoHome} variant="outline">
              <Home className="mr-2 h-4 w-4" />
              Ver catálogo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
