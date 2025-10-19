/**
 * FormNumberField Component (Molecule)
 *
 * Reusable number input field with React Hook Form integration
 *
 * Features:
 * - Automatic number formatting
 * - Min/max validation support
 * - Step control for decimals
 * - Optional description text
 *
 * @module _components/form-fields/form-number-field
 */

'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';

interface FormNumberFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  disabled?: boolean;
}

/**
 * Reusable number input field component
 */
export function FormNumberField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  min,
  max,
  step = 1,
  required = false,
  disabled = false,
}: FormNumberFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && ' *'}
          </FormLabel>
          <FormControl>
            <Input
              {...field}
              disabled={disabled}
              max={max}
              min={min}
              onChange={(e) => {
                const value = e.target.value;
                field.onChange(value === '' ? undefined : Number(value));
              }}
              placeholder={placeholder}
              step={step}
              type="number"
              value={field.value ?? ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
