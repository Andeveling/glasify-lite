'use client';

import { AlertTriangle, Home, RefreshCw, RotateCcw, Settings, Shield } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

function getErrorType(error: Error) {
  const message = error.message.toLowerCase();

  if (message.includes('permission') || message.includes('unauthorized')) {
    return 'permission';
  }
  if (message.includes('data') || message.includes('database')) {
    return 'data';
  }
  if (message.includes('fetch') || message.includes('network')) {
    return 'network';
  }
  if (message.includes('validation') || message.includes('schema')) {
    return 'validation';
  }
  return 'generic';
}

function getErrorTitle(errorType: string) {
  switch (errorType) {
    case 'permission':
      return 'Acceso denegado';
    case 'data':
      return 'Error de datos';
    case 'validation':
      return 'Error de validación';
    case 'network':
      return 'Error de conexión';
    default:
      return 'Error del sistema';
  }
}

function getErrorMessage(errorType: string) {
  switch (errorType) {
    case 'permission':
      return 'No tienes permisos suficientes para acceder a esta sección. Contacta al administrador.';
    case 'data':
      return 'Ocurrió un error al procesar la información. Los datos pueden estar temporalmente no disponibles.';
    case 'validation':
      return 'Los datos ingresados no son válidos. Revisa la información e intenta nuevamente.';
    case 'network':
      return 'Error de conexión con el servidor. Verifica tu conexión a internet.';
    default:
      return 'Ocurrió un error inesperado en el panel de administración. Nuestro equipo ha sido notificado.';
  }
}

function DashboardSidebar() {
  return (
    <div className="w-64 border-border border-r bg-muted/5 p-4">
      <div className="mb-8 flex items-center space-x-2">
        <div className="h-8 w-8 rounded bg-primary/10" />
        <span className="font-semibold text-sm">Panel Admin</span>
      </div>

      <nav className="space-y-2">
        <div className="flex items-center space-x-2 p-2 text-muted-foreground text-sm">
          <Settings className="h-4 w-4" />
          <span>Error en el sistema</span>
        </div>
      </nav>
    </div>
  );
}

function ErrorActions({
  errorType,
  onReset,
  onReload,
  onGoHome,
  onGoToPublic,
}: {
  errorType: string;
  onReset: () => void;
  onReload: () => void;
  onGoHome: () => void;
  onGoToPublic: () => void;
}) {
  const shouldShowRetry = errorType !== 'permission';
  const shouldShowReload = errorType === 'network' || errorType === 'data';

  return (
    <div className="space-y-3">
      {/* Primary actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        {shouldShowRetry && (
          <Button className="flex-1" onClick={onReset} variant="default">
            <RotateCcw className="mr-2 h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}

        {shouldShowReload && (
          <Button className="flex-1" onClick={onReload} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Recargar página
          </Button>
        )}
      </div>

      {/* Navigation actions */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button className="flex-1" onClick={onGoHome} variant="outline">
          <Home className="mr-2 h-4 w-4" />
          Panel principal
        </Button>

        <Button className="flex-1" onClick={onGoToPublic} variant="ghost">
          Ir al catálogo
        </Button>
      </div>
    </div>
  );
}

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const errorType = getErrorType(error);

  useEffect(() => {
    // Log the error to error reporting service
    // In production, replace with proper error monitoring
    if (process.env.NODE_ENV === 'development') {
      // console.error('Dashboard error:', error);
    }
  }, []);

  const handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  const handleGoToPublic = () => {
    window.location.href = '/catalog';
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      {/* Main error content */}
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              {errorType === 'permission' ? (
                <Shield className="h-8 w-8 text-destructive" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-destructive" />
              )}
            </div>

            <h2 className="font-semibold text-foreground text-xl">{getErrorTitle(errorType)}</h2>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground text-sm">{getErrorMessage(errorType)}</p>

            {/* Error ID for support */}
            {error.digest && (
              <div className="rounded bg-muted/50 p-3 text-center">
                <p className="text-muted-foreground text-xs">
                  ID del error: <code className="font-mono text-xs">{error.digest}</code>
                </p>
              </div>
            )}

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && (
              <details className="rounded border p-3 text-left">
                <summary className="cursor-pointer font-medium text-muted-foreground text-xs">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 max-h-32 overflow-auto whitespace-pre-wrap text-muted-foreground text-xs">
                  {error.message}
                  {error.stack && `\n\nStack:\n${error.stack}`}
                </pre>
              </details>
            )}

            <Separator />

            <ErrorActions
              errorType={errorType}
              onGoHome={handleGoHome}
              onGoToPublic={handleGoToPublic}
              onReload={handleReload}
              onReset={reset}
            />

            {/* Help text */}
            <p className="text-center text-muted-foreground text-xs">
              Si el problema persiste, contacta al soporte técnico con el ID del error.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
