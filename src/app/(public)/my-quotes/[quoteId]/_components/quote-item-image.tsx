/**
 * QuoteItemImage Component
 *
 * Displays product thumbnail image with SVG diagram fallback.
 * Features:
 * - Lazy loading for performance
 * - Optimized CDN images with responsive srcset
 * - Automatic fallback to WindowDiagram on error/missing image
 * - Click handler for lightbox viewer
 * - Accessible keyboard navigation
 *
 * @module QuoteItemImage
 */

"use client";

import Image from "next/image";
import { type KeyboardEvent, useCallback, useState } from "react";
import { WindowDiagram } from "@/components/quote/window-diagram";
import { getProductImageWithFallback } from "@/lib/utils/image-utils";
import type { WindowType } from "@/types/window.types";
import { DEFAULT_WINDOW_TYPE } from "@/types/window.types";

/**
 * Size configuration for responsive thumbnails
 */
const SIZE_CONFIG = {
  lg: {
    container: "h-32 w-32", // 128px
    imageSize: 128,
    sizes: "(max-width: 768px) 96px, 128px",
  },
  md: {
    container: "h-24 w-24", // 96px
    imageSize: 96,
    sizes: "(max-width: 768px) 64px, 96px",
  },
  sm: {
    container: "h-16 w-16", // 64px
    imageSize: 64,
    sizes: "64px",
  },
} as const;

export type QuoteItemImageSize = keyof typeof SIZE_CONFIG;

export type QuoteItemImageProps = {
  /**
   * Product model name for alt text
   */
  modelName: string;

  /**
   * Product image URL (CDN URL or original)
   */
  modelImageUrl: string | null;

  /**
   * Window type for SVG diagram fallback (optional, defaults to FIXED_SINGLE)
   */
  windowType?: WindowType;

  /**
   * Thumbnail size (default: md)
   */
  size?: QuoteItemImageSize;

  /**
   * Click handler to open lightbox
   */
  onClick?: () => void;

  /**
   * Disable lazy loading (use for above-the-fold images)
   */
  eager?: boolean;
};

/**
 * QuoteItemImage Component
 *
 * Renders product thumbnail with automatic fallback to SVG diagram.
 * Optimizes images via CDN and implements progressive loading.
 */
export function QuoteItemImage({
  modelName,
  modelImageUrl,
  windowType = DEFAULT_WINDOW_TYPE,
  size = "md",
  onClick,
  eager = false,
}: QuoteItemImageProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const sizeConfig = SIZE_CONFIG[size];
  const shouldShowImage = modelImageUrl && !hasImageError;

  /**
   * Handle image load error - fallback to SVG diagram
   */
  const handleImageError = useCallback(() => {
    setHasImageError(true);
  }, []);

  /**
   * Handle image load success
   */
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
  }, []);

  /**
   * Handle keyboard interaction (Enter/Space)
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onClick?.();
      }
    },
    [onClick]
  );

  /**
   * Optimize image URL via CDN
   */
  const optimizedImageUrl = shouldShowImage
    ? getProductImageWithFallback(
        modelImageUrl,
        windowType,
        size as QuoteItemImageSize
      )
    : null;

  return (
    <button
      aria-label={`Ver imagen de ${modelName}`}
      className={`
        ${sizeConfig.container} relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted transition-all hover:ring-2 hover:ring-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${!isImageLoaded && shouldShowImage ? "animate-pulse" : ""}
      `}
      data-testid="quote-item-image"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      type="button"
    >
      {shouldShowImage && optimizedImageUrl ? (
        <Image
          alt={modelName}
          className="object-cover"
          fill
          loading={eager ? "eager" : "lazy"}
          onError={handleImageError}
          onLoad={handleImageLoad}
          sizes={sizeConfig.sizes}
          src={optimizedImageUrl}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2">
          <WindowDiagram
            className="object-contain"
            size={size}
            type={windowType || DEFAULT_WINDOW_TYPE}
          />
        </div>
      )}
    </button>
  );
}
