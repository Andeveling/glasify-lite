'use client';

import { ArrowLeft, Calculator, ShoppingCart } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { api } from '@/trpc/react';
import { PriceCalculator } from './_components/price-calculator';

type QuoteItem = {
  id: string;
  modelId: string;
  modelName: string;
  widthMm: number;
  heightMm: number;
  glassId: string;
  glassTypeName: string;
  services: Array<{
    serviceId: string;
    serviceName: string;
    quantity: number;
  }>;
  quantity: number;
  subtotal: number;
};

export default function QuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedModelId = searchParams?.get('modelId') || undefined;

  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [selectedModelId, setSelectedModelId] = useState<string>(preselectedModelId || '');
  // Use a counter for stable IDs instead of Date.now()
  const [itemIdCounter, setItemIdCounter] = useState(1);

  const maxVisibleItems = 3;
  const idSuffixLength = 3;
  const maxModelPreview = 4;

  // Get available models for the calculator
  const { data: models, isLoading: modelsLoading } = api.catalog['list-models'].useQuery(
    { manufacturerId: 'cm1l7vnqj000012oxnbhg9abc' }, // Default manufacturer
    {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  const handleGoBack = () => {
    router.back();
  };

  const handleViewReview = () => {
    router.push('/quote/review');
  };

  const handleAddToQuote = useCallback(
    (item: {
      modeloId: string;
      anchoMm: number;
      altoMm: number;
      vidrioId: string;
      servicios: Array<{ serviceId: string; cantidad: number }>;
      cantidad: number;
      subtotal: string;
    }) => {
      const model = models?.items.find((m) => m.id === item.modeloId);
      const subtotalNumber = Number.parseFloat(item.subtotal.replace(/[^0-9.-]+/g, ''));

      const newItem: QuoteItem = {
        glassId: item.vidrioId,
        glassTypeName: `Vidrio ${item.vidrioId.slice(-idSuffixLength)}`,
        heightMm: item.altoMm,
        id: `temp-${itemIdCounter}`,
        modelId: item.modeloId,
        modelName: model?.name || 'Modelo desconocido',
        quantity: item.cantidad,
        services: item.servicios.map((s) => ({
          quantity: s.cantidad,
          serviceId: s.serviceId,
          serviceName: `Servicio ${s.serviceId.slice(-idSuffixLength)}`,
        })),
        subtotal: subtotalNumber,
        widthMm: item.anchoMm,
      };

      setQuoteItems((prev) => [...prev, newItem]);
      setItemIdCounter((prev) => prev + 1);
    },
    [models, itemIdCounter]
  );

  // Adapter function to convert English PriceCalculator output to Spanish handleAddToQuote input
  const handleAddToQuoteAdapter = useCallback(
    (item: {
      modelId: string;
      widthMm: number;
      heightMm: number;
      glassTypeId: string;
      services: Array<{ serviceId: string; quantity: number }>;
      quantity: number;
      subtotal: string;
    }) => {
      handleAddToQuote({
        altoMm: item.heightMm,
        anchoMm: item.widthMm,
        cantidad: item.quantity,
        modeloId: item.modelId,
        servicios: item.services.map((s) => ({
          cantidad: s.quantity,
          serviceId: s.serviceId,
        })),
        subtotal: item.subtotal,
        vidrioId: item.glassTypeId,
      });
    },
    [handleAddToQuote]
  );

  const totalQuoteAmount = quoteItems.reduce((sum, item) => sum + item.subtotal, 0);
  const selectedModel = models?.items.find((m) => m.id === selectedModelId);

  // Mock services data - in real app this would come from API
  const mockServices = [
    { id: '1', name: 'Corte', price: '$50', unit: 'ml' as const },
    { id: '2', name: 'Pulido', price: '$100', unit: 'm2' as const },
    { id: '3', name: 'Templado', price: '$200', unit: 'unidad' as const },
  ];

  if (modelsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-muted-foreground">Cargando información para cotización...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation */}
      <nav aria-label="Navegación" className="mb-6">
        <Button className="mb-4" onClick={handleGoBack} variant="ghost">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="mb-2 font-bold text-3xl text-foreground">Nueva cotización</h1>
            <p className="text-lg text-muted-foreground">
              Configure las especificaciones de sus productos de vidrio y obtenga precios en tiempo real
            </p>
          </div>
          {quoteItems.length > 0 && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                <span className="font-medium text-foreground">{quoteItems.length}</span>
                <span className="text-muted-foreground"> ítems</span>
              </div>
              <Button onClick={handleViewReview}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ver cotización
              </Button>
            </div>
          )}
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Model Selection and Price Calculator */}
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Selección de modelo</CardTitle>
              <CardDescription>Elija el modelo de vidrio para cotizar</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {models?.items.slice(0, maxModelPreview).map((model) => (
                    <Card
                      className={`cursor-pointer transition-all ${
                        selectedModelId === model.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                      }`}
                      key={model.id}
                      onClick={() => setSelectedModelId(model.id)}
                    >
                      <CardContent className="p-4">
                        <h4 className="font-medium text-foreground">{model.name}</h4>
                        <p className="text-muted-foreground text-sm">
                          {model.minWidthMm}-{model.maxWidthMm}mm × {model.minHeightMm}-{model.maxHeightMm}mm
                        </p>
                        <p className="mt-1 font-medium text-foreground text-sm">
                          Desde ${model.basePrice.toLocaleString('es-LA')}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {selectedModel && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Configurador de productos
                </CardTitle>
                <CardDescription>Configure las especificaciones para {selectedModel.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <PriceCalculator
                  model={{
                    basePrice: String(selectedModel.basePrice),
                    compatibleGlassTypes: [], // TODO: Transform compatibleGlassTypeIds
                    id: selectedModel.id,
                    manufacturer: 'Fabricante', // TODO: Get from manufacturer
                    name: selectedModel.name,
                    range: {
                      height: [selectedModel.minHeightMm, selectedModel.maxHeightMm],
                      width: [selectedModel.minWidthMm, selectedModel.maxWidthMm],
                    },
                  }}
                  onAddToQuote={handleAddToQuoteAdapter}
                  services={mockServices.map((s) => ({
                    id: s.id,
                    name: s.name,
                    price: s.price,
                    unit: s.unit,
                  }))}
                />
              </CardContent>
            </Card>
          )}

          {!selectedModel && models && models.items.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No hay modelos disponibles para cotización en este momento.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quote Summary Sidebar */}
        <div className="space-y-6">
          {/* Current Quote */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Resumen de cotización
              </CardTitle>
            </CardHeader>
            <CardContent>
              {quoteItems.length === 0 ? (
                <div className="py-6 text-center text-muted-foreground text-sm">
                  No hay ítems en la cotización.
                  <br />
                  Seleccione un modelo y configure un producto para comenzar.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {quoteItems.slice(-maxVisibleItems).map((item) => (
                      <div className="rounded-lg border p-3 text-sm" key={item.id}>
                        <div className="font-medium text-foreground">{item.modelName}</div>
                        <div className="text-muted-foreground text-xs">
                          {item.widthMm}×{item.heightMm}mm • {item.glassTypeName}
                          {item.quantity > 1 && ` • Cant: ${item.quantity}`}
                        </div>
                        <div className="mt-1 text-right font-medium text-foreground">
                          ${item.subtotal.toLocaleString('es-LA')}
                        </div>
                      </div>
                    ))}
                    {quoteItems.length > maxVisibleItems && (
                      <div className="text-center text-muted-foreground text-xs">
                        +{quoteItems.length - maxVisibleItems} ítems más
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-3">
                    <div className="flex justify-between font-medium text-sm">
                      <span>Total:</span>
                      <span className="text-foreground text-lg">${totalQuoteAmount.toLocaleString('es-LA')}</span>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleViewReview}>
                    Ver cotización completa
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Help Card */}
          <Card>
            <CardHeader>
              <CardTitle>¿Necesita ayuda?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground text-sm">
              <div>
                <strong className="text-foreground">Modelo:</strong> Seleccione el modelo de vidrio más adecuado.
              </div>
              <div>
                <strong className="text-foreground">Dimensiones:</strong> Ingrese las medidas exactas en milímetros.
              </div>
              <div>
                <strong className="text-foreground">Tipo de vidrio:</strong> Seleccione según su aplicación específica.
              </div>
              <div>
                <strong className="text-foreground">Servicios:</strong> Agregue servicios adicionales como corte o
                pulido.
              </div>
              <div className="pt-2">
                <p className="text-xs">Los precios se calculan en tiempo real y pueden variar según disponibilidad.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
