import { Ruler } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { useDebouncedDimension } from '../../../_hooks/use-debounced-dimension';
import { DimensionField } from '../dimension-field';
import { DimensionValidationAlert } from '../dimension-validation-alert';
import { QuantityField } from '../quantity-field';

type ModelDimensions = {
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
};

type DimensionsSectionProps = {
  dimensions: ModelDimensions;
};

/**
 * Genera valores sugeridos dinámicamente basados en el rango permitido
 * @param min - Valor mínimo del rango
 * @param max - Valor máximo del rango
 * @param count - Cantidad de valores a generar (default: 5)
 */
function generateSuggestedValues(min: number, max: number, count = 5): number[] {
  const range = max - min;
  const step = range / (count - 1);

  return Array.from({ length: count }, (_, i) => {
    const value = min + step * i;
    // Redondear a múltiplos de 10 para valores más "amigables"
    return Math.round(value / 10) * 10;
  }).filter((value, index, arr) => arr.indexOf(value) === index); // Eliminar duplicados
}

// biome-ignore lint/style/noMagicNumbers: valores predefinidos de cantidad para UX
const QUANTITY_PRESETS = [1, 3, 5, 10, 20] as const;

export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
  const { control, setValue } = useFormContext();

  // Watch values para el preview
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });

  // ✅ Use custom debounced dimension hook for width
  const { localValue: localWidth, setLocalValue: setLocalWidth } = useDebouncedDimension({
    initialValue: width || dimensions.minWidth,
    max: dimensions.maxWidth,
    min: dimensions.minWidth,
    setValue: (value) => setValue('width', value, { shouldValidate: true }),
    value: width,
  });

  // ✅ Use custom debounced dimension hook for height
  const { localValue: localHeight, setLocalValue: setLocalHeight } = useDebouncedDimension({
    initialValue: height || dimensions.minHeight,
    max: dimensions.maxHeight,
    min: dimensions.minHeight,
    setValue: (value) => setValue('height', value, { shouldValidate: true }),
    value: height,
  });

  // ✅ Memoize validation function to avoid recreation
  const isValidDimension = useCallback((value: number, min: number, max: number) => value >= min && value <= max, []);

  // ✅ Optimized handlers for sliders - no debounce needed (handled by hook)
  const handleWidthSliderChange = useCallback(
    (value: number[]) => {
      const newValue = value[0];
      if (newValue !== undefined) {
        setLocalWidth(newValue); // ✅ Update local state immediately (visual feedback)
        // ✅ Form update is debounced automatically in the hook
      }
    },
    [setLocalWidth]
  );

  const handleHeightSliderChange = useCallback(
    (value: number[]) => {
      const newValue = value[0];
      if (newValue !== undefined) {
        setLocalHeight(newValue);
      }
    },
    [setLocalHeight]
  );

  // ✅ Memoize validation check functions
  const isWidthValid = useCallback(
    (value: number) => isValidDimension(value, dimensions.minWidth, dimensions.maxWidth),
    [dimensions.minWidth, dimensions.maxWidth, isValidDimension]
  );

  const isHeightValid = useCallback(
    (value: number) => isValidDimension(value, dimensions.minHeight, dimensions.maxHeight),
    [dimensions.minHeight, dimensions.maxHeight, isValidDimension]
  );

  // ✅ Memoize generateSuggestedValues to prevent recreation on every render
  const generateSuggestedValuesMemo = useMemo(() => generateSuggestedValues, []);

  // Check if validation alert should show
  const showValidationAlert =
    (width && !isValidDimension(width, dimensions.minWidth, dimensions.maxWidth)) ||
    (height && !isValidDimension(height, dimensions.minHeight, dimensions.maxHeight));

  return (
    <FieldSet>
      <FieldLegend>
        <Ruler className="mr-2 mb-1 inline size-4 text-primary" />
        Dimensiones
      </FieldLegend>
      <FieldDescription>Especifica las dimensiones del vidrio requeridas.</FieldDescription>

      <FieldContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <DimensionField
            control={control}
            generateSuggestedValues={generateSuggestedValuesMemo}
            isValid={isWidthValid}
            label="Ancho"
            localValue={localWidth}
            max={dimensions.maxWidth}
            min={dimensions.minWidth}
            name="width"
            onSliderChange={handleWidthSliderChange}
          />

          <DimensionField
            control={control}
            generateSuggestedValues={generateSuggestedValuesMemo}
            isValid={isHeightValid}
            label="Alto"
            localValue={localHeight}
            max={dimensions.maxHeight}
            min={dimensions.minHeight}
            name="height"
            onSliderChange={handleHeightSliderChange}
          />
        </div>

        <DimensionValidationAlert showAlert={showValidationAlert} />

        <QuantityField control={control} name="quantity" presets={QUANTITY_PRESETS} />
      </FieldContent>
    </FieldSet>
  );
}
