/**
 * Image Utilities for Quote Items
 * 
 * Provides helper functions for image handling including CDN URLs,
 * fallback logic, and optimization for product images in quotes.
 * 
 * @module ImageUtils
 */

import type { WindowType } from '@/types/window.types';
import { getWindowDiagramPath } from './window-diagram-map';

/**
 * Image size presets for product thumbnails
 */
export type ImageSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Image size dimensions (width x height in pixels)
 */
export const IMAGE_SIZES: Record<ImageSize, { width: number; height: number }> = {
  sm: { width: 80, height: 80 },   // List item preview
  md: { width: 160, height: 160 }, // Grid thumbnail
  lg: { width: 320, height: 320 }, // Detail view
  xl: { width: 640, height: 640 }, // Lightbox/full view
};

/**
 * CDN configuration (placeholder - update with actual CDN)
 */
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_URL ?? '';

/**
 * Default placeholder image when no product image exists
 */
const DEFAULT_PLACEHOLDER = '/images/placeholder-product.svg';

/**
 * Image format preferences (modern formats first)
 */
const SUPPORTED_FORMATS = ['webp', 'avif', 'png', 'jpg', 'jpeg'] as const;
export type ImageFormat = typeof SUPPORTED_FORMATS[number];

/**
 * Get optimized image URL
 * 
 * Generates a CDN URL with size and format optimization.
 * Falls back to original URL if CDN is not configured.
 * 
 * @param imageUrl - Original image URL (absolute or relative)
 * @param size - Desired image size preset
 * @param format - Target image format (default: webp)
 * @returns Optimized image URL
 * 
 * @example
 * ```typescript
 * const url = getOptimizedImageUrl('/uploads/window-123.jpg', 'md', 'webp');
 * // With CDN: 'https://cdn.example.com/uploads/window-123.jpg?w=160&h=160&fmt=webp'
 * // Without CDN: '/uploads/window-123.jpg'
 * ```
 */
export function getOptimizedImageUrl(
  imageUrl: string | null | undefined,
  size: ImageSize = 'md',
  format: ImageFormat = 'webp'
): string {
  if (!imageUrl) {
    return DEFAULT_PLACEHOLDER;
  }
  
  // If CDN is configured, use it
  if (CDN_BASE_URL) {
    const dimensions = IMAGE_SIZES[size];
    const params = new URLSearchParams({
      w: dimensions.width.toString(),
      h: dimensions.height.toString(),
      fmt: format,
      fit: 'cover',
      q: '85', // Quality 85%
    });
    
    const baseUrl = imageUrl.startsWith('http') ? imageUrl : `${CDN_BASE_URL}${imageUrl}`;
    return `${baseUrl}?${params.toString()}`;
  }
  
  // No CDN: return original URL
  return imageUrl;
}

/**
 * Get product image URL with fallback
 * 
 * Attempts to load product image, falls back to window diagram SVG,
 * and finally to default placeholder.
 * 
 * @param productImageUrl - Product image URL (can be null)
 * @param windowType - Window type for fallback diagram
 * @param size - Image size preset
 * @returns Image URL or fallback
 * 
 * @example
 * ```typescript
 * const url = getProductImageWithFallback(
 *   null,
 *   'sliding-2-panel',
 *   'md'
 * );
 * // Returns: '/diagrams/windows/sliding-2-panel.svg'
 * ```
 */
export function getProductImageWithFallback(
  productImageUrl: string | null | undefined,
  windowType?: WindowType | string | null,
  size: ImageSize = 'md'
): string {
  // Priority 1: Product image
  if (productImageUrl) {
    return getOptimizedImageUrl(productImageUrl, size);
  }
  
  // Priority 2: Window diagram SVG
  if (windowType) {
    return getWindowDiagramPath(windowType);
  }
  
  // Priority 3: Default placeholder
  return DEFAULT_PLACEHOLDER;
}

/**
 * Check if URL is an external image
 * 
 * @param url - Image URL to check
 * @returns True if URL is external (starts with http/https)
 */
