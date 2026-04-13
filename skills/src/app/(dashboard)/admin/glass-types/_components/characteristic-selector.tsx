/**
 * Characteristic Selector Component
 *
 * Dynamic form component for managing glass type characteristics using React Hook Form useFieldArray
 *
 * Features:
 * - Add/remove characteristics dynamically
 * - Select characteristic from dropdown (e.g., tempered, laminated, low-e)
 * - Optional value field (e.g., "6.38mm" for laminated thickness)
 * - Optional certification field (e.g., "EN 12150" for tempered glass)
 * - Add optional notes for each characteristic
 *
 * Performance Optimizations:
 * - Extracted each field to CharacteristicFieldItem (prevents unnecessary re-renders)
 * - Memoized callbacks with useCallback
 * - Memoized characteristics array
 *
 * Used in: glass-type-form.tsx (Create/Edit Glass Types)
 */

'use client'

import { Plus } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import type { CreateGlassTypeInput } from '@/lib/validations/admin/glass-type.schema'
import { api } from '@/trpc/react'
import { CharacteristicFieldItem } from './characteristic-field-item'

/**
 * Characteristic Selector Component
 */
export function CharacteristicSelector() {
  const form = useFormContext<CreateGlassTypeInput>()
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'characteristics',
  })

  // Fetch active characteristics via tRPC
  // Note: glassCharacteristic router will be created in future tasks (US7)
  // For now, use empty array or fetch via Server Component prop
  const { data: characteristicsData, isLoading } = api.admin['glass-solution'].list.useQuery(
    {
      isActive: 'active',
      limit: 100,
      page: 1,
      sortBy: 'sortOrder',
      sortOrder: 'asc',
    },
    {
      // Temporarily disabled until glass-characteristic router is created
      enabled: false,
    },
  )

  // Memoize characteristics array to prevent unnecessary re-renders
  const characteristics = useMemo(
    () => characteristicsData?.items ?? [],
    [characteristicsData?.items],
  )

  /**
   * Handle adding new characteristic (memoized to prevent re-creation)
   */
  const handleAddCharacteristic = useCallback(() => {
    append({
      certification: undefined,
      characteristicId: '',
      notes: undefined,
      value: undefined,
    })
  }, [append])

  /**
   * Handle removing characteristic (memoized to prevent re-creation)
   */
  const handleRemove = useCallback(
    (index: number) => {
      remove(index)
    },
    [remove],
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Características del Vidrio</h3>
          <p className="text-muted-foreground text-sm">
            Asigna características técnicas (templado, laminado, low-e, etc.) con valores y
            certificaciones
          </p>
        </div>
        <Button onClick={handleAddCharacteristic} size="sm" type="button" variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Característica
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            No hay características asignadas. Haz clic en "Agregar Característica" para comenzar.
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <CharacteristicFieldItem
          characteristics={characteristics}
          fieldId={field.id}
          index={index}
          isLoading={isLoading}
          key={field.id}
          onRemove={handleRemove}
        />
      ))}
    </div>
  )
}
