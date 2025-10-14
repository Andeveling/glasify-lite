import { AlertCircle, Calculator, CheckCircle, Clock, FileText, Package, Plus, TrendingUp, Users } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';
import { getTenantConfig } from '@/server/utils/tenant';
import StatsCard from '@/app/(dashboard)/_components/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import { auth } from '@/server/auth';

export const metadata: Metadata = {
  description: 'Panel de control para la gestión de vidrios y cotizaciones',
  title: 'Dashboard - Glasify',
};

// Mock data for dashboard stats
const DASHBOARD_STATS = {
  customers: {
    new: 12,
    total: 89,
    trend: 22,
  },
  models: {
    draft: 7,
    published: 38,
    total: 45,
    trend: 8,
  },
  quotes: {
    completed: 89,
    pending: 23,
    total: 127,
    trend: 12,
  },
  revenue: {
    daily: 95_000,
    monthly: 2_850_000,
    trend: 15,
  },
};

const RECENT_QUOTES = [
  {
    amount: 450_000,
    createdAt: '2024-01-15T10:30:00Z',
    customer: 'Juan Pérez',
    id: 'cm1quote123',
    items: 3,
    status: 'submitted' as const,
  },
  {
    amount: 320_000,
    createdAt: '2024-01-14T16:45:00Z',
    customer: 'María González',
    id: 'cm1quote234',
    items: 2,
    status: 'pending' as const,
  },
  {
    amount: 0,
    createdAt: '2024-01-13T09:15:00Z',
    customer: 'Carlos Rodríguez',
    id: 'cm1quote345',
    items: 5,
    status: 'calculating' as const,
  },
  {
    amount: 150_000,
    createdAt: '2024-01-12T14:20:00Z',
    customer: 'Ana Martínez',
    id: 'cm1quote456',
    items: 1,
    status: 'completed' as const,
  },
];

const STATUS_CONFIG = {
  calculating: { icon: Calculator, label: 'Calculando', variant: 'outline' as const },
  cancelled: { icon: AlertCircle, label: 'Cancelada', variant: 'destructive' as const },
  completed: { icon: CheckCircle, label: 'Completada', variant: 'default' as const },
  draft: { icon: FileText, label: 'Borrador', variant: 'secondary' as const },
  pending: { icon: Clock, label: 'Pendiente', variant: 'outline' as const },
  submitted: { icon: CheckCircle, label: 'Enviada', variant: 'default' as const },
};

const DASHBOARD_STAT_SKELETON_COUNT = 4;

function DashboardStats() {
  const stats = DASHBOARD_STATS;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <StatsCard
        description={`${stats.quotes.pending} pendientes • ${stats.quotes.completed} completadas`}
        icon={FileText}
        title="Cotizaciones"
        trend={{
          isPositive: true,
          label: `+${stats.quotes.trend}% este mes`,
          value: stats.quotes.trend,
        }}
        value={stats.quotes.total.toString()}
      />
      <StatsCard
        description={`${stats.models.published} publicados • ${stats.models.draft} borradores`}
        icon={Package}
        title="Modelos"
        trend={{
          isPositive: true,
          label: `+${stats.models.trend}% este mes`,
          value: stats.models.trend,
        }}
        value={stats.models.total.toString()}
      />
      <StatsCard
        description={`Promedio diario: ${new Intl.NumberFormat('es-AR', {
          currency: 'ARS',
          maximumFractionDigits: 0,
          style: 'currency',
        }).format(stats.revenue.daily)}`}
        icon={TrendingUp}
        title="Ingresos Mensuales"
        trend={{
          isPositive: true,
          label: `+${stats.revenue.trend}% este mes`,
          value: stats.revenue.trend,
        }}
        value={new Intl.NumberFormat('es-AR', {
          currency: 'ARS',
          maximumFractionDigits: 0,
          style: 'currency',
        }).format(stats.revenue.monthly)}
      />
      <StatsCard
        description={`${stats.customers.new} nuevos este mes`}
        icon={Users}
        title="Clientes"
        trend={{
          isPositive: true,
          label: `+${stats.customers.trend}% este mes`,
          value: stats.customers.trend,
        }}
        value={stats.customers.total.toString()}
      />
    </div>
  );
}

function RecentQuotes() {
  const formatCurrency = (amount: number) => {
    if (amount === 0) {
      return '—';
    }
    return new Intl.NumberFormat('es-AR', {
      currency: 'ARS',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cotizaciones Recientes</CardTitle>
          <CardDescription>Últimas actividades de cotización</CardDescription>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link href="/dashboard/quotes">Ver todas</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {RECENT_QUOTES.map((quote) => {
            const StatusIcon = STATUS_CONFIG[ quote.status ].icon;
            return (
              <div
                className="flex items-center justify-between border-border border-b pb-4 last:border-0 last:pb-0"
                key={quote.id}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{quote.customer}</p>
                    <p className="text-muted-foreground text-xs">
                      {quote.items} ítem{quote.items !== 1 ? 's' : ''} • {formatDate(quote.createdAt, 'es-CO', 'America/Bogota')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatCurrency(quote.amount)}</p>
                    <Badge className="text-xs" variant={STATUS_CONFIG[ quote.status ].variant}>
                      {STATUS_CONFIG[ quote.status ].label}
                    </Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Acciones Rápidas</CardTitle>
        <CardDescription>Herramientas de uso frecuente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <Button asChild className="h-auto justify-start p-4">
            <Link className="flex flex-col items-start gap-1" href="/dashboard/models">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-medium">Crear Nuevo Modelo</span>
              </div>
              <span className="text-muted-foreground text-sm">Agregar un modelo de vidrio al catálogo</span>
            </Link>
          </Button>

          <Button asChild className="h-auto justify-start p-4" variant="outline">
            <Link className="flex flex-col items-start gap-1" href="/catalog">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">Ver Catálogo Público</span>
              </div>
              <span className="text-muted-foreground text-sm">Revisar modelos disponibles para clientes</span>
            </Link>
          </Button>

          <Button asChild className="h-auto justify-start p-4" variant="outline">
            <Link className="flex flex-col items-start gap-1" href="/quote">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                <span className="font-medium">Probar Cotizador</span>
              </div>
              <span className="text-muted-foreground text-sm">Realizar una cotización de prueba</span>
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  // Get tenant configuration for date formatting
  const tenantConfig = await getTenantConfig();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Panel de Control</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta, {session.user.name ?? session.user.email}</p>
        </div>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {generateStableKeyedArray(DASHBOARD_STAT_SKELETON_COUNT, 'dashboard-stats').map((item) => (
              <div className="h-32 animate-pulse rounded-lg bg-muted" key={item.key} />
            ))}
          </div>
        }
      >
        <DashboardStats />
      </Suspense>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Suspense fallback={<div className="h-96 animate-pulse rounded-lg bg-muted" />}>
            <RecentQuotes />
          </Suspense>
        </div>

        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
