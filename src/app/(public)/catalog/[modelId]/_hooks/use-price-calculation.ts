import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/trpc/react';

type UsePriceCalculationParams = {
  additionalServices: string[];
  glassTypeId: string;
  heightMm: number;
  modelId: string;
  widthMm: number;
};

const DEBOUNCE_DELAY_MS = 500;

/**
 * Custom hook para calcular el precio del item con debounce
 */
export function usePriceCalculation(params: UsePriceCalculationParams) {
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<number | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const calculateMutation = api.quote['calculate-item'].useMutation({
    onError: (err) => {
      console.error('Error calculating price', { error: err.message });
      setIsCalculating(false);
      setCalculatedPrice(undefined);

      // Set user-friendly error message
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

  const calculatePrice = useCallback(() => {
    // Solo calcular si tenemos todos los datos necesarios
    const isValid = params.modelId && params.glassTypeId && params.heightMm > 0 && params.widthMm > 0;

    if (!isValid) {
      setCalculatedPrice(undefined);
      return;
    }

    setIsCalculating(true);

    calculateMutation.mutate({
      adjustments: [],
      glassTypeId: params.glassTypeId,
      heightMm: params.heightMm,
      modelId: params.modelId,
      services: params.additionalServices.map((serviceId: string) => ({
        serviceId,
      })),
      widthMm: params.widthMm,
    });
  }, [params, calculateMutation]);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      calculatePrice();
    }, DEBOUNCE_DELAY_MS);

    // Cleanup on unmount or params change
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [calculatePrice]);

  return {
    calculatedPrice,
    error,
    isCalculating,
  };
}
