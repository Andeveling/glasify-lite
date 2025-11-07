import type { Control, FieldValues, Path } from "react-hook-form";
import { DimensionInput } from "@/components/dimension-input";
import { DimensionSlider } from "@/components/dimension-slider";
import { SuggestedValueBadges } from "@/components/suggested-value-badges";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  type DimensionVariant,
  type DimensionVariantConfig,
  resolveVariantConfig,
  shouldShowInlineRangeHint,
} from "./dimension-field-config";
import {
  DimensionFieldHeader,
  OptionalContent,
} from "./dimension-field-header";

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
  // Resolve configuration using extracted function (Dependency Inversion)
  const config = resolveVariantConfig(variant, customConfig);

  // Determine dimension type based on label
  const dimensionType = label.toLowerCase().includes("ancho")
    ? "width"
    : "height";

  // Determine if inline range hint should be shown
  const showInlineRangeHint = shouldShowInlineRangeHint(config);

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const fieldIsValid = isValid(field.value);

        return (
          <FormItem className={config.spacingClassName}>
            {/* Header component (extracted for Single Responsibility) */}
            <DimensionFieldHeader
              hasValue={!!field.value}
              isValid={fieldIsValid}
              label={label}
              labelClassName={config.labelClassName}
              max={max}
              min={min}
              showInlineRangeHint={showInlineRangeHint}
              showValidationIndicator={config.showValidationIndicator}
            />

            {/* Main Input (wrapped in OptionalContent) */}
            <OptionalContent show={config.showInput}>
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
            </OptionalContent>

            {/* Optional Slider */}
            <OptionalContent
              className="hidden sm:block"
              show={config.showSlider}
            >
              <DimensionSlider
                max={max}
                min={min}
                onChange={onSliderChange}
                step={10}
                trackColor={fieldIsValid ? "muted" : "destructive"}
                value={localValue}
              />
            </OptionalContent>

            {/* Optional Suggested Values */}
            <OptionalContent
              className="hidden lg:block"
              show={config.showSuggestedValues}
            >
              <SuggestedValueBadges
                currentValue={field.value}
                onSelect={field.onChange}
                values={suggestedValues}
              />
            </OptionalContent>

            {/* Optional Description */}
            <OptionalContent show={config.showDescription}>
              <FormDescription className="text-xs">
                Rango: {min}-{max}mm
              </FormDescription>
            </OptionalContent>

            {/* Optional Error Message */}
            <OptionalContent show={config.showFormMessage}>
              <FormMessage />
            </OptionalContent>
          </FormItem>
        );
      }}
    />
  );
}
