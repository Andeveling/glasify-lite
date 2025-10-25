/**
 * Model Type & Design Section
 *
 * Selector de tipo de modelo y galería de diseños (opcional)
 * El diseño solo se muestra cuando hay un tipo seleccionado
 */

'use client';

import type { MaterialType, ModelType } from '@prisma/client';
import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DesignGallerySelector } from './design-gallery-selector';
import { FormSelect } from './form-fields';

const MODEL_TYPE_OPTIONS: Array<{ label: string; value: ModelType }> = [
  { label: 'Ventana Fija', value: 'fixed_window' },
  { label: 'Ventana Corredera Horizontal', value: 'sliding_window_horizontal' },
  { label: 'Ventana Corredera Vertical (Guillotina)', value: 'sliding_window_vertical' },
  { label: 'Ventana Batiente', value: 'casement_window' },
  { label: 'Ventana Proyectante', value: 'awning_window' },
  { label: 'Puerta Simple', value: 'single_door' },
  { label: 'Puerta Doble', value: 'double_door' },
  { label: 'Puerta Corredera', value: 'sliding_door' },
  { label: 'Otro', value: 'other' },
];

type ModelTypeDesignSectionProps = {
  materialType?: MaterialType | null;
};

export function ModelTypeDesignSection({ materialType }: ModelTypeDesignSectionProps) {
  const form = useFormContext();

  // Watch tipo y designId para controlar la visualización
  const selectedType = form.watch('type') as ModelType | null;
  const selectedDesignId = form.watch('designId') as string | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipo y Diseño</CardTitle>
        <CardDescription>Clasificación y representación visual del modelo</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Selector de Tipo */}
        <FormSelect
          description="Tipo de modelo (ventana, puerta, etc.)"
          label="Tipo de Modelo"
          name="type"
          options={MODEL_TYPE_OPTIONS}
          placeholder="Selecciona el tipo"
        />

        {/* Galería de Diseños - Solo visible si hay tipo y material */}
        {selectedType && materialType && (
          <div className="space-y-2">
            <DesignGallerySelector
              materialType={materialType}
              modelType={selectedType}
              onChange={(designId) => form.setValue('designId', designId)}
              value={selectedDesignId}
            />
            {selectedDesignId && (
              <p className="text-muted-foreground text-xs">
                💡 El diseño será usado para visualizar el modelo en el catálogo
              </p>
            )}
          </div>
        )}

        {/* Mensaje cuando no hay tipo o material */}
        {selectedType && !materialType && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm text-yellow-800">
              ⚠️ Selecciona un proveedor de perfiles primero para ver diseños disponibles
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
