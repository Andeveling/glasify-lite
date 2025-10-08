import { AlertCircle, Check, Package, Ruler } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { Window2DPreview } from './window-2d-preview';

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
const QUANTITY_PRESETS = [ 1, 3, 5, 10, 20 ] as const;

export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
  const { control } = useFormContext();

  // Watch values para el preview
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });

  // Generar valores sugeridos dinámicamente
  const suggestedWidths = generateSuggestedValues(dimensions.minWidth, dimensions.maxWidth);
  const suggestedHeights = generateSuggestedValues(dimensions.minHeight, dimensions.maxHeight);

  const isValidDimension = (value: number, min: number, max: number) => value >= min && value <= max;

  return (
    <FieldSet>
      <FieldLegend>Dimensiones</FieldLegend>
      <FieldDescription>Especifica las dimensiones del vidrio requeridas.</FieldDescription>

      <FieldContent>
        <Window2DPreview height={height} showControls={false} width={width} />
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Ancho */}
          <FormField
            control={control}
            name="width"
            render={({ field }) => {
              const isValid = isValidDimension(field.value, dimensions.minWidth, dimensions.maxWidth);

              return (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Ancho</FormLabel>
                    {field.value &&
                      (isValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      ))}
                  </div>

                  {/* Input con estado visual */}
                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        className={!isValid && field.value ? 'border-red-500' : ''}
                        max={dimensions.maxWidth}
                        min={dimensions.minWidth}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        placeholder={String(dimensions.minWidth)}
                        step="1"
                        type="number"
                      />
                      <InputGroupAddon>
                        <Ruler
                          className={cn('h-4 w-4', {
                            'text-green-600': field.value && isValid,
                            'text-muted-foreground': !field.value,
                            'text-red-600': field.value && !isValid,
                          })}
                        />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>mm</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>

                  {/* Slider */}
                  <div className="px-2">
                    <Slider
                      className="my-4 h-3 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                      max={dimensions.maxWidth}
                      min={dimensions.minWidth}
                      onValueChange={([ value ]) => field.onChange(value)}
                      step={10}
                      value={[ field.value || dimensions.minWidth ]}
                    />
                  </div>

                  {/* Valores sugeridos */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedWidths.map((w) => (
                      <Badge className="cursor-pointer" key={w} onClick={() => field.onChange(w)} role="button">
                        {w}mm
                      </Badge>
                    ))}
                  </div>

                  <FormDescription>
                    Rango: {dimensions.minWidth}-{dimensions.maxWidth}mm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Alto */}
          <FormField
            control={control}
            name="height"
            render={({ field }) => {
              const isValid = isValidDimension(field.value, dimensions.minHeight, dimensions.maxHeight);

              return (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Alto</FormLabel>
                    {field.value &&
                      (isValid ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-destructive" />
                      ))}
                  </div>

                  <FormControl>
                    <InputGroup>
                      <InputGroupInput
                        {...field}
                        className={!isValid && field.value ? 'border-red-500' : ''}
                        max={dimensions.maxHeight}
                        min={dimensions.minHeight}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                        placeholder={String(dimensions.minHeight)}
                        step="1"
                        type="number"
                      />
                      <InputGroupAddon>
                        <Ruler
                          className={cn('h-4 w-4', {
                            'text-green-600': field.value && isValid,
                            'text-muted-foreground': !field.value,
                            'text-red-600': field.value && !isValid,
                          })}
                        />
                      </InputGroupAddon>
                      <InputGroupAddon align="inline-end">
                        <InputGroupText>mm</InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
                  </FormControl>

                  {/* Slider */}
                  <div className="px-2">
                    <Slider
                      className="my-4 h-3 [&_[role=slider]]:h-5 [&_[role=slider]]:w-5"
                      max={dimensions.maxHeight}
                      min={dimensions.minHeight}
                      onValueChange={([ value ]) => field.onChange(value)}
                      step={10}
                      value={[ field.value || dimensions.minHeight ]}
                    />
                  </div>

                  {/* Valores sugeridos */}
                  <div className="flex flex-wrap gap-2">
                    {suggestedHeights.map((h) => (
                      <Badge
                        className="cursor-pointer"
                        color="primary"
                        key={h}
                        onClick={() => field.onChange(h)}
                        role="button"
                      >
                        {h}mm
                      </Badge>
                    ))}
                  </div>

                  <FormDescription>
                    Rango: {dimensions.minHeight}-{dimensions.maxHeight}mm
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>

        {/* Alerta si hay dimensiones inválidas */}
        {((width && !isValidDimension(width, dimensions.minWidth, dimensions.maxWidth)) ||
          (height && !isValidDimension(height, dimensions.minHeight, dimensions.maxHeight))) && (
            <Alert className="mt-4" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Una o más dimensiones están fuera del rango permitido.</AlertDescription>
            </Alert>
          )}

        {/* Cantidad */}
        <FormField
          control={control}
          name="quantity"
          render={({ field }) => (
            <FormItem className="mt-6">
              <FormLabel>Cantidad</FormLabel>
              <FormControl>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    min="1"
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : '')}
                    placeholder="1"
                    step="1"
                    type="number"
                  />
                  <InputGroupAddon>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </InputGroupAddon>
                </InputGroup>
              </FormControl>

              {/* Botones rápidos de cantidad */}
              <div className="mt-2 flex flex-wrap gap-2">
                {QUANTITY_PRESETS.map((q) => (
                  <button
                    className="rounded bg-secondary px-3 py-1 text-xs transition-colors hover:bg-secondary/80"
                    key={q}
                    onClick={() => field.onChange(q)}
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>

              <FormDescription>Número de unidades que deseas cotizar</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FieldContent>
    </FieldSet>
  );
}
