import type { Control, FieldValues, Path } from "react-hook-form";
import { DimensionInput } from "@/components/dimension-input";
import { DimensionSlider } from "@/components/dimension-slider";
import { SuggestedValueBadges } from "@/components/suggested-value-badges";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ValidationIndicator } from "@/components/validation-indicator";

/**
 * Configuración de variantes para el DimensionField
 * Define qué elementos se muestran en cada variante
 */
type DimensionVariant = "full" | "simple" | "compact" | "minimal";

type DimensionVariantConfig = {
  showInput: boolean;
  showSlider: boolean;
  showSuggestedValues: boolean;
  showValidationIndicator: boolean;
  showDescription: boolean;
  showFormMessage: boolean;
  spacingClassName: string;
  labelClassName: string;
};

/**
 * Configuraciones predefinidas para cada variante
 * Reduce carga cognitiva y optimiza para diferentes contextos
 */
const VARIANT_CONFIGS: Record<DimensionVariant, DimensionVariantConfig> = {
  // Full: Todas las características (valor por defecto - retrocompatibilidad)
  full: {
    showInput: true,
    showSlider: true,
    showSuggestedValues: true,
    showValidationIndicator: true,
    showDescription: true,
    showFormMessage: true,
    spacingClassName: "space-y-2",
    labelClassName: "text-sm",
  },
  // Simple: Input, slider y validación (recomendado para mayoría de casos)
  simple: {
    showInput: true,
    showSlider: true,
    showSuggestedValues: false,
    showValidationIndicator: true,
    showDescription: true,
    showFormMessage: true,
    spacingClassName: "space-y-1.5",
    labelClassName: "text-sm",
  },
  // Compact: Solo input y descripción (máxima reducción de carga cognitiva)
  compact: {
    showInput: true,
    showSlider: false,
    showSuggestedValues: false,
    showValidationIndicator: false,
    showDescription: false,
    showFormMessage: true,
    spacingClassName: "space-y-1",
    labelClassName: "text-xs",
  },
  // Minimal: Solo input (para casos muy específicos)
  minimal: {
    showInput: true,
    showSlider: false,
    showSuggestedValues: false,
    showValidationIndicator: false,
    showDescription: false,
    showFormMessage: false,
    spacingClassName: "space-y-0.5",
    labelClassName: "text-xs",
  },
};

type DimensionFieldProps<T extends FieldValues> = {
  control: Control<T>;
  name: Path<T>;
  label: string;
  min: number;
  max: number;
  localValue: number;
  onSliderChange: (value: number[]) => void;
  isValid: (value: number) => boolean;
  suggestedValues: number[];
  /** Variante de visualización (default: "full" para retrocompatibilidad) */
  variant?: DimensionVariant;
  /** Configuración personalizada (sobrescribe la variante) */
  customConfig?: Partial<DimensionVariantConfig>;
};

/**
 * DimensionField - Organism component con soporte de variantes
 * Proporciona múltiples niveles de complejidad para reducir carga cognitiva
 *
 * @example
 * // Retrocompatibilidad (valor por defecto)
 * <DimensionField {...props} />
 *
 * // Versión simplificada (recomendada)
 * <DimensionField {...props} variant="simple" />
 *
 * // Versión compacta (máxima reducción de carga)
 * <DimensionField {...props} variant="compact" />
 *
 * // Configuración personalizada
 * <DimensionField {...props} customConfig={{ showSlider: false }} />
 */
export function DimensionField<T extends FieldValues>({
  control,
  name,
  label,
  min,
  max,
  localValue,
  onSliderChange,
  isValid,
  suggestedValues,
  variant = "full",
  customConfig,
}: DimensionFieldProps<T>) {
  // Resolver configuración: custom > variant > default
  const config: DimensionVariantConfig = {
    ...VARIANT_CONFIGS[variant],
    ...customConfig,
  };

  // Determine dimension type based on label
  const dimensionType = label.toLowerCase().includes("ancho")
    ? "width"
    : "height";

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldIsValid = isValid(field.value);
        // Show inline range hint next to label only when description is hidden
        const showInlineRangeHint = !config.showDescription;

        return (
          <FormItem className={config.spacingClassName}>
            {/* Header: Label + Optional Inline Range + Optional Validation Indicator */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FormLabel className={config.labelClassName}>{label}</FormLabel>
                {showInlineRangeHint && (
                  <span className="text-muted-foreground text-xs">
                    ({min} - {max} mm)
                  </span>
                )}
              </div>
              {config.showValidationIndicator && (
                <ValidationIndicator
                  isValid={fieldIsValid}
                  showIndicator={!!field.value}
                />
              )}
            </div>

            {/* Main Input */}
            {config.showInput && (
              <FormControl>
                <DimensionInput
                  dimensionType={dimensionType}
                  isValid={fieldIsValid}
                  max={max}
                  min={min}
                  onChange={field.onChange}
                  placeholder={String(min)}
                  value={field.value}
                />
              </FormControl>
            )}

            {/* Optional Slider */}
            {config.showSlider && (
              <div className="hidden sm:block">
                <DimensionSlider
                  max={max}
                  min={min}
                  onChange={onSliderChange}
                  step={10}
                  trackColor={fieldIsValid ? "muted" : "destructive"}
                  value={localValue}
                />
              </div>
            )}

            {/* Optional Suggested Values */}
            {config.showSuggestedValues && (
              <div className="hidden lg:block">
                <SuggestedValueBadges
                  currentValue={field.value}
                  onSelect={field.onChange}
                  values={suggestedValues}
                />
              </div>
            )}

            {/* Optional Description */}
            {config.showDescription && (
              <FormDescription className="text-xs">
                Rango: {min}-{max}mm
              </FormDescription>
            )}

            {/* Optional Error Message */}
            {config.showFormMessage && <FormMessage />}
          </FormItem>
        );
      }}
    />
  );
}
