import { Minus, Package, Plus } from 'lucide-react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type QuantityFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  presets: readonly number[];
  min?: number;
  max?: number;
};

/**
 * QuantityField - Organism component
 * Enhanced quantity field with multiple input methods for optimal UX
 *
 * ## Features
 * - **Increment/Decrement buttons**: Quick +/- controls
 * - **Direct input**: Manual number entry for precise values
 * - **Preset buttons**: Common quantities for one-click selection
 * - **Keyboard accessible**: Full keyboard navigation support
 * - **Validation**: Min/max constraints with visual feedback
 *
 * ## UX Philosophy: "Don't Make Me Think"
 * - Multiple ways to input (buttons, typing, presets) - users choose their preferred method
 * - Clear visual feedback for current value and available actions
 * - Disabled states prevent invalid inputs
 * - Harmonious button design with consistent spacing and sizing
 */
export function QuantityField<T extends FieldValues>({
  control,
  max = 999,
  min = 1,
  name,
  presets,
}: QuantityFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const currentValue = Number(field.value) || min;
        const canDecrement = currentValue > min;
        const canIncrement = currentValue < max;

        const handleDecrement = () => {
          if (canDecrement) {
            field.onChange(currentValue - 1);
          }
        };

        const handleIncrement = () => {
          if (canIncrement) {
            field.onChange(currentValue + 1);
          }
        };

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const value = e.target.value;
          if (value === '') {
            field.onChange('');
            return;
          }
          const numValue = Number(value);
          if (!Number.isNaN(numValue) && numValue >= min && numValue <= max) {
            field.onChange(numValue);
          }
        };

        const handlePresetClick = (preset: number) => {
          if (preset >= min && preset <= max) {
            field.onChange(preset);
          }
        };

        return (
          <FormItem className="mt-6 space-y-4">
            <FormLabel className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              Cantidad
            </FormLabel>

            {/* Increment/Decrement Controls with Direct Input */}
            <FormControl>
              <div className="flex items-center gap-3">
                {/* Decrement Button */}
                <Button
                  className={cn(
                    'h-11 w-11 shrink-0 rounded-lg transition-all duration-200',
                    canDecrement
                      ? 'hover:bg-primary/10 hover:text-primary hover:shadow-md'
                      : 'cursor-not-allowed opacity-40'
                  )}
                  disabled={!canDecrement}
                  onClick={handleDecrement}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Minus className="h-4 w-4" />
                  <span className="sr-only">Disminuir cantidad</span>
                </Button>

                {/* Direct Input Field */}
                <div className="relative flex-1">
                  <Input
                    {...field}
                    className="h-11 text-center font-semibold text-lg"
                    max={max}
                    min={min}
                    onChange={handleInputChange}
                    placeholder={String(min)}
                    type="number"
                    value={field.value || ''}
                  />
                  <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                    <span className="text-muted-foreground text-sm">unidades</span>
                  </div>
                </div>

                {/* Increment Button */}
                <Button
                  className={cn(
                    'h-11 w-11 shrink-0 rounded-lg transition-all duration-200',
                    canIncrement
                      ? 'hover:bg-primary/10 hover:text-primary hover:shadow-md'
                      : 'cursor-not-allowed opacity-40'
                  )}
                  disabled={!canIncrement}
                  onClick={handleIncrement}
                  size="icon"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  <span className="sr-only">Aumentar cantidad</span>
                </Button>
              </div>
            </FormControl>

            {/* Preset Quick-Select Buttons */}
            {presets.length > 0 && (
              <div className="space-y-2">
                <p className="text-muted-foreground text-xs">Cantidades comunes:</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => {
                    const isSelected = currentValue === preset;
                    const isValid = preset >= min && preset <= max;

                    return (
                      <Button
                        className={cn(
                          'h-9 min-w-[3rem] transition-all duration-200',
                          isSelected && 'border-primary bg-primary/10 text-primary ring-2 ring-primary/20',
                          !isSelected && isValid && 'hover:border-primary/50 hover:bg-primary/5',
                          !isValid && 'cursor-not-allowed opacity-40'
                        )}
                        disabled={!isValid}
                        key={preset}
                        onClick={() => handlePresetClick(preset)}
                        size="sm"
                        type="button"
                        variant={isSelected ? 'default' : 'outline'}
                      >
                        {preset}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}

            <FormDescription>
              Selecciona la cantidad de unidades que deseas cotizar (mínimo {min}, máximo {max})
            </FormDescription>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
