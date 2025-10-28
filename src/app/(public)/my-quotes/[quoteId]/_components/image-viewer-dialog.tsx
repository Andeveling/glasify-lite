/**
 * ImageViewerDialog Component
 *
 * Full-screen lightbox for viewing product images with specifications.
 * Features:
 * - Radix UI Dialog for accessibility (WCAG AA compliant)
 * - Visually hidden DialogTitle for screen reader users
 * - Full-size image display
 * - Product specifications overlay
 * - Keyboard shortcuts (Escape to close)
 * - Focus trap and scroll lock
 * - Mobile-friendly fullscreen view
 *
 * @module ImageViewerDialog
 */

"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";
import { WindowDiagram } from "@/components/quote/window-diagram";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { getProductImageWithFallback } from "@/lib/utils/image-utils";
import type { WindowType } from "@/types/window.types";
import { DEFAULT_WINDOW_TYPE, WINDOW_TYPE_LABELS } from "@/types/window.types";

export type ImageViewerDialogProps = {
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
};

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
    ? getProductImageWithFallback(modelImageUrl, windowType, "xl")
    : null;

  const windowTypeLabel =
    WINDOW_TYPE_LABELS[windowType] ?? WINDOW_TYPE_LABELS[DEFAULT_WINDOW_TYPE];

  /**
   * Handle keyboard shortcuts
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogOverlay
        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
        data-testid="dialog-overlay"
      />
      <DialogContent
        aria-label={`Visor de imagen: ${modelName}`}
        className="fixed top-[50%] left-[50%] z-50 max-h-[90vh] w-[90vw] max-w-6xl translate-x-[-50%] translate-y-[-50%] overflow-hidden border-border bg-card p-0 shadow-2xl focus:outline-none"
        data-testid="image-viewer-dialog"
        showCloseButton={false}
      >
        {/* Hidden title for screen readers (required by Radix UI) */}
        <VisuallyHidden>
          <DialogTitle>Visor de imagen: {modelName}</DialogTitle>
        </VisuallyHidden>

        {/* Close button */}
        <DialogClose
          aria-label="Cerrar visor de imagen"
          asChild
          className="absolute top-2 right-2 z-10 rounded-full bg-card/80 p-2 text-foreground backdrop-blur-sm transition-all hover:bg-card/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          <Button size="icon" variant="ghost">
            <X className="size-6" />
          </Button>
        </DialogClose>

        {/* Image container */}
        <Card className="relative flex h-[70vh] w-full items-center justify-center bg-background">
          {hasImage && optimizedImageUrl ? (
            <div className="relative h-full w-full">
              <Image
                alt={modelName}
                className="object-contain"
                data-testid="lightbox-image"
                fill
                priority
                sizes="90vw"
                src={optimizedImageUrl}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-background/10 backdrop-blur-lg">
              <div className="max-w-2xl p-8">
                <WindowDiagram
                  className="mx-auto"
                  size="xl"
                  type={windowType || DEFAULT_WINDOW_TYPE}
                />
              </div>
            </div>
          )}

          {/* Product info overlay */}
          <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-background/90 via-card/80 to-transparent p-6 text-foreground">
            <h3 className="mb-2 font-bold text-2xl">{modelName}</h3>

            <div className="grid gap-2 text-sm md:grid-cols-2 lg:grid-cols-3">
              {/* Window Type */}
              <div>
                <span className="font-semibold">Tipo:</span>{" "}
                <span>{windowTypeLabel}</span>
              </div>

              {/* Dimensions */}
              {dimensions && (
                <div>
                  <span className="font-semibold">Dimensiones:</span>{" "}
                  <span>{dimensions}</span>
                </div>
              )}

              {/* Glass Type */}
              {specifications?.glassType && (
                <div>
                  <span className="font-semibold">Vidrio:</span>{" "}
                  <span>{specifications.glassType}</span>
                </div>
              )}

              {/* Manufacturer */}
              {specifications?.manufacturer && (
                <div>
                  <span className="font-semibold">Fabricante:</span>{" "}
                  <span>{specifications.manufacturer}</span>
                </div>
              )}

              {/* Thickness */}
              {specifications?.thickness && (
                <div>
                  <span className="font-semibold">Espesor:</span>{" "}
                  <span>{specifications.thickness}</span>
                </div>
              )}

              {/* Treatment */}
              {specifications?.treatment && (
                <div>
                  <span className="font-semibold">Tratamiento:</span>{" "}
                  <span>{specifications.treatment}</span>
                </div>
              )}
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
