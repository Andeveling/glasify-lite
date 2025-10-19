/**
 * FormCheckboxField Component (Molecule)
 *
 * Reusable checkbox field with React Hook Form integration
 *
 * Features:
 * - Boolean value handling
 * - Label and description support
 * - Accessible checkbox control
 *
 * @module _components/form-fields/form-checkbox-field
 */

'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';

interface FormCheckboxFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  description?: string;
  disabled?: boolean;
}

/**
 * Reusable checkbox field component
 */
export function FormCheckboxField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  description,
  disabled = false,
}: FormCheckboxFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
          <FormControl>
            <Checkbox checked={field.value} disabled={disabled} onCheckedChange={field.onChange} />
          </FormControl>
          <div className="space-y-1 leading-none">
            <FormLabel>{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
          </div>
        </FormItem>
      )}
    />
  );
}
