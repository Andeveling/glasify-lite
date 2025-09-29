import { AlertTriangle, ArrowLeft, BarChart3, FileText, Home, Package, Settings, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const metadata: Metadata = {
  description: 'La página de administración que buscas no existe o no tienes permisos para acceder a ella',
  title: 'Página No Encontrada - Panel de Administración | Glasify',
};

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <AlertTriangle className="h-16 w-16 text-muted-foreground" />
            </div>
            <CardTitle className="font-bold text-3xl">Página No Encontrada</CardTitle>
            <CardDescription className="text-lg">
              La página de administración que buscas no existe o no tienes permisos para acceder a ella.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error message */}
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-destructive">
                <Shield className="h-5 w-5" />
                <p className="font-medium text-sm">
                  <strong>Error 404:</strong> Recurso de administración no encontrado
                </p>
              </div>
              <p className="mt-2 text-muted-foreground text-xs">
                Verifica que la URL sea correcta y que tengas los permisos necesarios
              </p>
            </div>

            {/* Admin navigation options */}
            <div className="space-y-4">
              <h3 className="mb-4 text-center font-semibold text-lg">Acceso Rápido al Panel de Control</h3>

              <div className="grid gap-3 md:grid-cols-2">
                <Link href="/dashboard">
                  <Button className="h-auto w-full p-4" variant="default">
                    <div className="flex flex-col items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Dashboard</div>
                        <div className="text-xs opacity-90">Panel principal</div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/models">
                  <Button className="h-auto w-full p-4" variant="outline">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Modelos</div>
                        <div className="text-xs opacity-90">Gestión de productos</div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/quotes">
                  <Button className="h-auto w-full p-4" variant="outline">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Cotizaciones</div>
                        <div className="text-xs opacity-90">Gestión de presupuestos</div>
                      </div>
                    </div>
                  </Button>
                </Link>

                <Link href="/dashboard/settings">
                  <Button className="h-auto w-full p-4" variant="outline">
                    <div className="flex flex-col items-center gap-2">
                      <Settings className="h-5 w-5" />
                      <div className="text-center">
                        <div className="font-medium">Configuración</div>
                        <div className="text-xs opacity-90">Ajustes del sistema</div>
                      </div>
                    </div>
                  </Button>
                </Link>
              </div>

              <div className="flex flex-col items-center gap-2 pt-4">
                <Link href="/dashboard">
                  <Button className="gap-2" variant="ghost">
                    <Home className="h-4 w-4" />
                    Volver al Dashboard
                  </Button>
                </Link>

                <Button className="gap-2" onClick={() => window.history.back()} variant="ghost">
                  <ArrowLeft className="h-4 w-4" />
                  Página Anterior
                </Button>
              </div>
            </div>

            {/* Admin help section */}
            <div className="border-t pt-6">
              <div className="space-y-3 text-center">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="font-medium text-sm">Soporte Técnico</span>
                </div>

                <div className="space-y-2 text-muted-foreground text-sm">
                  <p>
                    Si crees que esto es un error del sistema,{' '}
                    <a className="text-primary underline hover:no-underline" href="mailto:admin@glasify.com">
                      contacta al administrador
                    </a>
                  </p>

                  <p>
                    Para problemas de acceso o permisos, verifica tu{' '}
                    <Link className="text-primary underline hover:no-underline" href="/dashboard/settings">
                      configuración de usuario
                    </Link>
                  </p>
                </div>

                {/* System info */}
                <div className="mt-4 rounded-lg bg-muted/50 p-3 text-muted-foreground text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Sesión:</span>
                      <span className="font-mono">Activa</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Rol:</span>
                      <span className="font-mono">Administrador</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Timestamp:</span>
                      <span className="font-mono">{new Date().toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
