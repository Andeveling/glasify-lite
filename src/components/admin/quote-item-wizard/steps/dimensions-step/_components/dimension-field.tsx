'use client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { WizardFormValues } from '../../../wizard-form-schema'

interface DimensionFieldProps {
  control: import('react-hook-form').Control<WizardFormValues>
  label: string
  name: 'widthMm' | 'heightMm' | 'quantity' | 'roomLocation'
  placeholder?: string
}

function DimensionField({ control, label, name, placeholder }: DimensionFieldProps) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-medium">{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              onChange={(e) => {
                const parsed = name === 'roomLocation' ? e.target.value : Number(e.target.value)
                field.onChange(parsed)
              }}
              placeholder={placeholder}
              type={name === 'roomLocation' ? 'text' : 'number'}
              className="h-11"
              min={name === 'quantity' ? 1 : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export { DimensionField }
