/**
 * Quote Generation Form Hook
 *
 * Custom hook that encapsulates all quote generation form logic.
 * Follows Single Responsibility Principle - manages only form state.
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Submission handling with Server Action
 * - Loading/redirecting states
 * - Session verification
 * - Cart clearing on success
 *
 * @module app/(public)/cart/_hooks/use-quote-generation-form
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { generateQuoteFromCartAction } from "@/app/_actions/quote.actions";
import {
  type QuoteGenerationFormValues,
  quoteGenerationFormSchema,
  transformToActionInput,
} from "../_schemas/quote-generation.schema";
import { useCart } from "./use-cart";

// ============================================================================
// Types
// ============================================================================

type UseQuoteGenerationFormOptions = {
  /** Callback when form submission starts */
  onSubmitStart?: () => void;
  /** Callback when drawer should close */
  onClose?: () => void;
};

type UseQuoteGenerationFormReturn = {
  /** React Hook Form instance */
  form: ReturnType<typeof useForm<QuoteGenerationFormValues>>;
  /** Whether form is being submitted */
  isSubmitting: boolean;
  /** Whether redirecting after success */
  isRedirecting: boolean;
  /** Cart items for summary display */
  cartItems: ReturnType<typeof useCart>["items"];
  /** Cart summary (total, count) */
  cartSummary: ReturnType<typeof useCart>["summary"];
  /** Form submission handler */
  handleSubmit: () => Promise<void>;
  /** Whether form can be submitted */
  canSubmit: boolean;
};

// ============================================================================
// Hook Implementation
// ============================================================================

/**
 * Quote Generation Form Hook
 *
 * @example
 * ```tsx
 * const { form, isSubmitting, handleSubmit, canSubmit } = useQuoteGenerationForm({
 *   onClose: () => setOpen(false),
 * });
 * ```
 */
export function useQuoteGenerationForm(
  options: UseQuoteGenerationFormOptions = {}
): UseQuoteGenerationFormReturn {
  const { onSubmitStart, onClose } = options;

  const router = useRouter();
  const { items: cartItems, clearCart, summary: cartSummary } = useCart();

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Initialize form with schema validation
  const form = useForm<QuoteGenerationFormValues>({
    defaultValues: {
      projectName: "",
      deliveryAddress: {
        city: null,
        country: null,
        district: null,
        label: null,
        latitude: null,
        longitude: null,
        postalCode: null,
        reference: null,
        region: null,
        street: null,
      },
      contactPhone: "",
      deliveryReference: "",
    },
    mode: "onBlur",
    resolver: zodResolver(quoteGenerationFormSchema),
  });

  // Computed: Can form be submitted
  const hasCartItems = cartItems.length > 0;
  const isBusy = isSubmitting || isRedirecting;
  const canSubmit = hasCartItems && !isBusy;

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Trigger validation
    const isValid = await form.trigger();
    if (!isValid) {
      toast.error("Por favor corrige los errores del formulario");
      return;
    }

    const values = form.getValues();

    await toast.promise(
      async () => {
        setIsSubmitting(true);
        onSubmitStart?.();

        try {
          // Transform form values to action input (derive legacy fields)
          const actionInput = transformToActionInput(values);

          const result = await generateQuoteFromCartAction(
            actionInput,
            cartItems
          );

          if (result.success && result.quoteId) {
            clearCart();
            setIsRedirecting(true);

            // Close drawer
            onClose?.();

            // Small delay for UX (show success message)
            const REDIRECT_DELAY_MS = 500;
            await new Promise((resolve) =>
              setTimeout(resolve, REDIRECT_DELAY_MS)
            );

            // Redirect to quote detail
            router.push(`/my-quotes/${result.quoteId}`);

            return result.quoteId;
          }

          // Handle error
          form.setError("root", {
            message: result.error ?? "Error al generar la cotización",
          });

          throw new Error(result.error ?? "Error al generar la cotización");
        } finally {
          setIsSubmitting(false);
        }
      },
      {
        error: (error) =>
          error instanceof Error
            ? error.message
            : "Error al generar la cotización",
        loading: "Generando cotización...",
        success: "Cotización creada exitosamente. Redirigiendo...",
      }
    );
  }, [form, cartItems, clearCart, router, onClose, onSubmitStart]);

  return {
    form,
    isSubmitting,
    isRedirecting,
    cartItems,
    cartSummary,
    handleSubmit,
    canSubmit,
  };
}
