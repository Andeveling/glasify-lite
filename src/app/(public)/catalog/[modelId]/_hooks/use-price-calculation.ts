import { useEffect, useMemo, useRef, useState } from 'react';
import { api } from '@/trpc/react';

type UsePriceCalculationParams = {
  additionalServices: string[];
  glassTypeId: string;
  heightMm: number;
  modelId: string;
  widthMm: number;
};

const DEBOUNCE_DELAY_MS = 300; // ✅ Optimized for real-time responsiveness

/**
 * Custom hook para calcular el precio del item con debounce optimizado
 * ✅ Real-time UX Improvements:
 * - Debounce a 300ms para balance óptimo entre responsiveness y performance
 * - Estado de cálculo claro con isCalculating
 * - Manejo robusto de errores con mensajes user-friendly
 * - Prevención de loops infinitos usando refs y memoización estable
 * - Serialización estable de arrays para evitar re-renders innecesarios
 */
export function usePriceCalculation(params: UsePriceCalculationParams) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateMutation = api.quote['calculate-item'].useMutation({
    onError: (err) => {
      setIsCalculating(false);
      setCalculatedPrice(undefined);

      // ✅ User-friendly error messages in Spanish
      let errorMessage = 'Error al calcular el precio. Intenta nuevamente.';

      if (err.message.includes('no encontrado') || err.message.includes('no disponible')) {
        errorMessage = 'Modelo no disponible';
      } else if (err.message.includes('no compatible')) {
        errorMessage = 'Tipo de vidrio no compatible';
      } else if (err.message.includes('debe estar entre')) {
        errorMessage = 'Dimensiones fuera del rango permitido';
      }

      setError(errorMessage);
    },
    onSuccess: (data) => {
      setCalculatedPrice(data.subtotal);
      setIsCalculating(false);
      setError(undefined);
    },
  });

  // ✅ Store mutate function in ref to avoid dependency issues
  const mutateRef = useRef(calculateMutation.mutate);
  mutateRef.current = calculateMutation.mutate;

  // ✅ Create stable serialized dependency for services array
  const servicesKey = useMemo(() => JSON.stringify(params.additionalServices), [params.additionalServices]);

  // ✅ Store services in ref for stable access
  const servicesRef = useRef(params.additionalServices);
  servicesRef.current = params.additionalServices;

  // ✅ Debounced calculation effect with stable dependencies
  // biome-ignore lint/correctness/useExhaustiveDependencies: servicesKey is intentionally used to detect array changes
  useEffect(() => {
    // Only calculate if we have all required data
    const isValid = params.modelId && params.glassTypeId && params.heightMm > 0 && params.widthMm > 0;

    if (!isValid) {
      setCalculatedPrice(undefined);
      setError(undefined);
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
        services: servicesRef.current.map((serviceId: string) => ({
          serviceId,
        })),
        widthMm: params.widthMm,
      });
    }, DEBOUNCE_DELAY_MS);

    // Cleanup on unmount or params change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [params.modelId, params.glassTypeId, params.heightMm, params.widthMm, servicesKey]);

  return {
    calculatedPrice,
    error,
    isCalculating,
  };
}
