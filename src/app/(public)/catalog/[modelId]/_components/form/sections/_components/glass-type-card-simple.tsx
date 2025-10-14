'use client';

import { Check } from 'lucide-react';
import { formatCurrency } from '@/app/_utils/format-currency.util';
import { Label } from '@/components/ui/label';
import { PerformanceRatingBadge } from '@/components/ui/performance-rating-badge';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import type { PerformanceRating } from '@/server/api/routers/catalog';
import type { GlassTypeOption } from '../_hooks/use-glass-type-options';

/**
 * Glass Type Card Simple Component (Organism)
 *
 * Simplified version without performance bars and features.
 * Focuses on essential information: icon, title, rating, price.
 *
 * Don't Make Me Think:
 * - Minimal cognitive load
 * - Clear visual hierarchy
 * - Fast decision making
 * - Obvious selection state
 */

type GlassTypeCardSimpleProps = {
  isSelected: boolean;
  option: GlassTypeOption;
};

export function GlassTypeCardSimple({ isSelected, option }: GlassTypeCardSimpleProps) {
  const Icon = option.icon;

  return (
    <Label
      className={cn(
        'group relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition-all duration-200',
        'hover:scale-[1.02] hover:border-primary/50 hover:shadow-md',
        'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2',
        isSelected ? 'border-primary bg-primary/5 shadow-lg' : 'border-border bg-card'
      )}
      htmlFor={option.id}
    >
      {/* Hidden radio input */}
      <RadioGroupItem className="sr-only" id={option.id} value={option.id} />

      {/* Icon */}
      <div
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground group-hover:bg-primary/10'
        )}
      >
        <Icon className="size-6" />
      </div>

      {/* Content */}
      <div className="flex flex-1 items-center justify-between gap-3">
        {/* Title and tech name */}
        <div className="flex-1 space-y-0.5">
          <h4 className={cn('font-semibold text-sm leading-tight', isSelected && 'text-primary')}>{option.title}</h4>
          <p className="line-clamp-1 text-muted-foreground text-xs">{option.name}</p>
        </div>

        {/* Rating */}
        {option.performanceRating && (
          <div className="shrink-0">
            <PerformanceRatingBadge rating={option.performanceRating as PerformanceRating} />
          </div>
        )}

        {/* Price */}
        <div className="shrink-0 text-right">
          <div className="font-bold text-primary text-base">{formatCurrency(option.pricePerSqm)}</div>
          <div className="text-muted-foreground text-xs">por m²</div>
        </div>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full bg-primary shadow-lg">
          <Check className="size-4 text-primary-foreground" />
        </div>
      )}
    </Label>
  );
}
