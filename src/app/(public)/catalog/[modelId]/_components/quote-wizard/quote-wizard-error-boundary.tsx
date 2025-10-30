/**
 * Quote Wizard Error Boundary
 * Catches and handles rendering errors in wizard components
 */

"use client";

import { AlertCircle } from "lucide-react";
import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ErrorBoundaryProps = {
  children: ReactNode;
  onReset?: () => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

/**
 * Error Boundary for Quote Wizard
 * Catches errors during rendering and provides recovery UI
 */
export class QuoteWizardErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch() {
    // Error captured in state via getDerivedStateFromError
    // In production: send to error monitoring service (Sentry, LogRocket, etc.)
    // In development: error details shown in UI via <details> element
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="mx-auto w-full max-w-2xl">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <CardTitle className="text-xl">
                Ocurrió un error inesperado
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              No pudimos cargar el asistente de cotización. Por favor, intenta
              recargar la página.
            </p>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="rounded-md border border-destructive/20 bg-destructive/5 p-4">
                <summary className="cursor-pointer font-medium text-sm">
                  Detalles del error (solo visible en desarrollo)
                </summary>
                <pre className="mt-2 overflow-auto text-xs">
                  {this.state.error.message}
                  {"\n\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="flex gap-3">
              <Button
                className="flex-1"
                onClick={this.handleReset}
                variant="default"
              >
                Reintentar
              </Button>
              <Button
                className="flex-1"
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Recargar página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
