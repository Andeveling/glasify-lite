/**
 * QuoteItemsGrid Component
 * 
 * Responsive grid layout for displaying quote items with product images.
 * Features:
 * - Responsive columns (2 mobile, 3 tablet, 4 desktop)
 * - Integrated QuoteItemImage components
 * - Click handler to open ImageViewerDialog
 * - Optimized lazy loading strategy
 * - Empty state handling
 * 
 * @module QuoteItemsGrid
 */

'use client';

import { useState } from 'react';
import { QuoteItemImage } from './quote-item-image';
import { ImageViewerDialog } from './image-viewer-dialog';
import type { WindowType } from '@/types/window.types';

/**
 * Quote item data structure for grid
 */
export interface QuoteItemData {
  id: string;
  modelName: string;
  modelImageUrl: string | null;
  windowType: WindowType;
  width: number | null;
  height: number | null;
  glassType?: string;
  manufacturer?: string;
  thickness?: string;
  treatment?: string;
}

export interface QuoteItemsGridProps {
  /**
   * Quote items to display
   */
  items: QuoteItemData[];

  /**
   * Disable lazy loading for above-fold items
   */
  eager?: boolean;

  /**
   * Custom empty state message
   */
  emptyMessage?: string;
}

/**
 * QuoteItemsGrid Component
 * 
 * Grid of product thumbnails with lightbox viewer.
 */
export function QuoteItemsGrid({
  items,
  eager = false,
  emptyMessage = 'No hay elementos en esta cotización',
}: QuoteItemsGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const selectedItem = items.find((item) => item.id === selectedItemId);

  /**
   * Handle thumbnail click
   */
  const handleItemClick = (itemId: string) => {
    setSelectedItemId(itemId);
    setLightboxOpen(true);
  };

  /**
   * Handle lightbox close
   */
  const handleLightboxClose = (open: boolean) => {
    setLightboxOpen(open);
    if (!open) {
      setSelectedItemId(null);
    }
  };

  /**
   * Format dimensions for display
   */
  const formatDimensions = (width: number | null, height: number | null): string | undefined => {
    if (!width || !height) return undefined;
    return `${width} × ${height} cm`;
  };

  // Empty state
  if (items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/20 py-12">
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <>
      {/* Grid */}
      <div
        data-testid="quote-items-grid"
        className="
          grid
          gap-4
          grid-cols-2
          md:grid-cols-3
          lg:grid-cols-4
        "
      >
        {items.map((item, index) => (
          <div key={item.id} className="flex flex-col gap-2">
            {/* Product thumbnail */}
            <QuoteItemImage
              modelName={item.modelName}
              modelImageUrl={item.modelImageUrl}
              windowType={item.windowType}
              size="md"
              onClick={() => handleItemClick(item.id)}
              eager={eager && index < 4} // First 4 items eager
            />

            {/* Product name */}
            <div className="min-h-10">
              <p className="line-clamp-2 text-sm font-medium leading-tight">
                {item.modelName}
              </p>
            </div>

            {/* Dimensions */}
            {(item.width || item.height) && (
              <p className="text-xs text-muted-foreground">
                {formatDimensions(item.width, item.height)}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox viewer */}
      {selectedItem && (
        <ImageViewerDialog
          open={lightboxOpen}
          onOpenChange={handleLightboxClose}
          modelName={selectedItem.modelName}
          modelImageUrl={selectedItem.modelImageUrl}
          windowType={selectedItem.windowType}
          dimensions={formatDimensions(selectedItem.width, selectedItem.height)}
          specifications={{
            glassType: selectedItem.glassType,
            manufacturer: selectedItem.manufacturer,
            thickness: selectedItem.thickness,
            treatment: selectedItem.treatment,
          }}
        />
      )}
    </>
  );
}

/**
 * Usage Example:
 * 
 * ```tsx
 * // In QuoteDetailView
 * const items = quote.items.map(item => ({
 *   id: item.id,
 *   modelName: item.model.name,
 *   modelImageUrl: item.model.imageUrl,
 *   windowType: item.windowType,
 *   width: item.width,
 *   height: item.height,
 *   glassType: item.glassType?.name,
 *   manufacturer: item.model.manufacturer.name,
 * }));
 * 
 * <QuoteItemsGrid items={items} eager />
 * ```
 */
