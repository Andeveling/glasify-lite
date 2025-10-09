import { Badge } from '@/components/ui/badge';

type SuggestedValueBadgesProps = {
  values: number[];
  onSelect: (value: number) => void;
  unit?: string;
  className?: string;
};

/**
 * SuggestedValueBadges - Molecule component
 * Grid of clickable badges showing suggested values
 * Provides quick selection shortcuts for common dimension values
 */
export function SuggestedValueBadges({ values, onSelect, unit = 'mm', className }: SuggestedValueBadgesProps) {
  return (
    <div className={className}>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <Badge className="cursor-pointer" key={value} onClick={() => onSelect(value)} role="button" tabIndex={0}>
            {value}
            {unit}
          </Badge>
        ))}
      </div>
    </div>
  );
}
