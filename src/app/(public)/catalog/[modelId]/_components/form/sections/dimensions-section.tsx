import { AlertCircle, Check, Package, Ruler } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FieldContent, FieldDescription, FieldLegend, FieldSet } from '@/components/ui/field';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

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

/**
 * Dibuja una ventana en el canvas con una figura humana de referencia
 */
function drawWindowPreview(
  canvas: HTMLCanvasElement,
  params: {
    windowWidth: number;
    windowHeight: number;
    maxWidth: number;
    maxHeight: number;
  }
) {
  const { windowWidth, windowHeight, maxWidth, maxHeight } = params;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;

  // Limpiar canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Constantes para escala y proporciones
  const HumanHeightMm = 1700; // Altura promedio humano: 1.7m
  const Padding = 40;
  const HumanWidthRatio = 0.35; // Proporción ancho/alto del humano
  const HumanSpacing = 30; // Espacio entre ventana y humano
  const HeadRatio = 0.08; // Tamaño de cabeza respecto a altura
  const BodyRatio = 0.6; // Longitud del torso
  const ArmPositionRatio = 0.3; // Posición de brazos en el torso
  const LegLeftRatio = 0.3; // Posición pierna izquierda
  const LegRightRatio = 0.7; // Posición pierna derecha

  // Calcular escala para que todo quepa en el canvas
  const scale = Math.min(
    (canvasWidth - Padding * 2) / (maxWidth + HumanHeightMm / 2),
    (canvasHeight - Padding * 2) / Math.max(maxHeight, HumanHeightMm)
  );

  // Dimensiones escaladas
  const scaledWindowWidth = windowWidth * scale;
  const scaledWindowHeight = windowHeight * scale;
  const scaledHumanHeight = HumanHeightMm * scale;
  const scaledHumanWidth = scaledHumanHeight * HumanWidthRatio;

  // Posición de la ventana (centrada verticalmente)
  const windowX = Padding;
  const windowY = (canvasHeight - scaledWindowHeight) / 2;

  // Posición del humano (a la derecha de la ventana)
  const humanX = windowX + scaledWindowWidth + HumanSpacing;
  const humanY = canvasHeight - Padding - scaledHumanHeight;

  // Dibujar ventana
  ctx.fillStyle = 'hsl(var(--primary) / 0.1)';
  ctx.fillRect(windowX, windowY, scaledWindowWidth, scaledWindowHeight);

  ctx.strokeStyle = 'hsl(var(--primary))';
  ctx.lineWidth = 2;
  ctx.strokeRect(windowX, windowY, scaledWindowWidth, scaledWindowHeight);

  // Dibujar marco de ventana (cruz central)
  ctx.strokeStyle = 'hsl(var(--primary) / 0.5)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(windowX + scaledWindowWidth / 2, windowY);
  ctx.lineTo(windowX + scaledWindowWidth / 2, windowY + scaledWindowHeight);
  ctx.moveTo(windowX, windowY + scaledWindowHeight / 2);
  ctx.lineTo(windowX + scaledWindowWidth, windowY + scaledWindowHeight / 2);
  ctx.stroke();

  // Dibujar figura humana estilizada
  ctx.strokeStyle = 'hsl(var(--muted-foreground))';
  ctx.fillStyle = 'hsl(var(--muted-foreground))';
  ctx.lineWidth = 2;

  // Cabeza
  const headRadius = scaledHumanHeight * HeadRatio;
  ctx.beginPath();
  ctx.arc(humanX + scaledHumanWidth / 2, humanY + headRadius, headRadius, 0, Math.PI * 2);
  ctx.stroke();

  // Cuerpo
  const bodyTop = humanY + headRadius * 2;
  const bodyBottom = humanY + scaledHumanHeight * BodyRatio;
  ctx.beginPath();
  ctx.moveTo(humanX + scaledHumanWidth / 2, bodyTop);
  ctx.lineTo(humanX + scaledHumanWidth / 2, bodyBottom);
  ctx.stroke();

  // Brazos
  const armY = bodyTop + (bodyBottom - bodyTop) * ArmPositionRatio;
  ctx.beginPath();
  ctx.moveTo(humanX, armY);
  ctx.lineTo(humanX + scaledHumanWidth, armY);
  ctx.stroke();

  // Piernas
  const legSplit = humanX + scaledHumanWidth / 2;
  ctx.beginPath();
  ctx.moveTo(legSplit, bodyBottom);
  ctx.lineTo(humanX + scaledHumanWidth * LegLeftRatio, humanY + scaledHumanHeight);
  ctx.moveTo(legSplit, bodyBottom);
  ctx.lineTo(humanX + scaledHumanWidth * LegRightRatio, humanY + scaledHumanHeight);
  ctx.stroke();

  // Etiquetas de medidas
  ctx.fillStyle = 'hsl(var(--foreground))';
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'center';

  // Medida de ancho
  ctx.fillText(`${windowWidth}mm`, windowX + scaledWindowWidth / 2, windowY - 10);

  // Medida de alto
  ctx.save();
  // biome-ignore lint/style/noMagicNumbers: offset visual para posicionar el texto
  ctx.translate(windowX - 15, windowY + scaledWindowHeight / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(`${windowHeight}mm`, 0, 0);
  ctx.restore();

  // Etiqueta de referencia humana
  ctx.fillStyle = 'hsl(var(--muted-foreground))';
  ctx.font = '10px sans-serif';
  // biome-ignore lint/style/noMagicNumbers: offset visual para posicionar el texto
  ctx.fillText('1.7m', humanX + scaledHumanWidth / 2, humanY + scaledHumanHeight + 15);
}

// biome-ignore lint/style/noMagicNumbers: valores predefinidos de cantidad para UX
const QUANTITY_PRESETS = [ 1, 3, 5, 10, 20 ] as const;

export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
  const { control } = useFormContext();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Watch values para el preview
  const width = useWatch({ control, name: 'width' });
  const height = useWatch({ control, name: 'height' });

  // Generar valores sugeridos dinámicamente
  const suggestedWidths = generateSuggestedValues(dimensions.minWidth, dimensions.maxWidth);
  const suggestedHeights = generateSuggestedValues(dimensions.minHeight, dimensions.maxHeight);

  const isValidDimension = (value: number, min: number, max: number) => value >= min && value <= max;

  // Dibujar canvas cuando cambian las dimensiones
  useEffect(() => {
    if (canvasRef.current && width && height) {
      drawWindowPreview(canvasRef.current, {
        maxHeight: dimensions.maxHeight,
        maxWidth: dimensions.maxWidth,
        windowHeight: height,
        windowWidth: width,
      });
    }
  }, [ width, height, dimensions.maxWidth, dimensions.maxHeight ]);

  return (
    <FieldSet>
      <FieldLegend>Dimensiones</FieldLegend>
      <FieldDescription>Especifica las dimensiones del vidrio requeridas.</FieldDescription>

      <FieldContent>
        {/* Preview Visual con Canvas */}
        {width && height && (
          <div className="mb-6 rounded-lg border bg-muted/30 p-4">
            <p className="mb-3 font-medium text-sm">Vista previa a escala</p>
            <div className="flex items-center justify-center">
              <canvas className="max-w-full" height={300} ref={canvasRef} width={600} />
            </div>
            <p className="mt-2 text-center text-muted-foreground text-xs">
              Figura humana de referencia: 1.7m de altura
            </p>
          </div>
        )}

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
