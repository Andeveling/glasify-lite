'use client'

import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { WizardFormValues } from '../wizard-form-schema'

function DimensionsStep() {
  const form = useFormContext<WizardFormValues>()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <FormField
          control={form.control}
          name="widthMm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ancho (mm)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="1000"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="heightMm"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alto (mm)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="1500"
                  type="number"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="quantity"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Cantidad</FormLabel>
            <FormControl>
              <Input
                {...field}
                min={1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="roomLocation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ambiente / Ubicación</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: Sala, Habitación principal" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export { DimensionsStep }
