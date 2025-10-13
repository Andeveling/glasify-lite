/**
 * QuoteItemPreview Component
 *
 * Displays preview of first 3 quote items with thumbnails.
 * Used in quote list cards to give visual context.
 * Features:
 * - Shows first 3 items as small thumbnails (sm size)
 * - Compact horizontal layout
 * - "+N more" indicator for remaining items
 * - Optimized with eager loading (above fold)
 *
 * @module QuoteItemPreview
 */

import type { WindowType } from '@/types/window.types';
import { QuoteItemImage } from '../[quoteId]/_components/quote-item-image';

export interface QuoteItemPreviewData {
  id: string;
  modelName: string;
  modelImageUrl: string | null;
  windowType: WindowType;
}

export interface QuoteItemPreviewProps {
  /**
   * All quote items (only first 3 will be shown)
   */
  items: QuoteItemPreviewData[];

  /**
   * Total item count for "+N more" indicator
   */
  totalCount?: number;
}

/**
 * QuoteItemPreview Component
 *
 * Horizontal row of up to 3 product thumbnails.
 */
export function QuoteItemPreview({ items, totalCount }: QuoteItemPreviewProps) {
  const previewItems = items.slice(0, 3);
  const remainingCount = (totalCount ?? items.length) - 3;

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2" data-testid="quote-item-preview">
      {/* First 3 thumbnails */}
      {previewItems.map((item) => (
        <QuoteItemImage
          eager
          key={item.id}
          modelImageUrl={item.modelImageUrl}
          modelName={item.modelName}
          size="sm"
          windowType={item.windowType} // Above fold in list
        />
      ))}

      {/* "+N more" indicator */}
      {remainingCount > 0 && (
        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted font-medium text-muted-foreground text-sm">
          +{remainingCount}
        </div>
      )}
    </div>
  );
}

/**
 * Usage Example:
 *
 * ```tsx
 * // In QuoteListItem
 * const previewItems = quote.items.map(item => ({
 *   id: item.id,
 *   modelName: item.modelName,
 *   modelImageUrl: item.modelImageUrl,
 *   windowType: item.windowType,
 * }));
 *
 * <QuoteItemPreview
 *   items={previewItems}
 *   totalCount={quote.itemCount}
 * />
 * ```
 */
