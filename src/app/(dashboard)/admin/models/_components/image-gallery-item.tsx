'use client';

/**
 * Image Gallery Item Component
 *
 * Individual thumbnail in the gallery grid
 * - Shows preview image
 * - Visual feedback on selection (border highlight)
 * - Accessible button with ARIA labels
 * - Handles click to select
 */

import Image from 'next/image';

interface ImageGalleryItemProps {
  /**
   * Public URL of the image
   */
  url: string;

  /**
   * Human-readable name of the image
   */
  name: string;

  /**
   * Whether this image is currently selected
   */
  isSelected: boolean;

  /**
   * Callback when image is clicked
   */
  onSelect: () => void;
}

/**
 * Gallery item component - small thumbnail with selection state
 */
export function ImageGalleryItem({ url, name, isSelected, onSelect }: ImageGalleryItemProps) {
  return (
    <button
      aria-label={`Seleccionar imagen: ${name}`}
      aria-pressed={isSelected}
      className={`relative aspect-square overflow-hidden rounded-md border-2 transition-all hover:border-primary/50 ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:bg-accent'
        }`}
      onClick={onSelect}
      type="button"
    >
      <Image
        alt={name}
        className="h-full w-full object-contain p-1"
        draggable={false}
        fill
        sizes="(max-width: 640px) 100px, 120px"
        src={url}
      />
    </button>
  );
}
