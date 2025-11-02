import { Ruler } from "lucide-react";
import { useCallback, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormSection } from "@/components/form-section";
import { useDebouncedDimension } from "../../../_hooks/use-debounced-dimension";
import { DimensionField } from "../dimension-field";
import { DimensionValidationAlert } from "../dimension-validation-alert";
import { QuantityField } from "../quantity-field";

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
function generateSuggestedValues(
	min: number,
	max: number,
	count = 5,
): number[] {
	const range = max - min;
	const step = range / (count - 1);

	return Array.from({ length: count }, (_, i) => {
		const value = min + step * i;
		// Redondear a múltiplos de 10 para valores más "amigables"
		return Math.round(value / 10) * 10;
	}).filter((value, index, arr) => arr.indexOf(value) === index); // Eliminar duplicados
}

export function DimensionsSection({ dimensions }: DimensionsSectionProps) {
	const { control, setValue } = useFormContext();

	// Watch values para el preview
	const width = useWatch({ control, name: "width" });
	const height = useWatch({ control, name: "height" });

	// ✅ Stable setValue callbacks to prevent infinite loops
	const setWidthValue = useCallback(
		(value: number) => setValue("width", value, { shouldValidate: true }),
		[setValue],
	);

	const setHeightValue = useCallback(
		(value: number) => setValue("height", value, { shouldValidate: true }),
		[setValue],
	);

	// ✅ Use custom debounced dimension hook for width
	const { localValue: localWidth, setLocalValue: setLocalWidth } =
		useDebouncedDimension({
			initialValue: width || dimensions.minWidth,
			max: dimensions.maxWidth,
			min: dimensions.minWidth,
			setValue: setWidthValue,
			value: width,
		});

	// ✅ Use custom debounced dimension hook for height
	const { localValue: localHeight, setLocalValue: setLocalHeight } =
		useDebouncedDimension({
			initialValue: height || dimensions.minHeight,
			max: dimensions.maxHeight,
			min: dimensions.minHeight,
			setValue: setHeightValue,
			value: height,
		});

	// ✅ Memoize validation function to avoid recreation
	const isValidDimension = useCallback(
		(value: number, min: number, max: number) => value >= min && value <= max,
		[],
	);

	// ✅ Optimized handlers for sliders - no debounce needed (handled by hook)
	const handleWidthSliderChange = useCallback(
		(value: number[]) => {
			const newValue = value[0];
			if (newValue !== undefined) {
				setLocalWidth(newValue); // ✅ Update local state immediately (visual feedback)
				// ✅ Form update is debounced automatically in the hook
			}
		},
		[setLocalWidth],
	);

	const handleHeightSliderChange = useCallback(
		(value: number[]) => {
			const newValue = value[0];
			if (newValue !== undefined) {
				setLocalHeight(newValue);
			}
		},
		[setLocalHeight],
	);

	// ✅ Memoize validation check functions
	const isWidthValid = useCallback(
		(value: number) =>
			isValidDimension(value, dimensions.minWidth, dimensions.maxWidth),
		[dimensions.minWidth, dimensions.maxWidth, isValidDimension],
	);

	const isHeightValid = useCallback(
		(value: number) =>
			isValidDimension(value, dimensions.minHeight, dimensions.maxHeight),
		[dimensions.minHeight, dimensions.maxHeight, isValidDimension],
	);

	// ✅ Memoize suggested values arrays to prevent recreation on every render
	const widthSuggestedValues = useMemo(
		() => generateSuggestedValues(dimensions.minWidth, dimensions.maxWidth),
		[dimensions.minWidth, dimensions.maxWidth],
	);

	const heightSuggestedValues = useMemo(
		() => generateSuggestedValues(dimensions.minHeight, dimensions.maxHeight),
		[dimensions.minHeight, dimensions.maxHeight],
	);

	// Check if validation alert should show
	const showValidationAlert =
		(width &&
			!isValidDimension(width, dimensions.minWidth, dimensions.maxWidth)) ||
		(height &&
			!isValidDimension(height, dimensions.minHeight, dimensions.maxHeight));

	return (
		<FormSection
			// description="Especifica las dimensiones del modelo que necesitas."
			icon={Ruler}
			legend="Dimensiones"
		>
			<div className="grid gap-6 sm:grid-cols-2">
				<DimensionField
					control={control}
					isValid={isWidthValid}
					label="Ancho"
					localValue={localWidth}
					max={dimensions.maxWidth}
					min={dimensions.minWidth}
					name="width"
					onSliderChange={handleWidthSliderChange}
					suggestedValues={widthSuggestedValues}
					variant="minimal"
				/>

				<DimensionField
					control={control}
					isValid={isHeightValid}
					label="Alto"
					localValue={localHeight}
					max={dimensions.maxHeight}
					min={dimensions.minHeight}
					name="height"
					onSliderChange={handleHeightSliderChange}
					suggestedValues={heightSuggestedValues}
					variant="minimal"
				/>
			</div>

			<DimensionValidationAlert showAlert={showValidationAlert} />

			<QuantityField control={control} name="quantity" />
		</FormSection>
	);
}
