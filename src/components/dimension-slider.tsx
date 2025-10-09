import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type DimensionSliderProps = {
  value: number;
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
};

/**
 * DimensionSlider - Molecule component
 * Slider for dimension values with immediate visual feedback
 * Provides better UX for quick dimension adjustments
 */
export function DimensionSlider({ value, onChange, min, max, step = 10, className }: DimensionSliderProps) {
  return (
    <div className={cn('px-2', className)}>
      <Slider
        className="my-4 h-3 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
        max={max}
        min={min}
        onValueChange={onChange}
        step={step}
        value={[ value ]}
      />
    </div>
  );
}
