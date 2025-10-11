import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Filter,
  Plus,
  Search,
  TrendingUp,
  XCircle,
} from 'lucide-react';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { auth } from '@/server/auth';

import { QuoteList } from '../_components/quote-list';

export const metadata: Metadata = {
  description: 'Administra todas las cotizaciones y su estado de seguimiento',
  title: 'Gestión de Cotizaciones - Glasify',
};

const QUOTE_STATS_SKELETON_COUNT = 4;

const MOCK_STATS = {
  approved: 89,
  averageValue: 850_000,
  conversionRate: 67.3,
  expired: 32,
  monthlyGrowth: 12.5,
  pending: 23,
  rejected: 12,
  total: 156,
};

function QuotesStats() {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
      currency: 'ARS',
      maximumFractionDigits: 0,
      style: 'currency',
    }).format(amount);

  const formatPercentage = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Total Cotizaciones</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{MOCK_STATS.total}</div>
          <p className="text-muted-foreground text-xs">
            <TrendingUp className="mr-1 inline h-3 w-3" />
            {formatPercentage(MOCK_STATS.monthlyGrowth)} este mes
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{MOCK_STATS.pending}</div>
          <p className="text-muted-foreground text-xs">Requieren seguimiento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Valor Promedio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{formatCurrency(MOCK_STATS.averageValue)}</div>
          <p className="text-muted-foreground text-xs">Por cotización aprobada</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="font-medium text-sm">Conversión</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="font-bold text-2xl">{MOCK_STATS.conversionRate}%</div>
          <p className="text-muted-foreground text-xs">Tasa de aprobación</p>
        </CardContent>
      </Card>
    </div>
  );
}

function QuotesFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Filtros y Búsqueda</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="relative flex-1 md:max-w-sm">
            <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
            <Input className="pl-10" placeholder="Buscar cotizaciones..." />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />

            <Select defaultValue="todos">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pending">Pendiente</SelectItem>
                <SelectItem value="approved">Aprobada</SelectItem>
                <SelectItem value="rejected">Rechazada</SelectItem>
                <SelectItem value="expired">Vencida</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="todos">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las fechas</SelectItem>
                <SelectItem value="today">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="quarter">Este trimestre</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="newest">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Más reciente</SelectItem>
                <SelectItem value="oldest">Más antiguo</SelectItem>
                <SelectItem value="highest">Mayor valor</SelectItem>
                <SelectItem value="lowest">Menor valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuotesByStatus() {
  const StatusCards = [
    {
      count: MOCK_STATS.pending,
      description: 'Esperando respuesta del cliente',
      icon: Clock,
      status: 'pending',
      title: 'Pendientes',
      variant: 'secondary' as const,
    },
    {
      count: MOCK_STATS.approved,
      description: 'Cotizaciones aceptadas por el cliente',
      icon: CheckCircle,
      status: 'approved',
      title: 'Aprobadas',
      variant: 'default' as const,
    },
    {
      count: MOCK_STATS.rejected,
      description: 'Cotizaciones rechazadas',
      icon: XCircle,
      status: 'rejected',
      title: 'Rechazadas',
      variant: 'destructive' as const,
    },
    {
      count: MOCK_STATS.expired,
      description: 'Cotizaciones vencidas',
      icon: AlertCircle,
      status: 'expired',
      title: 'Vencidas',
      variant: 'outline' as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {StatusCards.map((card) => (
        <Card className="cursor-pointer transition-colors hover:bg-muted/50" key={card.status}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">{card.title}</CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{card.count}</div>
            <p className="text-muted-foreground text-xs">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function QuotesPageContent() {
  const handleCreateQuote = () => {
    // TODO: Navigate to quote creation form
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Gestión de Cotizaciones</h1>
          <p className="text-muted-foreground">Administra todas las cotizaciones y su estado de seguimiento</p>
        </div>
        <Button onClick={handleCreateQuote}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cotización
        </Button>
      </div>

      {/* Stats Overview */}
      <QuotesStats />

      {/* Tabs for different views */}
      <Tabs className="space-y-4" defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Todas</TabsTrigger>
          <TabsTrigger value="pending">Pendientes</TabsTrigger>
          <TabsTrigger value="approved">Aprobadas</TabsTrigger>
          <TabsTrigger value="status">Por Estado</TabsTrigger>
        </TabsList>

        <TabsContent className="space-y-4" value="all">
          <QuotesFilters />
          <Card>
            <CardHeader>
              <CardTitle>Todas las Cotizaciones</CardTitle>
              <CardDescription>Lista completa de cotizaciones ordenadas por fecha</CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="pending">
          <QuotesFilters />
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones Pendientes</CardTitle>
              <CardDescription>Cotizaciones que requieren seguimiento y respuesta</CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="approved">
          <QuotesFilters />
          <Card>
            <CardHeader>
              <CardTitle>Cotizaciones Aprobadas</CardTitle>
              <CardDescription>Cotizaciones aceptadas por los clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <QuoteList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent className="space-y-4" value="status">
          <Card>
            <CardHeader>
              <CardTitle>Resumen por Estado</CardTitle>
              <CardDescription>Vista general del estado de todas las cotizaciones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <QuotesByStatus />

              {/* Quick actions */}
              <div className="flex flex-wrap gap-2 border-t pt-4">
                <Button size="sm" variant="outline">
                  <Calendar className="mr-2 h-4 w-4" />
                  Programar Seguimiento
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Exportar Reporte
                </Button>
                <Button size="sm" variant="outline">
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Ver Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default async function QuotesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 md:grid-cols-4">
              {generateStableKeyedArray(QUOTE_STATS_SKELETON_COUNT, 'quote-stat').map((item) => (
                <div className="h-32 animate-pulse rounded-lg bg-muted" key={item.key} />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        }
      >
        <QuotesPageContent />
      </Suspense>
    </div>
  );
}
