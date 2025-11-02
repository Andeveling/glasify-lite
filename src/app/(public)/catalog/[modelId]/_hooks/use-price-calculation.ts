import { useEffect, useMemo, useRef, useState } from "react";
import type { PriceItemCalculationResult } from "@/server/price/price-item";
import { api } from "@/trpc/react";

type UsePriceCalculationParams = {
	additionalServices: string[];
	glassTypeId: string;
	heightMm: number;
	modelId: string;
	widthMm: number;
	// ✅ Model dimension constraints for validation
	minWidthMm?: number;
	maxWidthMm?: number;
	minHeightMm?: number;
	maxHeightMm?: number;
	// ✅ Color surcharge percentage (0-100)
	colorSurchargePercentage?: number;
};

type UsePriceCalculationReturn = {
	calculatedPrice: number | undefined;
	breakdown: PriceItemCalculationResult | undefined;
	error: string | undefined;
	isCalculating: boolean;
};

const DEBOUNCE_DELAY_MS = 300; // ✅ Optimized for real-time responsiveness

/**
 * Custom hook para calcular el precio del item con debounce optimizado
 * ✅ Real-time UX Improvements:
 * - Debounce a 300ms para balance óptimo entre responsiveness y performance
 * - Validación client-side: NO llama al API si dimensiones están fuera de rango
 * - Estado de cálculo claro con isCalculating
 * - Manejo robusto de errores con mensajes user-friendly
 * - Prevención de loops infinitos usando refs y memoización estable
 * - Serialización estable de arrays para evitar re-renders innecesarios
 * - Retorna desglose completo con dimPrice, accPrice, services, adjustments
 *
 * @param params - Parámetros de cálculo incluyendo dimensiones y límites del modelo
 * @param params.minWidthMm - Ancho mínimo permitido (opcional, validación client-side)
 * @param params.maxWidthMm - Ancho máximo permitido (opcional, validación client-side)
 * @param params.minHeightMm - Alto mínimo permitido (opcional, validación client-side)
 * @param params.maxHeightMm - Alto máximo permitido (opcional, validación client-side)
 * @param params.colorSurchargePercentage - Porcentaje de recargo por color (0-100, opcional)
 * @returns Estado del cálculo con precio, desglose, error y bandera isCalculating
 */
export function usePriceCalculation(
	params: UsePriceCalculationParams,
): UsePriceCalculationReturn {
	const [isCalculating, setIsCalculating] = useState(false);
	const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(
		undefined,
	);
	const [breakdown, setBreakdown] = useState<
		PriceItemCalculationResult | undefined
	>(undefined);
	const [error, setError] = useState<string | undefined>(undefined);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	const calculateMutation = api.quote["calculate-item"].useMutation({
		onError: (err) => {
			setIsCalculating(false);
			setCalculatedPrice(undefined);
			setBreakdown(undefined);

			// ✅ User-friendly error messages in Spanish
			let errorMessage = "Error al calcular el precio. Intenta nuevamente.";

			if (
				err.message.includes("no encontrado") ||
				err.message.includes("no disponible")
			) {
				errorMessage = "Modelo no disponible";
			} else if (err.message.includes("no compatible")) {
				errorMessage = "Tipo de vidrio no compatible";
			} else if (err.message.includes("debe estar entre")) {
				errorMessage = "Dimensiones fuera del rango permitido";
			}

			setError(errorMessage);
		},
		onSuccess: (data) => {
			setCalculatedPrice(data.subtotal);
			setBreakdown(data);
			setIsCalculating(false);
			setError(undefined);
		},
	});

	// ✅ Store mutate function in ref to avoid dependency issues
	const mutateRef = useRef(calculateMutation.mutate);
	mutateRef.current = calculateMutation.mutate;

	// ✅ Create stable serialized dependency for services array
	const servicesKey = useMemo(
		() => JSON.stringify(params.additionalServices),
		[params.additionalServices],
	);

	// ✅ Store services in ref for stable access
	const servicesRef = useRef(params.additionalServices);
	servicesRef.current = params.additionalServices;

	// ✅ Store color surcharge in ref to avoid stale closures
	const colorSurchargeRef = useRef(params.colorSurchargePercentage ?? 0);
	colorSurchargeRef.current = params.colorSurchargePercentage ?? 0;

	// ✅ Debounced calculation effect with stable dependencies
	// biome-ignore lint/correctness/useExhaustiveDependencies: servicesKey is intentionally used to detect array changes
	useEffect(() => {
		// ✅ VALIDATION 1: Check if we have all required data
		const hasRequiredData =
			params.modelId &&
			params.glassTypeId &&
			params.heightMm > 0 &&
			params.widthMm > 0;

		if (!hasRequiredData) {
			setCalculatedPrice(undefined);
			setBreakdown(undefined);
			setError(undefined);
			return;
		}

		// ✅ VALIDATION 2: Check if dimensions are within model constraints
		const isDimensionsValid =
			(!params.minWidthMm || params.widthMm >= params.minWidthMm) &&
			(!params.maxWidthMm || params.widthMm <= params.maxWidthMm) &&
			(!params.minHeightMm || params.heightMm >= params.minHeightMm) &&
			(!params.maxHeightMm || params.heightMm <= params.maxHeightMm);

		if (!isDimensionsValid) {
			// ✅ Don't call API if dimensions are out of range
			setCalculatedPrice(undefined);
			setBreakdown(undefined);
			setError("Dimensiones fuera del rango permitido");
			setIsCalculating(false);
			return;
		}

		// Clear previous timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		// Set new debounced timer
		debounceTimerRef.current = setTimeout(() => {
			setIsCalculating(true);

			mutateRef.current({
				adjustments: [],
				glassTypeId: params.glassTypeId,
				heightMm: params.heightMm,
				modelId: params.modelId,
				quantity: 1, // Default quantity for price calculation
				services: servicesRef.current.map((serviceId: string) => ({
					serviceId,
				})),
				unit: "unit", // Default unit for price calculation
				widthMm: params.widthMm,
				colorSurchargePercentage: colorSurchargeRef.current,
			});
		}, DEBOUNCE_DELAY_MS);

		// Cleanup on unmount or params change
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [
		params.modelId,
		params.glassTypeId,
		params.heightMm,
		params.widthMm,
		params.minWidthMm,
		params.maxWidthMm,
		params.minHeightMm,
		params.maxHeightMm,
		params.colorSurchargePercentage,
		servicesKey,
	]);

	return {
		breakdown,
		calculatedPrice,
		error,
		isCalculating,
	};
}
