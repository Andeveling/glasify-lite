import { z } from 'zod';
import type { ModelDetailOutput } from '@/server/api/routers/catalog';

const MAX_QUANTITY = 100;
const MIN_QUANTITY = 1;

/**
 * Crea un schema de validación dinámico basado en las dimensiones del modelo
 */
export function createQuoteFormSchema(model: ModelDetailOutput) {
  return z.object({
    additionalServices: z.array(z.string()),
    glassType: z.string({ message: 'Debes seleccionar un tipo de cristal' }).min(1),
    height: z.coerce
      .number({ message: 'La altura debe ser un número válido' })
      .min(model.minHeightMm, { message: `La altura mínima es ${model.minHeightMm}mm` })
      .max(model.maxHeightMm, { message: `La altura máxima es ${model.maxHeightMm}mm` }),
    quantity: z.coerce
      .number({ message: 'La cantidad debe ser un número válido' })
      .int({ message: 'La cantidad debe ser un número entero' })
      .min(MIN_QUANTITY, { message: `La cantidad mínima es ${MIN_QUANTITY}` })
      .max(MAX_QUANTITY, { message: `La cantidad máxima es ${MAX_QUANTITY}` }),
    width: z.coerce
      .number({ message: 'El ancho debe ser un número válido' })
      .min(model.minWidthMm, { message: `El ancho mínimo es ${model.minWidthMm}mm` })
      .max(model.maxWidthMm, { message: `El ancho máximo es ${model.maxWidthMm}mm` }),
  });
}

export type QuoteFormSchema = ReturnType<typeof createQuoteFormSchema>;
export type QuoteFormInput = z.input<QuoteFormSchema>;
export type QuoteFormValues = z.output<QuoteFormSchema>;
