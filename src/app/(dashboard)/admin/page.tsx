import { Factory, GlassWater, Grid3x3, Package, Settings, Sparkles, Wrench } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/server/db';
import { AdminContentContainer } from './_components/admin-content-container';

export const metadata: Metadata = {
  description: 'Panel de administración del catálogo',
  title: 'Dashboard | Admin - Glasify Lite',
};

/**
 * Admin Dashboard Home Page
 *
 * Overview page showing quick stats and navigation cards for all catalog entities.
 * Displays entity counts and provides direct access to management pages.
 */
export default async function AdminDashboardPage() {
  // Fetch entity counts for dashboard stats
  const [
    modelsCount,
    glassTypesCount,
    servicesCount,
    profileSuppliersCount,
    glassSuppliersCount,
    solutionsCount,
    characteristicsCount,
  ] = await Promise.all([
    db.model.count(),
    db.glassType.count(),
    db.service.count(),
    db.profileSupplier.count(),
    db.glassSupplier.count(),
    db.glassSolution.count(),
    db.glassCharacteristic.count(),
  ]);

  const entityCards = [
    {
      count: modelsCount,
      description: 'Ventanas y puertas',
      href: '/admin/models',
      icon: Grid3x3,
      priority: 'high' as const,
      title: 'Modelos',
    },
    {
      count: glassTypesCount,
      description: 'Configuraciones de vidrio',
      href: '/admin/glass-types',
      icon: GlassWater,
      priority: 'high' as const,
      title: 'Tipos de Vidrio',
    },
    {
      count: servicesCount,
      description: 'Servicios adicionales',
      href: '/admin/services',
      icon: Wrench,
      priority: 'medium' as const,
      title: 'Servicios',
    },
    {
      count: profileSuppliersCount,
      description: 'Fabricantes de perfiles',
      href: '/admin/profile-suppliers',
      icon: Factory,
      priority: 'medium' as const,
      title: 'Proveedores de Perfiles',
    },
    {
      count: glassSuppliersCount,
      description: 'Fabricantes de vidrio',
      href: '/admin/glass-suppliers',
      icon: Package,
      priority: 'medium' as const,
      title: 'Proveedores de Vidrio',
    },
    {
      count: solutionsCount,
      description: 'Categorización por uso',
      href: '/admin/glass-solutions',
      icon: Sparkles,
      priority: 'low' as const,
      title: 'Soluciones de Vidrio',
    },
    {
      count: characteristicsCount,
      description: 'Propiedades del vidrio',
      href: '/admin/glass-characteristics',
      icon: Settings,
      priority: 'low' as const,
      title: 'Características de Vidrio',
    },
  ];

  return (
    <AdminContentContainer maxWidth="full">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Dashboard de Administración</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de productos, proveedores y taxonomías</p>
        </div>

        {/* Entity Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {entityCards.map((entity) => {
            const Icon = entity.icon;
            return (
              <Card key={entity.href}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="font-medium text-sm">{entity.title}</CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="font-bold text-2xl">{entity.count}</div>
                  <p className="text-muted-foreground text-xs">{entity.description}</p>
                  <Button asChild className="mt-4 h-auto p-0" variant="link">
                    <Link href={entity.href}>Ver todos →</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-6">
          <h2 className="mb-4 font-semibold text-lg">Acciones Rápidas</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Crear Modelo</CardTitle>
                <CardDescription>Agrega un nuevo modelo de ventana o puerta</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/models/new">Crear Modelo</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crear Tipo de Vidrio</CardTitle>
                <CardDescription>Agrega una nueva configuración de vidrio</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <a href="/admin/glass-types/new">Crear Tipo de Vidrio</a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crear Servicio</CardTitle>
                <CardDescription>Agrega un nuevo servicio adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/glass-types/new">Crear Tipo de Vidrio</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crear Servicio</CardTitle>
                <CardDescription>Agrega un nuevo servicio adicional</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin/services/new">Crear Servicio</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminContentContainer>
  );
}
