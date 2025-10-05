'use client';

import { AlertTriangle, Home, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  showReload?: boolean;
  showHome?: boolean;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error, hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ error: undefined, hasError: false });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ error: undefined, hasError: false });
    window.location.href = '/';
  };

  handleRetry = () => {
    this.setState({ error: undefined, hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          aria-live="assertive"
          className={cn('flex min-h-[400px] w-full items-center justify-center p-4', this.props.className)}
          role="alert"
        >
          <Card className="w-full max-w-md p-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle aria-hidden="true" className="h-8 w-8 text-destructive" />
            </div>

            <h2 className="mt-4 font-semibold text-foreground text-lg">Algo salió mal</h2>

            <p className="mt-2 text-muted-foreground text-sm">
              Lo sentimos, ocurrió un error inesperado. Puedes intentar recargar la página o volver al inicio.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 rounded border p-2 text-left">
                <summary className="cursor-pointer font-medium text-xs">
                  Detalles del error (solo en desarrollo)
                </summary>
                <pre className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">
                  {this.state.error.message}
                  {this.state.error.stack && (
                    <>
                      {'\n\n'}
                      {this.state.error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <Button
                aria-describedby="error-retry-description"
                className="flex-1"
                onClick={this.handleRetry}
                variant="default"
              >
                <RotateCcw aria-hidden="true" className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>

              {this.props.showReload && (
                <Button
                  aria-describedby="error-reload-description"
                  className="flex-1"
                  onClick={this.handleReload}
                  variant="outline"
                >
                  Recargar página
                </Button>
              )}

              {this.props.showHome && (
                <Button
                  aria-describedby="error-home-description"
                  className="flex-1"
                  onClick={this.handleGoHome}
                  variant="outline"
                >
                  <Home aria-hidden="true" className="mr-2 h-4 w-4" />
                  Ir al inicio
                </Button>
              )}
            </div>

            {/* Hidden descriptions for screen readers */}
            <div className="sr-only">
              <div id="error-retry-description">Intentar ejecutar la operación nuevamente</div>
              <div id="error-reload-description">Recargar completamente la página actual</div>
              <div id="error-home-description">Navegar a la página de inicio de la aplicación</div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components error boundaries
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <WrappedComponent {...props} />
    </ErrorBoundary>
  );

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name})`;

  return ComponentWithErrorBoundary;
}
