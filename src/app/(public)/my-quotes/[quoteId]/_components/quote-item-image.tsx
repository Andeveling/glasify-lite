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

'use client';

import { useState, useCallback, type KeyboardEvent } from 'react';
import Image from 'next/image';
import { WindowDiagram } from '@/components/quote/window-diagram';
import { getProductImageWithFallback } from '@/lib/utils/image-utils';
import type { WindowType } from '@/types/window.types';
import { DEFAULT_WINDOW_TYPE } from '@/types/window.types';

/**
 * Size configuration for responsive thumbnails
 */
const SIZE_CONFIG = {
  sm: {
    container: 'h-16 w-16', // 64px
    imageSize: 64,
    sizes: '64px',
  },
  md: {
    container: 'h-24 w-24', // 96px
    imageSize: 96,
    sizes: '(max-width: 768px) 64px, 96px',
  },
  lg: {
    container: 'h-32 w-32', // 128px
    imageSize: 128,
    sizes: '(max-width: 768px) 96px, 128px',
  },
} as const;

export type QuoteItemImageSize = keyof typeof SIZE_CONFIG;

export interface QuoteItemImageProps {
  /**
   * Product model name for alt text
   */
  modelName: string;

  /**
   * Product image URL (CDN URL or original)
   */
  modelImageUrl: string | null;

  /**
   * Window type for SVG diagram fallback
   */
  windowType: WindowType;

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
}

/**
 * QuoteItemImage Component
 * 
 * Renders product thumbnail with automatic fallback to SVG diagram.
 * Optimizes images via CDN and implements progressive loading.
 */
export function QuoteItemImage({
  modelName,
  modelImageUrl,
  windowType,
  size = 'md',
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
      if (event.key === 'Enter' || event.key === ' ') {
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
    ? getProductImageWithFallback(modelImageUrl, windowType, size as any)
    : null;

  return (
    <button
      type="button"
      data-testid="quote-item-image"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`
        ${sizeConfig.container}
        relative
        aspect-square
        overflow-hidden
        rounded-lg
        bg-muted
        transition-all
        hover:ring-2
        hover:ring-primary/20
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
        focus-visible:ring-offset-2
        cursor-pointer
        ${!isImageLoaded && shouldShowImage ? 'animate-pulse' : ''}
      `}
      aria-label={`Ver imagen de ${modelName}`}
    >
      {shouldShowImage ? (
        <Image
          src={optimizedImageUrl!}
          alt={modelName}
          fill
          sizes={sizeConfig.sizes}
          loading={eager ? 'eager' : 'lazy'}
          onError={handleImageError}
          onLoad={handleImageLoad}
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center p-2">
          <WindowDiagram
            type={windowType || DEFAULT_WINDOW_TYPE}
            size={size}
            className="object-contain"
          />
        </div>
      )}
    </button>
  );
}

/**
 * Usage Examples:
 * 
 * ```tsx
 * // With product image
 * <QuoteItemImage
 *   modelName="VEKA Guardian 10mm"
 *   modelImageUrl="https://cdn.example.com/models/veka-guardian.jpg"
 *   windowType={WindowType.SLIDING_2_PANEL}
 *   size="md"
 *   onClick={() => openLightbox(item)}
 * />
 * 
 * // With SVG fallback
 * <QuoteItemImage
 *   modelName="Ventana Corrediza"
 *   modelImageUrl={null}
 *   windowType={WindowType.SLIDING_2_PANEL}
 *   size="lg"
 *   onClick={() => openLightbox(item)}
 * />
 * 
 * // Eager loading (above fold)
 * <QuoteItemImage
 *   modelName="Featured Product"
 *   modelImageUrl="https://cdn.example.com/featured.jpg"
 *   windowType={WindowType.FIXED_SINGLE}
 *   size="lg"
 *   eager
 *   onClick={() => openLightbox(item)}
 * />
 * ```
 */