export function isExternalImage(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Check if URL is an SVG
 * 
 * @param url - Image URL to check
 * @returns True if URL ends with .svg
 */
export function isSvgImage(url: string): boolean {
  return url.toLowerCase().endsWith('.svg');
}

/**
 * Generate srcset for responsive images
 * 
 * Creates a srcset string with 1x, 2x, 3x variants for retina displays.
 * 
 * @param imageUrl - Base image URL
 * @param size - Image size preset
 * @returns srcset string or undefined if no URL
 * 
 * @example
 * ```typescript
 * const srcset = generateSrcSet('/uploads/window.jpg', 'md');
 * // '/uploads/window.jpg?w=160 1x, /uploads/window.jpg?w=320 2x, /uploads/window.jpg?w=480 3x'
 * ```
 */
export function generateSrcSet(
  imageUrl: string | null | undefined,
  size: ImageSize = 'md'
): string | undefined {
  if (!imageUrl || isSvgImage(imageUrl)) {
    return undefined; // SVGs don't need srcset
  }
  
  const dimensions = IMAGE_SIZES[size];
  
  if (!CDN_BASE_URL) {
    return undefined; // No CDN, no optimization
  }
  
  const variants = [
    { scale: 1, descriptor: '1x' },
    { scale: 2, descriptor: '2x' },
    { scale: 3, descriptor: '3x' },
  ];
  
  return variants
    .map(({ scale, descriptor }) => {
      const params = new URLSearchParams({
        w: (dimensions.width * scale).toString(),
        h: (dimensions.height * scale).toString(),
        fmt: 'webp',
        fit: 'cover',
        q: '85',
      });
      
      const baseUrl = imageUrl.startsWith('http') ? imageUrl : `${CDN_BASE_URL}${imageUrl}`;
      return `${baseUrl}?${params.toString()} ${descriptor}`;
    })
    .join(', ');
}

/**
 * Get image dimensions from size preset
 * 
 * @param size - Image size preset
 * @returns Width and height in pixels
 */
export function getImageDimensions(size: ImageSize): { width: number; height: number } {
  return IMAGE_SIZES[size];
}

/**
 * Preload critical images
 * 
 * Returns link preload props for Next.js Image component.
 * Use this for above-the-fold images.
 * 
 * @param imageUrl - Image URL to preload
 * @param size - Image size preset
 * @returns Preload link props
 */
export function getImagePreloadProps(imageUrl: string, size: ImageSize = 'md') {
  const dimensions = IMAGE_SIZES[size];
  
  return {
    rel: 'preload',
    as: 'image',
    href: getOptimizedImageUrl(imageUrl, size),
    imageSrcSet: generateSrcSet(imageUrl, size),
    imageSizes: `${dimensions.width}px`,
  };
}

/**
 * Validate image URL format
 * 
 * @param url - Image URL to validate
 * @returns True if URL is valid (http/https or relative path)
 */
export function isValidImageUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  
  // Allow relative paths
  if (url.startsWith('/')) return true;
  
  // Allow data URIs
  if (url.startsWith('data:image/')) return true;
  
  // Allow external URLs (http/https)
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Get image loading strategy
 * 
 * Determines if image should be lazy-loaded or eager-loaded.
 * 
 * @param isAboveFold - True if image is above the fold
 * @param priority - Explicit priority override
 * @returns Loading strategy ('lazy' | 'eager')
 */
export function getImageLoadingStrategy(
  isAboveFold = false,
  priority = false
): 'lazy' | 'eager' {
  return priority || isAboveFold ? 'eager' : 'lazy';
}

/**
 * Format image alt text for accessibility
 * 
 * @param productName - Product/model name
 * @param windowType - Window type (optional)
 * @returns Accessible alt text in Spanish
 * 
 * @example
 * ```typescript
 * formatImageAltText('Ventana VEKA Premium', 'sliding-2-panel');
 * // 'Ventana VEKA Premium - Ventana Corrediza 2 Hojas'
 * ```
 */
export function formatImageAltText(
  productName?: string | null,
  windowType?: WindowType | string | null
): string {
  if (!productName && !windowType) {
    return 'Imagen de producto';
  }
  
  const parts: string[] = [];
  
  if (productName) {
    parts.push(productName);
  }
  
  if (windowType) {
    // Import WindowType labels if needed
    parts.push(`Tipo: ${windowType}`);
  }
  
  return parts.join(' - ');
}
