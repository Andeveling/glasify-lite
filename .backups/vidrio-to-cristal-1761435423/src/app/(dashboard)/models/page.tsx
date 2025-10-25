import { Edit, Eye, Filter, Package, Plus, Search } from 'lucide-react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { generateStableKeyedArray } from '@/app/_utils/generate-keys.util';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { auth } from '@/server/auth';
import { ModelsTable } from './_components/models-table';

export const metadata: Metadata = {
  description: 'Administra los modelos de vidrio disponibles en el catálogo',
  title: 'Gestión de Modelos - Glasify',
};

const SKELETON_CARDS_COUNT = 3;

// Mock data for models
const MOCK_MODELS = [
  {
    basePrice: 150_000,
    compatibleGlassTypes: ['Templado 6mm', 'Laminado 8mm'],
    costPerMmHeight: 45,
    costPerMmWidth: 60,
    createdAt: '2024-01-10T10:00:00Z',
    id: 'cm1model123456789abcdef01',
    maxHeightMm: 1800,
    maxWidthMm: 2000,
    minHeightMm: 400,
    minWidthMm: 300,
    name: 'Ventana Premium 2024',
    profileSupplier: 'VEKA',
    status: 'published' as const,
    updatedAt: '2024-01-15T14:30:00Z',
  },
  {
    basePrice: 280_000,
    compatibleGlassTypes: ['Templado 10mm'],
    costPerMmHeight: 80,
    costPerMmWidth: 120,
    createdAt: '2024-01-12T16:20:00Z',
    id: 'cm1model234567890bcdef012',
    maxHeightMm: 2400,
    maxWidthMm: 1200,
    minHeightMm: 2000,
    minWidthMm: 800,
    name: 'Puerta Estándar',
    profileSupplier: 'Guardian Glass',
    status: 'draft' as const,
    updatedAt: '2024-01-12T16:20:00Z',
  },
  {
    basePrice: 95_000,
    compatibleGlassTypes: ['Templado 6mm', 'DVH'],
    costPerMmHeight: 25,
    costPerMmWidth: 35,
    createdAt: '2024-01-08T09:45:00Z',
    id: 'cm1model345678901cdef0123',
    maxHeightMm: 2500,
    maxWidthMm: 3000,
    minHeightMm: 500,
    minWidthMm: 500,
    name: 'Vitrina Comercial',
    profileSupplier: 'Pilkington',
    status: 'published' as const,
    updatedAt: '2024-01-14T11:15:00Z',
  },
  {
    basePrice: 320_000,
    compatibleGlassTypes: ['Templado 8mm', 'Laminado 6+6mm'],
    costPerMmHeight: 100,
    costPerMmWidth: 180,
    createdAt: '2024-01-05T14:10:00Z',
    id: 'cm1model456789012def01234',
    maxHeightMm: 2200,
    maxWidthMm: 1500,
    minHeightMm: 1800,
    minWidthMm: 600,
    name: 'Mampara de Baño',
    profileSupplier: 'VEKA',
    status: 'published' as const,
    updatedAt: '2024-01-13T09:25:00Z',
  },
];

const PROFILE_SUPPLIERS = ['Todos', 'VEKA', 'Guardian Glass', 'Pilkington'];

function ModelsPageContent() {
  const models = MOCK_MODELS;

  const handleCreateModel = () => {
    // TODO: Implement create model functionality
  };

  const handleEditModel = (modelId: string) => {
    // TODO: Implement edit model functionality
    void modelId;
  };

  const handleViewModel = (modelId: string) => {
    // TODO: Implement view model functionality
    void modelId;
  };

  const handleDeleteModel = (modelId: string) => {
    // TODO: Implement delete model functionality
    void modelId;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Gestión de Modelos</h1>
          <p className="text-muted-foreground">Administra los modelos de vidrio disponibles en tu catálogo</p>
        </div>
        <Button onClick={handleCreateModel}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Modelo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total de Modelos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{models.length}</div>
            <p className="text-muted-foreground text-xs">+2 desde el mes pasado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Publicados</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{models.filter((m) => m.status === 'published').length}</div>
            <p className="text-muted-foreground text-xs">Visibles en catálogo público</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Borradores</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{models.filter((m) => m.status === 'draft').length}</div>
            <p className="text-muted-foreground text-xs">Pendientes de publicación</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1 md:max-w-sm">
              <Search className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar modelos..." />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />

              <Select defaultValue="todos">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROFILE_SUPPLIERS.map((supplier) => (
                    <SelectItem key={supplier} value={supplier.toLowerCase()}>
                      {supplier}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select defaultValue="todos">
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>Modelos</CardTitle>
          <CardDescription>Lista completa de modelos disponibles</CardDescription>
        </CardHeader>
        <CardContent>
          <ModelsTable models={models} onDelete={handleDeleteModel} onEdit={handleEditModel} onView={handleViewModel} />
        </CardContent>
      </Card>
    </div>
  );
}

export default async function ModelsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect('/signin');
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="grid gap-4 md:grid-cols-3">
              {generateStableKeyedArray(SKELETON_CARDS_COUNT, 'model-skeleton').map((item) => (
                <div className="h-32 animate-pulse rounded-lg bg-muted" key={item.key} />
              ))}
            </div>
            <div className="h-96 animate-pulse rounded-lg bg-muted" />
          </div>
        }
      >
        <ModelsPageContent />
      </Suspense>
    </div>
  );
}
