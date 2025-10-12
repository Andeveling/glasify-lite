/**
 * Shared Quote Status Badge Component
 * 
 * Reusable status badge component that can be used throughout the app.
 * Re-exports QuoteStatusBadge from my-quotes feature with same API.
 * 
 * This allows other pages/features to use the status badge without
 * depending directly on the my-quotes feature module.
 * 
 * @module SharedStatusBadge
 */

'use client';

export {
  QuoteStatusBadge as StatusBadge,
  type QuoteStatusBadgeProps as StatusBadgeProps,
  type QuoteStatus,
  type StatusConfig,
  type StatusCTA,
  getStatusConfig,
  getStatusIconComponent,
} from '@/app/(public)/my-quotes/_components/quote-status-badge';

/**
 * Default export for convenience
 * 
 * @example
 * ```tsx
 * import StatusBadge from '@/components/quote/status-badge';
 * 
 * export function QuoteCard({ quote }) {
 *   return (
 *     <div>
 *       <StatusBadge status={quote.status} />
 *     </div>
 *   );
 * }
 * ```
 */
export { QuoteStatusBadge as default } from '@/app/(public)/my-quotes/_components/quote-status-badge';
