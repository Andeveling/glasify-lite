'use client';

/**
 * Image Gallery Section Component
 *
 * Displays a visual selector for model design images
 * - Large preview of currently selected image
 * - Grid gallery of available images (4 columns)
 * - Click to select, visual feedback
 * - Lazy loading and accessibility
 *
 * Integrates with react-hook-form using useFormContext
 * Manages both display and form state
 */

import Image from 'next/image';
import { useFormContext } from 'react-hook-form';
import { Skeleton } from '@/components/ui/skeleton';
import { api } from '@/trpc/react';
import { ImageGalleryItem } from './image-gallery-item';

interface ImageGallerySectionProps {
  /**
   * Name of the form field (for react-hook-form)
   * @example "imageUrl"
   */
  name?: string;

  /**
   * Optional custom label
   */
  label?: string;

  /**
   * Optional custom description
   */
  description?: string;
}

/**
 * Loading skeleton for gallery grid
 */
function GalleryGridSkeleton() {
  return (
    <div className="space-y-4">
      {/* Preview skeleton */}
      <Skeleton className="h-48 w-48 rounded-lg" />

      {/* Gallery grid skeleton */}
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton className="aspect-square rounded-md" key={i} />
        ))}
      </div>
    </div>
  );
}

/**
 * Image Gallery Section Component
 *
 * Usage in ModelForm:
 * ```tsx
 * <ImageGallerySectionComponent />
 * ```
 *
 * The component automatically connects to the form's `imageUrl` field
 */
export function ImageGallerySectionComponent({
  name = 'imageUrl',
  label = 'Imagen del Modelo',
  description = 'Selecciona una imagen de la galería disponible',
}: ImageGallerySectionProps) {
  // Connect to react-hook-form using context
  const { watch, setValue } = useFormContext();
  const currentValue = watch(name);

  // Fetch gallery images from tRPC
  // Note: tRPC returns GalleryImage[] | GalleryError, but query guarantees empty array on error
  // so we can safely treat data as an array after the error check
  const { data: rawData = [], isLoading, error } = api.admin.gallery[ 'list-images' ].useQuery();

  // Type assertion: we know it's always an array due to router implementation
  const images: typeof rawData = Array.isArray(rawData) ? rawData : [];

  // Handle API error gracefully
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-800 text-sm">Error al cargar la galería</p>
        <p className="text-red-600 text-sm">{error.message}</p>
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return <GalleryGridSkeleton />;
  }

  // Show message if no images available
  if (images.length === 0) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="font-medium text-amber-800 text-sm">No hay imágenes disponibles</p>
        <p className="text-amber-600 text-xs">Agrega imágenes SVG a /public/models/designs/</p>
      </div>
    );
  }

  // Find selected image for preview
  const selectedImage = images.find((img) => img.url === currentValue);

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h3 className="font-semibold text-sm">{label}</h3>
        {description && <p className="mt-1 text-muted-foreground text-xs">{description}</p>}
      </div>

      {/* Current Selection Preview */}
      {selectedImage ? (
        <div className="flex items-center gap-3 rounded-lg border border-primary bg-primary/5 p-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border border-primary/20 bg-white">
            <Image
              alt={selectedImage.name}
              className="h-full w-full object-contain"
              height={64}
              src={selectedImage.url}
              width={64}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-sm">{selectedImage.name}</p>
            <p className="truncate text-muted-foreground text-xs">{selectedImage.filename}</p>
          </div>
          <button
            aria-label="Deseleccionar imagen"
            className="font-medium text-primary text-xs transition-colors hover:text-primary/80"
            onClick={() => setValue(name, null)}
            type="button"
          >
            Limpiar
          </button>
        </div>
      ) : (
        <div className="rounded-lg border-2 border-muted-foreground/30 border-dashed p-3">
          <p className="text-center text-muted-foreground text-sm">No hay imagen seleccionada</p>
        </div>
      )}

      {/* Gallery Grid */}
      <div>
        <p className="mb-2 font-medium text-muted-foreground text-xs">Galería disponible ({images.length})</p>
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {images.map((image) => (
            <ImageGalleryItem
              isSelected={currentValue === image.url}
              key={image.url}
              name={image.name}
              onSelect={() => setValue(name, image.url)}
              url={image.url}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
