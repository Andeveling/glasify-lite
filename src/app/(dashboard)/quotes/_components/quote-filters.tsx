/**
 * QuoteFilters Component
 *
 * Client component that provides filtering UI for quote list by status.
 * Uses URL search params to maintain filter state across navigation.
 *
 * User Story 4: View Quote Submission History
 *
 * @module app/(dashboard)/quotes/_components/quote-filters
 */

'use client';

import type { QuoteStatus } from '@prisma/client';
import { FileText, Send, XCircle } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Button } from '@/components/ui/button';

type QuoteFiltersProps = {
  /** Current active status filter (from URL) */
  currentStatus?: QuoteStatus;
};

type FilterOption = {
  value: QuoteStatus | 'all';
  label: string;
  icon: typeof FileText;
};

/**
 * Available filter options with icons and labels
 */
const filterOptions: FilterOption[] = [
  {
    icon: FileText,
    label: 'Todas',
    value: 'all',
  },
  {
    icon: FileText,
    label: 'Borradores',
    value: 'draft',
  },
  {
    icon: Send,
    label: 'Enviadas',
    value: 'sent',
  },
  {
    icon: XCircle,
    label: 'Canceladas',
    value: 'canceled',
  },
];

/**
 * QuoteFilters - Status filter tabs for quote list
 *
 * Displays filter buttons for organizing quotes by status.
 * Updates URL search params on filter selection to maintain state.
 *
 * @example
 * ```tsx
 * <QuoteFilters currentStatus={status} />
 * ```
 */
export function QuoteFilters({ currentStatus }: QuoteFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  /**
   * Update URL search params with new filter selection
   */
  const updateFilter = useCallback(
    (newStatus: QuoteStatus | 'all') => {
      const params = new URLSearchParams(searchParams.toString());

      if (newStatus === 'all') {
        params.delete('status');
      } else {
        params.set('status', newStatus);
      }

      // Reset to page 1 when changing filters
      params.delete('page');

      const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;

      startTransition(() => {
        router.replace(newUrl);
      });
    },
    [searchParams, pathname, router]
  );

  const activeFilter = currentStatus ?? 'all';

  return (
    <div className="mb-6 flex flex-wrap gap-2">
      {filterOptions.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === activeFilter;

        return (
          <Button
            className="gap-2"
            disabled={isPending}
            key={option.value}
            onClick={() => updateFilter(option.value)}
            size="sm"
            variant={isActive ? 'default' : 'outline'}
          >
            <Icon className="h-4 w-4" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
