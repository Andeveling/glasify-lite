import { useMemo } from 'react';
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
  generateSuggestedValues: (min: number, max: number) => number[];
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
  generateSuggestedValues,
}: DimensionFieldProps<T>) {
  const suggestedValues = useMemo(() => generateSuggestedValues(min, max), [ min, max, generateSuggestedValues ]);

  // Determine dimension type based on label
  const dimensionType = label.toLowerCase().includes('ancho') ? 'width' : 'height';

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldIsValid = isValid(field.value);

        return (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
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

            <DimensionSlider
              max={max}
              min={min}
              onChange={onSliderChange}
              step={10}
              trackColor={fieldIsValid ? 'muted' : 'destructive'}
              value={localValue}
            />

            <SuggestedValueBadges currentValue={field.value} onSelect={field.onChange} values={suggestedValues} />

            <FormDescription>
              Rango: {min}-{max}mm
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
