/**
 * Design Gallery Selector Component
 *
 * Client Component que muestra una galería de diseños predefinidos
 * Permite filtrar por tipo de modelo y seleccionar un diseño
 *
 * Features:
 * - Filtro automático por tipo de modelo
 * - Grid responsivo con previews
 * - Preview on hover/click usando DesignPreview
 * - Integración con react-hook-form
 * - Loading states y error handling
 */

'use client';

import type { MaterialType, ModelType } from '@prisma/client';
import designAdapterService from '@/server/services/design-adapter-service';
import { api } from '@/trpc/react';
import { DesignPreview } from './design-preview';

interface DesignGallerySelectorProps {
  /** Tipo de modelo para filtrar diseños compatibles */
  modelType: ModelType;
  /** Tipo de material del perfil (para resolución de colores) */
  materialType: MaterialType;
  /** ID del diseño seleccionado actualmente */
  value?: string | null;
  /** Handler cuando se selecciona un diseño */
  onChange: (designId: string | null) => void;
  /** ClassName adicional para el contenedor */
  className?: string;
}

/**
 * DesignGallerySelector Component
 *
 * Galería visual de diseños predefinidos filtrados por tipo de modelo
 * Optimizado para formularios con react-hook-form
 */
export function DesignGallerySelector({
  modelType,
  materialType,
  value,
  onChange,
  className = '',
}: DesignGallerySelectorProps) {
  // Fetch diseños compatibles con el tipo de modelo
  const {
    data: designs,
    isLoading,
    error,
  } = api.admin[ 'model-design' ].list.useQuery({
    isActive: true,
    type: modelType,
  });

  const handleSelect = (designId: string) => {
    // Toggle selection: si ya está seleccionado, deseleccionar
    onChange(value === designId ? null : designId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 text-sm">Diseño Visual</h3>
          <p className="text-gray-500 text-xs">Cargando diseños disponibles...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[ 1, 2, 3, 4 ].map((i) => (
            <div className="animate-pulse" key={i}>
              <div className="aspect-square rounded-lg bg-gray-200" />
              <div className="mt-2 h-4 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`rounded-lg border border-red-200 bg-red-50 p-6 ${className}`}>
        <div className="flex items-start gap-3">
          <svg className="size-5 flex-shrink-0 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <title>Error</title>
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fillRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-medium text-red-800 text-sm">Error al cargar diseños</h3>
            <p className="mt-1 text-red-700 text-xs">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!designs || designs.length === 0) {
    return (
      <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
        <div className="text-center">
          <svg className="mx-auto size-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
            <title>No hay diseños</title>
            <rect
              height="28"
              rx="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              width="36"
              x="6"
              y="10"
            />
            <path d="M6 18h36M6 26h36M12 14h.01M18 14h.01M24 14h.01" strokeLinecap="round" strokeWidth="2" />
          </svg>
          <h3 className="mt-2 font-medium text-gray-900 text-sm">No hay diseños disponibles</h3>
          <p className="mt-1 text-gray-500 text-xs">
            No se encontraron diseños activos para el tipo de modelo seleccionado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border border-gray-200 bg-white p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-medium text-gray-700 text-sm">Diseño Visual (Opcional)</h3>
          <p className="text-gray-500 text-xs">
            {designs.length} diseño{designs.length !== 1 ? 's' : ''} disponible{designs.length !== 1 ? 's' : ''}
          </p>
        </div>
        {value && (
          <button
            className="font-medium text-blue-600 text-xs hover:text-blue-500"
            onClick={() => onChange(null)}
            type="button"
          >
            Deseleccionar
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {designs.map((design) => {
          try {
            // Adaptar diseño para preview (200x150px)
            const adaptedDesign = designAdapterService.adaptDesign(design.config, 200, 150, materialType);

            return (
              <DesignPreview
                design={adaptedDesign}
                height={150}
                isSelected={value === design.id}
                key={design.id}
                modelType={design.type}
                nameEs={design.nameEs}
                onClick={() => handleSelect(design.id)}
                width={200}
              />
            );
          } catch (_error) {
            return (
              <div className="rounded-lg border-2 border-gray-300 border-dashed bg-gray-50 p-4" key={design.id}>
                <p className="text-center text-gray-500 text-xs">Error: {design.nameEs}</p>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
