import { ArrowLeft, UserX } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Auth Not Found Page
 * Displayed when accessing non-existent authentication routes
 * Provides navigation back to signin and catalog
 */
export default function AuthNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
            <UserX className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Página no encontrada</CardTitle>
          <p className="text-muted-foreground text-sm">
            La página de autenticación que buscas no existe.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-muted-foreground text-sm">
            <p>
              Puede que el enlace sea incorrecto o la página haya sido movida.
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </Button>

            <Button asChild className="w-full" variant="outline">
              <Link href="/catalog">Explorar catálogo</Link>
            </Button>
          </div>

          <div className="pt-4 text-center text-muted-foreground text-xs">
            ¿Necesitas ayuda? Contacta al administrador del sistema
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
