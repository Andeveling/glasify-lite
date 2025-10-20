/**
 * FormTextareaField Component (Molecule)
 *
 * Reusable textarea field with React Hook Form integration
 *
 * Features:
 * - Multi-line text input
 * - Character counter (optional)
 * - Row count control (uses textarea rows)
 * - Optional description text
 *
 * @module _components/form-fields/form-textarea-field
 */

'use client';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

interface FormTextareaFieldProps<TFieldValues extends FieldValues> {
  control: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number; // prefer rows over height for reliable sizing
  maxLength?: number;
  showCharCount?: boolean;
  required?: boolean;
  disabled?: boolean;
  className?: string; // allow grid span / layout classes
}

/**
 * Reusable textarea field component
 */
export function FormTextareaField<TFieldValues extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  description,
  rows = 6,
  maxLength,
  showCharCount = false,
  required = false,
  disabled = false,
  className,
}: FormTextareaFieldProps<TFieldValues>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>
            {label}
            {required && ' *'}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              disabled={disabled}
              maxLength={maxLength}
              placeholder={placeholder}
              rows={rows}
              value={field.value ?? ''}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          {showCharCount && maxLength && (
            <FormDescription className="text-right">
              {field.value?.length ?? 0} / {maxLength}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
