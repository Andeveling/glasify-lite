import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SuggestedValueBadgesProps = {
  values: number[];
  onSelect: (value: number) => void;
  currentValue?: number;
  unit?: string;
  className?: string;
};

/**
 * SuggestedValueBadges - Molecule component
 * Enhanced grid of clickable badges showing suggested dimension values
 *
 * ## Features
 * - **Visual selection feedback**: Highlighted when value matches current selection
 * - **Smooth transitions**: Harmonious hover and active states
 * - **Keyboard accessible**: Full keyboard navigation support
 * - **Clear affordance**: Button design makes clickability obvious
 *
 * ## UX Philosophy: "Don't Make Me Think"
 * - Clear visual states (default, hover, selected)
 * - Instant visual feedback on interaction
 * - Values with units for clarity (e.g., "500mm")
 * - Consistent spacing and sizing
 */
export function SuggestedValueBadges({
  className,
  currentValue,
  onSelect,
  unit = 'mm',
  values,
}: SuggestedValueBadgesProps) {
  return (
    <div className={className}>
      <p className="mb-2 text-muted-foreground text-xs">Valores sugeridos:</p>
      <div className="flex flex-wrap gap-1">
        {values.map((value) => {
          const isSelected = currentValue === value;

          return (
            <Button
              className={cn(
                'm-0 h-6 min-w-[4rem] p-1 font-mono text-xs transition-all duration-200',
                isSelected && 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20',
                !isSelected && 'hover:border-primary/50 hover:bg-primary/5'
              )}
              key={value}
              onClick={() => onSelect(value)}
              size="sm"
              type="button"
              variant={isSelected ? 'default' : 'outline'}
            >
              {value}
              <span className="text-[0.7rem] opacity-70">{unit}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
