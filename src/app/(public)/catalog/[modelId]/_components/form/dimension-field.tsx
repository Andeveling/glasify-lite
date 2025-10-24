import type { Control, FieldValues, Path } from 'react-hook-form';
import { DimensionInput } from '@/components/dimension-input';
import { DimensionSlider } from '@/components/dimension-slider';
import { SuggestedValueBadges } from '@/components/suggested-value-badges';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ValidationIndicator } from '@/components/validation-indicator';

type DimensionFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  min: number;
  max: number;
  localValue: number;
  onSliderChange: (value: number[]) => void;
  isValid: (value: number) => boolean;
  suggestedValues: number[];
};

/**
 * DimensionField - Organism component
 * Complete dimension field with input, slider, validation, and suggested values
 * Combines multiple molecules to create a rich dimension input experience
 */
export function DimensionField<T extends FieldValues>({
  control,
  name,
  label,
  min,
  max,
  localValue,
  onSliderChange,
  isValid,
  suggestedValues,
}: DimensionFieldProps<T>) {
  // Determine dimension type based on label
  const dimensionType = label.toLowerCase().includes('ancho') ? 'width' : 'height';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldIsValid = isValid(field.value);

        return (
          <FormItem className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <FormLabel className="text-sm">{label}</FormLabel>
              <ValidationIndicator isValid={fieldIsValid} showIndicator={!!field.value} />
            </div>

            <FormControl>
              <DimensionInput
                dimensionType={dimensionType}
                isValid={fieldIsValid}
                max={max}
                min={min}
                onChange={field.onChange}
                placeholder={String(min)}
                value={field.value}
              />
            </FormControl>

            <div className="hidden sm:block">
              <DimensionSlider
                max={max}
                min={min}
                onChange={onSliderChange}
                step={10}
                trackColor={fieldIsValid ? 'muted' : 'destructive'}
                value={localValue}
              />
            </div>

            {/* Show suggested values only on desktop (lg breakpoint) */}
            <div className="hidden lg:block">
              <SuggestedValueBadges currentValue={field.value} onSelect={field.onChange} values={suggestedValues} />
            </div>

            <FormDescription className="text-xs">
              Rango: {min}-{max}mm
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
