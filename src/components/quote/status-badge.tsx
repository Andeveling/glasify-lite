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
export {
  getStatusConfig,
  getStatusIconComponent,
  type QuoteStatus,
  QuoteStatusBadge as StatusBadge,
  QuoteStatusBadge as default,
  type QuoteStatusBadgeProps as StatusBadgeProps,
  type StatusConfig,
  type StatusCTA,
} from '@/app/(public)/my-quotes/_components/quote-status-badge';
