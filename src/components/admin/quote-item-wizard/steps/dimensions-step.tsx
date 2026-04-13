'use client'

import { useFormContext } from 'react-hook-form'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import type { WizardFormValues } from '../wizard-form-schema'

function DimensionsStep() {
  const form = useFormContext<WizardFormValues>()

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Dimensiones</h2>
        <p className="text-sm text-muted-foreground">
          Ingresá el ancho y alto de la ventana en milímetros
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <FormField
          control={form.control}
          name="widthMm"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium">Ancho (mm)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="1000"
                  type="number"
                  className="h-11"
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
              <FormLabel className="text-sm font-medium">Alto (mm)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  placeholder="1500"
                  type="number"
                  className="h-11"
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
            <FormLabel className="text-sm font-medium">Cantidad</FormLabel>
            <FormControl>
              <Input
                {...field}
                min={1}
                onChange={(e) => field.onChange(Number(e.target.value))}
                type="number"
                className="h-11 max-w-xs"
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
            <FormLabel className="text-sm font-medium">Ambiente / Ubicación (opcional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Ej: Sala, Habitación principal" className="h-11" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}

export { DimensionsStep }
