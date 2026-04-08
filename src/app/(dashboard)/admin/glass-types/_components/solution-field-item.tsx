/**
 * SolutionFieldItem Component
 *
 * Extracted single solution field to prevent unnecessary re-renders
 * Performance optimization: Only this field re-renders when its values change
 *
 * @module _components/solution-field-item
 */

'use client'

import { Trash2 } from 'lucide-react'
import { memo, useTransition } from 'react'
import { useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CreateGlassTypeInput } from '@/lib/validations/admin/glass-type.schema'

type Solution = {
  id: string
  nameEs: string
}

type SolutionFieldItemProps = {
  index: number
  fieldId: string
  solutions: Solution[]
  performanceLabels: Record<string, string>
  isLoading: boolean
  onRemove: (index: number) => void
  onSetPrimary: (index: number) => void
}

/**
 * Single solution field item (memoized for performance)
 * Only re-renders when its specific props change
 */
export const SolutionFieldItem = memo(function SolutionFieldItemComponent({
  index,
  fieldId,
  solutions,
  performanceLabels,
  isLoading,
  onRemove,
  onSetPrimary,
}: SolutionFieldItemProps) {
  const form = useFormContext<CreateGlassTypeInput>()
  const [isPending, startTransition] = useTransition()

  return (
    <div className="space-y-4 rounded-lg border p-4" key={fieldId}>
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">Solución #{index + 1}</h4>
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
        {/* Solution Selector */}
        <FormField
          control={form.control}
          name={`solutions.${index}.solutionId`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Solución</FormLabel>
              <Select
                disabled={isLoading || isPending}
                onValueChange={(value) => {
                  // Wrap in transition to deprioritize this update
                  startTransition(() => {
                    field.onChange(value)
                  })
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una solución" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {solutions.map((solution) => (
                    <SelectItem key={solution.id} value={solution.id}>
                      {solution.nameEs}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Performance Rating Selector */}
        <FormField
          control={form.control}
          name={`solutions.${index}.performanceRating`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Calificación de Rendimiento</FormLabel>
              <Select
                disabled={isPending}
                onValueChange={(value) => {
                  startTransition(() => {
                    field.onChange(value)
                  })
                }}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona calificación" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(performanceLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Primary Solution Radio */}
      <FormField
        control={form.control}
        name={`solutions.${index}.isPrimary`}
        render={({ field }) => (
          <FormItem className="flex items-center space-x-2 space-y-0">
            <FormControl>
              <RadioGroup
                disabled={isPending}
                onValueChange={(value) => {
                  if (value === 'true') {
                    startTransition(() => {
                      onSetPrimary(index)
                    })
                  }
                }}
                value={field.value ? 'true' : 'false'}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem id={`primary-${index}`} value="true" />
                  <FormLabel className="font-normal" htmlFor={`primary-${index}`}>
                    Solución principal
                  </FormLabel>
                </div>
              </RadioGroup>
            </FormControl>
            <FormDescription className="mt-0">
              Solo una solución puede ser marcada como principal
            </FormDescription>
          </FormItem>
        )}
      />

      {/* Notes Textarea */}
      <FormField
        control={form.control}
        name={`solutions.${index}.notes`}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notas (opcional)</FormLabel>
            <FormControl>
              <Textarea
                className="resize-none"
                {...field}
                disabled={isPending}
                placeholder="Notas adicionales sobre esta solución..."
                value={field.value ?? ''}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
})
