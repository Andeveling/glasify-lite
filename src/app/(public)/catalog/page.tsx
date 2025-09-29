'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { formatCurrency } from '@/lib/utils';
import { api } from '@/trpc/react';
import { ModelCard } from '../_components/catalog/model-card';
import { ModelFilter } from '../_components/catalog/model-filter';

type FilterOptions = {
  manufacturerId?: string;
  type?: string;
  q?: string;
};

export default function CatalogPage() {
  const router = useRouter();

  // For now, we'll use a default manufacturer ID as the API requires it
  // In the future, this should be dynamic based on available manufacturers
  const defaultManufacturerId = 'cm1l7vnqj000012oxnbhg9abc'; // This should be fetched dynamically

  const {
    data: models,
    isLoading,
    error,
  } = api.catalog['list-models'].useQuery(
    { manufacturerId: defaultManufacturerId },
    {
      refetchOnWindowFocus: false,
      retry: 2,
    }
  );

  const [filters, setFilters] = useState<FilterOptions>({});

  const handleModelSelect = (modelId: string) => {
    router.push(`/catalog/${modelId}`);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  // Filter models based on current filters
  const filteredModels = models?.filter((model) => {
    const matchesSearch = !filters.q || model.name.toLowerCase().includes(filters.q.toLowerCase());

    // Note: We'll need to adjust filtering once we have manufacturer and type data
    return matchesSearch;
  });

  // Mock data for filters - in real app this would come from API
  const mockManufacturers = [
    { id: '1', name: 'VEKA' },
    { id: '2', name: 'Guardian' },
    { id: '3', name: 'Pilkington' },
  ];

  const mockTypes = [
    { label: 'Templado', value: 'templado' },
    { label: 'Laminado', value: 'laminado' },
    { label: 'Float', value: 'float' },
    { label: 'Low-E', value: 'low-e' },
  ];

  const hasActiveFilters = Boolean(filters.q || filters.manufacturerId || filters.type);

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl text-foreground">Error al cargar el catálogo</h1>
          <p className="mb-6 text-muted-foreground">
            No se pudieron cargar los modelos de vidrio. Por favor, intente nuevamente.
          </p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 font-bold text-3xl text-foreground">Catálogo de Vidrios</h1>
        <p className="text-lg text-muted-foreground">
          Explore nuestra amplia selección de modelos de vidrio para encontrar la solución perfecta para su proyecto.
        </p>
      </header>

      {/* Filters */}
      <section aria-label="Filtros de búsqueda" className="mb-8">
        <ModelFilter
          initialFilters={filters}
          manufacturers={mockManufacturers}
          onFilterChange={handleFilterChange}
          types={mockTypes}
        />
      </section>

      {/* Content */}
      <main>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
            <span className="ml-3 text-muted-foreground">Cargando catálogo de modelos...</span>
          </div>
        )}

        {!isLoading && filteredModels && filteredModels.length > 0 && (
          <>
            {/* Results count */}
            <div className="mb-6">
              <p className="text-muted-foreground text-sm">
                Mostrando {filteredModels.length} {filteredModels.length === 1 ? 'modelo' : 'modelos'}
                {hasActiveFilters && ' que coinciden con sus criterios de búsqueda'}
              </p>
            </div>

            {/* Models grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredModels.map((model) => (
                <ModelCard
                  basePrice={formatCurrency(model.basePrice)} // TODO: Get from glass types relationship
                  compatibleGlassTypes={[]} // TODO: Get from manufacturer relationship
                  id={model.id}
                  key={model.id}
                  manufacturer="Fabricante"
                  name={model.name}
                  onSelect={handleModelSelect}
                  range={{
                    height: [model.minHeightMm, model.maxHeightMm],
                    width: [model.minWidthMm, model.maxWidthMm],
                  }}
                />
              ))}
            </div>
          </>
        )}

        {!isLoading && (!filteredModels || filteredModels.length === 0) && (
          /* Empty state */
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 h-16 w-16 opacity-50">
              <svg
                aria-labelledby="no-results-icon"
                className="h-full w-full text-muted-foreground"
                fill="none"
                role="img"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <title id="no-results-icon">Sin resultados</title>
                <path
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="mb-2 font-medium text-foreground text-lg">No se encontraron modelos</h3>
            <p className="mx-auto mb-6 max-w-md text-muted-foreground">
              {hasActiveFilters
                ? 'Intente ajustar los filtros de búsqueda para encontrar modelos que coincidan con sus criterios.'
                : 'No hay modelos disponibles en el catálogo en este momento.'}
            </p>
            {hasActiveFilters && (
              <Button onClick={() => setFilters({})} variant="outline">
                Limpiar filtros
              </Button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
