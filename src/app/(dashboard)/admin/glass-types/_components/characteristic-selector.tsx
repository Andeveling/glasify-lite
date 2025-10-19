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
 * Used in: glass-type-form.tsx (Create/Edit Glass Types)
 */

'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { CreateGlassTypeInput } from '@/lib/validations/admin/glass-type.schema';
import { api } from '@/trpc/react';

/**
 * Characteristic Selector Component
 */
export function CharacteristicSelector() {
  const form = useFormContext<CreateGlassTypeInput>();
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'characteristics',
  });

  // Fetch active characteristics via tRPC
  // Note: glassCharacteristic router will be created in future tasks (US7)
  // For now, use empty array or fetch via Server Component prop
  const { data: characteristicsData, isLoading } = api.admin[ 'glass-solution' ].list.useQuery(
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
    }
  );

  // TODO: Replace with actual characteristics from glassCharacteristic.list when router is created
  const characteristics = characteristicsData?.items ?? [];

  /**
   * Handle adding new characteristic
   */
  const handleAddCharacteristic = () => {
    append({
      certification: undefined,
      characteristicId: '',
      notes: undefined,
      value: undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium text-lg">Características del Vidrio</h3>
          <p className="text-muted-foreground text-sm">
            Asigna características técnicas (templado, laminado, low-e, etc.) con valores y certificaciones
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
        <div className="space-y-4 rounded-lg border p-4" key={field.id}>
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Característica #{index + 1}</h4>
            <Button onClick={() => remove(index)} size="sm" type="button" variant="ghost">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Characteristic Selector */}
            <FormField
              control={form.control}
              name={`characteristics.${index}.characteristicId`}
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>Característica</FormLabel>
                  <Select
                    disabled={isLoading || characteristics.length === 0}
                    onValueChange={fieldProps.onChange}
                    value={fieldProps.value}
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
                      ? 'Primero debes crear características en el módulo de administración'
                      : 'Selecciona una característica técnica del vidrio'}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Value Input */}
            <FormField
              control={form.control}
              name={`characteristics.${index}.value`}
              render={({ field: fieldProps }) => (
                <FormItem>
                  <FormLabel>Valor (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: 6.38mm, 4+4mm, etc." {...fieldProps} value={fieldProps.value ?? ''} />
                  </FormControl>
                  <FormDescription>Valor específico si aplica (ej: espesor de laminado)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Certification Input */}
          <FormField
            control={form.control}
            name={`characteristics.${index}.certification`}
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Certificación (opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="Ej: EN 12150, EN 14449, etc." {...fieldProps} value={fieldProps.value ?? ''} />
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
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Notas (opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    className="resize-none"
                    placeholder="Notas adicionales sobre esta característica..."
                    {...fieldProps}
                    value={fieldProps.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ))}
    </div>
  );
}
