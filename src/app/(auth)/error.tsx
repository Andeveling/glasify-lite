"use client";

import { AlertTriangle, Home, RotateCcw, ShieldAlert } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function getErrorType(error: Error) {
  const message = error.message.toLowerCase();

  if (message.includes("auth") || message.includes("credential")) {
    return "auth";
  }
  if (message.includes("session") || message.includes("token")) {
    return "session";
  }
  if (message.includes("fetch") || message.includes("network")) {
    return "network";
  }
  return "generic";
}

function getErrorTitle(errorType: string) {
  switch (errorType) {
    case "auth":
      return "Error de autenticación";
    case "session":
      return "Sesión expirada";
    case "network":
      return "Error de conexión";
    default:
      return "Error de acceso";
  }
}

function getErrorMessage(errorType: string) {
  switch (errorType) {
    case "auth":
      return "Las credenciales proporcionadas no son válidas. Verifica tu información e intenta nuevamente.";
    case "session":
      return "Tu sesión ha expirado por seguridad. Por favor, inicia sesión nuevamente.";
    case "network":
      return "No se pudo conectar con el servidor de autenticación. Verifica tu conexión.";
    default:
      return "Ocurrió un error al procesar tu solicitud de acceso. Por favor, intenta nuevamente.";
  }
}

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const errorType = getErrorType(error);

  useEffect(() => {
    // Log the error to error reporting service
    // In production, replace with proper error reporting
    if (process.env.NODE_ENV === "development") {
      // console.error('Auth route error:', error);
    }
  }, []);

  const handleGoHome = () => {
    window.location.href = "/";
  };

  const handleTrySignIn = () => {
    window.location.href = "/signin";
  };

  const shouldShowRetry = errorType !== "session" && errorType !== "auth";
  const isAuthOrSession = errorType === "session" || errorType === "auth";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            {isAuthOrSession ? (
              <ShieldAlert className="h-8 w-8 text-destructive" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-destructive" />
            )}
          </div>

          <h2 className="font-semibold text-foreground text-xl">
            {getErrorTitle(errorType)}
          </h2>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground text-sm">
            {getErrorMessage(errorType)}
          </p>

          {/* Development error details */}
          {process.env.NODE_ENV === "development" && (
            <details className="rounded border p-3 text-left">
              <summary className="cursor-pointer font-medium text-muted-foreground text-xs">
                Detalles del error (solo en desarrollo)
              </summary>
              <pre className="mt-2 whitespace-pre-wrap text-muted-foreground text-xs">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
                {error.stack && `\n\nStack:\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex flex-col gap-2">
            {shouldShowRetry && (
              <Button className="w-full" onClick={reset} variant="default">
                <RotateCcw className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Button>
            )}

            <Button
              className="w-full"
              onClick={handleTrySignIn}
              variant={isAuthOrSession ? "default" : "outline"}
            >
              <ShieldAlert className="mr-2 h-4 w-4" />
              {errorType === "session"
                ? "Iniciar sesión nuevamente"
                : "Ir a inicio de sesión"}
            </Button>

            <Button className="w-full" onClick={handleGoHome} variant="ghost">
              <Home className="mr-2 h-4 w-4" />
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
