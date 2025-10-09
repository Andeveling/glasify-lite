import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

type DimensionSliderProps = {
  value: number;
  onChange: (value: number[]) => void;
  min: number;
  max: number;
  step?: number;
  trackColor?: 'muted' | 'secondary' | 'border' | 'destructive' | 'success';
  className?: string;
};

/**
 * DimensionSlider - Molecule component
 * Slider for dimension values with immediate visual feedback
 * Provides better UX for quick dimension adjustments
 * Supports customizable track colors for different states
 */
export function DimensionSlider({
  value,
  onChange,
  min,
  max,
  step = 10,
  trackColor = 'secondary',
  className,
}: DimensionSliderProps) {
  // Map track colors to Tailwind classes for the empty track
  const trackColorMap = {
    border: '[&_[data-slot="slider-track"]]:bg-border',
    destructive: '[&_[data-slot="slider-track"]]:bg-destructive/20',
    muted: '[&_[data-slot="slider-track"]]:bg-muted',
    secondary: '[&_[data-slot="slider-track"]]:bg-secondary',
    success: '[&_[data-slot="slider-track"]]:bg-success/20',
  };

  return (
    <div className={cn('px-2', className)}>
      <Slider
        className={cn(
          'my-4 h-3 rounded-2xl border-2 p-1 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5',
          trackColorMap[trackColor]
        )}
        max={max}
        min={min}
        onValueChange={onChange}
        step={step}
        value={[value]}
      />
    </div>
  );
}
