/**
 * ImageViewerDialog Component
 * 
 * Full-screen lightbox for viewing product images with specifications.
 * Features:
 * - Radix UI Dialog for accessibility
 * - Full-size image display
 * - Product specifications overlay
 * - Keyboard shortcuts (Escape to close)
 * - Focus trap and scroll lock
 * - Mobile-friendly fullscreen view
 * 
 * @module ImageViewerDialog
 */

'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogOverlay,
  DialogClose,
} from '@/components/ui/dialog';
import { WindowDiagram } from '@/components/quote/window-diagram';
import { getProductImageWithFallback } from '@/lib/utils/image-utils';
import { WINDOW_TYPE_LABELS, DEFAULT_WINDOW_TYPE } from '@/types/window.types';
import type { WindowType } from '@/types/window.types';

export interface ImageViewerDialogProps {
  /**
   * Dialog open state
   */
  open: boolean;

  /**
   * Close handler
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Product model name
   */
  modelName: string;

  /**
   * Product image URL
   */
  modelImageUrl: string | null;

  /**
   * Window type for fallback/info
   */
  windowType: WindowType;

  /**
   * Product dimensions (formatted string)
   */
  dimensions?: string;

  /**
   * Additional product specifications
   */
  specifications?: {
    glassType?: string;
    manufacturer?: string;
    thickness?: string;
    treatment?: string;
  };
}

/**
 * ImageViewerDialog Component
 * 
 * Lightbox viewer with product image and specifications overlay.
 */
export function ImageViewerDialog({
  open,
  onOpenChange,
  modelName,
  modelImageUrl,
  windowType,
  dimensions,
  specifications,
}: ImageViewerDialogProps) {
  const hasImage = Boolean(modelImageUrl);
  const optimizedImageUrl = hasImage
    ? getProductImageWithFallback(modelImageUrl, windowType, 'xl')
    : null;

  const windowTypeLabel = WINDOW_TYPE_LABELS[windowType] ?? WINDOW_TYPE_LABELS[DEFAULT_WINDOW_TYPE];

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogOverlay
        data-testid="dialog-overlay"
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      />
      <DialogContent
        data-testid="image-viewer-dialog"
        aria-label={`Visor de imagen: ${modelName}`}
        className="
          fixed
          left-[50%]
          top-[50%]
          z-50
          max-h-[90vh]
          w-[90vw]
          max-w-6xl
          translate-x-[-50%]
          translate-y-[-50%]
          bg-transparent
          p-0
          shadow-2xl
          focus:outline-none
        "
      >
        {/* Close button */}
        <DialogClose
          className="
            absolute
            right-4
            top-4
            z-10
            rounded-full
            bg-black/50
            p-2
            text-white
            backdrop-blur-sm
            transition-all
            hover:bg-black/70
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-white
            focus-visible:ring-offset-2
            focus-visible:ring-offset-black
          "
          aria-label="Cerrar visor de imagen"
        >
          <X className="h-6 w-6" />
        </DialogClose>

        {/* Image container */}
        <div className="relative flex h-[90vh] w-full items-center justify-center">
          {hasImage ? (
            <div className="relative h-full w-full">
              <Image
                data-testid="lightbox-image"
                src={optimizedImageUrl!}
                alt={modelName}
                fill
                sizes="90vw"
                className="object-contain"
                priority
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background/10 backdrop-blur-lg">
              <div className="max-w-2xl p-8">
                <WindowDiagram
                  type={windowType || DEFAULT_WINDOW_TYPE}
                  size="xl"
                  className="mx-auto"
                />
              </div>
            </div>
          )}

          {/* Product info overlay */}
          <div
            className="
              absolute
              bottom-0
              left-0
              right-0
              bg-gradient-to-t
              from-black/80
              via-black/50
              to-transparent
              p-6
              text-white
            "
          >
            <h3 className="mb-2 text-2xl font-bold">{modelName}</h3>

            <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
              {/* Window Type */}
              <div>
                <span className="font-semibold">Tipo:</span>{' '}
                <span>{windowTypeLabel}</span>
              </div>

              {/* Dimensions */}
              {dimensions && (
                <div>
                  <span className="font-semibold">Dimensiones:</span>{' '}
                  <span>{dimensions}</span>
                </div>
              )}

              {/* Glass Type */}
              {specifications?.glassType && (
                <div>
                  <span className="font-semibold">Vidrio:</span>{' '}
                  <span>{specifications.glassType}</span>
                </div>
              )}

              {/* Manufacturer */}
              {specifications?.manufacturer && (
                <div>
                  <span className="font-semibold">Fabricante:</span>{' '}
                  <span>{specifications.manufacturer}</span>
                </div>
              )}

              {/* Thickness */}
              {specifications?.thickness && (
                <div>
                  <span className="font-semibold">Espesor:</span>{' '}
                  <span>{specifications.thickness}</span>
                </div>
              )}

              {/* Treatment */}
              {specifications?.treatment && (
                <div>
                  <span className="font-semibold">Tratamiento:</span>{' '}
                  <span>{specifications.treatment}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Usage Example:
 * 
 * ```tsx
 * function QuoteItemCard({ item }) {
 *   const [lightboxOpen, setLightboxOpen] = useState(false);
 * 
 *   return (
 *     <>
 *       <QuoteItemImage
 *         {...item}
 *         onClick={() => setLightboxOpen(true)}
 *       />
 * 
 *       <ImageViewerDialog
 *         open={lightboxOpen}
 *         onOpenChange={setLightboxOpen}
 *         modelName={item.modelName}
 *         modelImageUrl={item.modelImageUrl}
 *         windowType={item.windowType}
 *         dimensions={`${item.width} x ${item.height} cm`}
 *         specifications={{
 *           glassType: item.glassType,
 *           manufacturer: item.manufacturer,
 *         }}
 *       />
 *     </>
 *   );
 * }
 * ```
 */
