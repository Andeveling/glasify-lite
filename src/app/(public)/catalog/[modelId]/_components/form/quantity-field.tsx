import { Package } from 'lucide-react';
import type { Control, FieldValues, Path } from 'react-hook-form';
import { QuantityPresets } from '@/components/quantity-presets';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';

type QuantityFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  presets: readonly number[];
};

/**
 * QuantityField - Organism component
 * Complete quantity field with input and preset buttons
 * Combines input group with quick-select presets for better UX
 */
export function QuantityField<T extends FieldValues>({ control, name, presets }: QuantityFieldProps<T>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="mt-6">
          <FormLabel>Cantidad</FormLabel>
          <FormControl>
            <InputGroup>
              <InputGroupInput
                {...field}
                min="1"
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                placeholder="1"
                step="1"
                type="number"
              />
              <InputGroupAddon>
                <Package className="h-4 w-4 text-muted-foreground" />
              </InputGroupAddon>
            </InputGroup>
          </FormControl>

          <QuantityPresets className="mt-2" onSelect={field.onChange} presets={presets} />

          <FormDescription>Número de unidades que deseas cotizar</FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
