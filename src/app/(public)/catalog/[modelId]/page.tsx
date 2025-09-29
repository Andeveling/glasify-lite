'use client';

import { ArrowLeft, DollarSign, Eye, Ruler, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/trpc/react';

type ModelDetailPageProps = {
  params: {
    modelId: string;
  };
};

export default function ModelDetailPage({ params }: ModelDetailPageProps) {
  const router = useRouter();
  const { modelId } = params;

  const glassTypeSuffixLength = 3;

  // For now, we'll mock the data since the API doesn't have a single model endpoint
  // In a real implementation, this would be api.catalog['get-model'].useQuery({ modelId })
  const {
    data: models,
    isLoading,
    error,
  } = api.catalog['list-models'].useQuery(
    { manufacturerId: 'cm1l7vnqj000012oxnbhg9abc' }, // Default manufacturer
    {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  // Find the specific model
  const model = models?.find((m) => m.id === modelId);

  const handleGoBack = () => {
    router.back();
  };

  const handleStartQuote = () => {
    // Navigate to quote page with pre-selected model
    router.push(`/quote?modelId=${modelId}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Cargando detalles del modelo...</span>
        </div>
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-foreground">
            {error ? 'Error al cargar el modelo' : 'Modelo no encontrado'}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {error
              ? 'No se pudieron cargar los detalles del modelo. Por favor, intente nuevamente.'
              : 'El modelo solicitado no existe o no está disponible.'}
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleGoBack} variant="outline">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
            <Button onClick={() => router.push('/catalog')}>Ver catálogo completo</Button>
          </div>
        </div>
      </div>
    );
  }

  const formatRange = (min: number, max: number, unit: string) =>
    min === max ? `${min}${unit}` : `${min}-${max}${unit}`;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <nav aria-label="Navegación" className="mb-6">
        <Button className="mb-4" onClick={handleGoBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al catálogo
        </Button>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-foreground">{model.name}</h1>
            <p className="text-lg text-muted-foreground">
              Fabricante: <span className="font-medium text-foreground">Fabricante</span>
              {/* TODO: Get real manufacturer name */}
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleStartQuote} size="lg">
              Comenzar cotización
            </Button>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Details */}
        <div className="lg:col-span-2">
          {/* Specifications */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Especificaciones técnicas
              </CardTitle>
              <CardDescription>Dimensiones y características del modelo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Dimensiones</h4>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    <div className="flex justify-between">
                      <span>Ancho:</span>
                      <span>{formatRange(model.minWidthMm, model.maxWidthMm, 'mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Alto:</span>
                      <span>{formatRange(model.minHeightMm, model.maxHeightMm, 'mm')}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium text-foreground">Costos</h4>
                  <div className="space-y-1 text-muted-foreground text-sm">
                    <div className="flex justify-between">
                      <span>Precio base:</span>
                      <span>{formatCurrency(model.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo por mm ancho:</span>
                      <span>{formatCurrency(model.costPerMmWidth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Costo por mm alto:</span>
                      <span>{formatCurrency(model.costPerMmHeight)}</span>
                    </div>
                    {model.accessoryPrice && (
                      <div className="flex justify-between">
                        <span>Precio accesorios:</span>
                        <span>{formatCurrency(model.accessoryPrice)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Glass Compatibility */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Compatibilidad de vidrios
              </CardTitle>
              <CardDescription>Tipos de vidrio compatibles con este modelo</CardDescription>
            </CardHeader>
            <CardContent>
              {model.compatibleGlassTypeIds && model.compatibleGlassTypeIds.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {model.compatibleGlassTypeIds.map((glassTypeId) => (
                    <Badge key={glassTypeId} variant="secondary">
                      {/* TODO: Get real glass type names */}
                      Tipo de vidrio {glassTypeId.slice(-glassTypeSuffixLength)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">Compatible con todos los tipos de vidrio disponibles</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Acciones rápidas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full" onClick={handleStartQuote}>
                Comenzar cotización
              </Button>
              <Button className="w-full" onClick={() => router.push('/catalog')} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                Ver más modelos
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Estado del modelo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${model.status === 'published' ? 'bg-green-500' : 'bg-yellow-500'}`}
                />
                <span className="font-medium text-sm">
                  {model.status === 'published' ? 'Disponible' : 'En revisión'}
                </span>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {model.status === 'published'
                  ? 'Este modelo está disponible para cotización'
                  : 'Este modelo está en proceso de revisión'}
              </p>
            </CardContent>
          </Card>

          {/* Last Updated */}
          <Card>
            <CardHeader>
              <CardTitle>Información adicional</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground text-sm">
              <div className="flex justify-between">
                <span>Creado:</span>
                <span>{model.createdAt.toLocaleDateString('es-LA')}</span>
              </div>
              <div className="flex justify-between">
                <span>Actualizado:</span>
                <span>{model.updatedAt.toLocaleDateString('es-LA')}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
