/**
 * CharacteristicFieldItem Component
 *
 * Extracted single characteristic field to prevent unnecessary re-renders
 * Performance optimization: Only this field re-renders when its values change
 *
 * @module _components/characteristic-field-item
 */

"use client"

import { Trash2 } from "lucide-react"
import { memo, useTransition } from "react"
import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CreateGlassTypeInput } from "@/lib/validations/admin/glass-type.schema"

type Characteristic = {
  id: string
  nameEs: string
}

type CharacteristicFieldItemProps = {
  index: number
  fieldId: string
  characteristics: Characteristic[]
  isLoading: boolean
  onRemove: (index: number) => void
}

/**
 * Single characteristic field item (memoized for performance)
 * Only re-renders when its specific props change
 */
export const CharacteristicFieldItem = memo(function CharacteristicFieldItemComponent({
  index,
  fieldId,
  characteristics,
  isLoading,
  onRemove,
}: CharacteristicFieldItemProps) {
  const form = useFormContext<CreateGlassTypeInput>()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-4 rounded-lg border p-4" key={fieldId}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Característica #{index + 1}</h4>
        <Button
          disabled={isPending}
          onClick={() => onRemove(index)}
          size="sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Characteristic Selector */}
        <FormField
          control={form.control}
          name={`characteristics.${index}.characteristicId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Característica</FormLabel>
              <Select
                disabled={isLoading || characteristics.length === 0 || isPending}
                onValueChange={(value) => {
                  startTransition(() => {
                    field.onChange(value)
                  })
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una característica" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {characteristics.length === 0 ? (
                    <SelectItem disabled value="_empty">
                      No hay características disponibles
                    </SelectItem>
                  ) : (
                    characteristics.map((characteristic) => (
                      <SelectItem key={characteristic.id} value={characteristic.id}>
                        {characteristic.nameEs}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormDescription>
                {characteristics.length === 0
                  ? "Primero debes crear características en el módulo de administración"
                  : "Selecciona una característica técnica del vidrio"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Value Input */}
        <FormField
          control={form.control}
          name={`characteristics.${index}.value`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor (opcional)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  disabled={isPending}
                  placeholder="Ej: 6.38mm, 4+4mm, etc."
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormDescription>
                Valor específico si aplica (ej: espesor de laminado)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Certification Input */}
      <FormField
        control={form.control}
        name={`characteristics.${index}.certification`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Certificación (opcional)</FormLabel>
            <FormControl>
              <Input
                {...field}
                disabled={isPending}
                placeholder="Ej: EN 12150, EN 14449, etc."
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>Referencia de certificación técnica si aplica</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Notes Textarea */}
      <FormField
        control={form.control}
        name={`characteristics.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas (opcional)</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none"
                {...field}
                disabled={isPending}
                placeholder="Notas adicionales sobre esta característica..."
                value={field.value ?? ""}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
})
