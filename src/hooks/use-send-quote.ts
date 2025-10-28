/**
 * Custom Hook: useSendQuote
 *
 * Provides type-safe mutation for sending draft quotes to vendor.
 * Includes optimistic updates, error handling, and toast notifications.
 *
 * Feature: 005-send-quote-to (User Story 1 - T014)
 *
 * @module hooks/use-send-quote
 */

"use client";

import type { TRPCClientErrorLike } from "@trpc/client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { AppRouter } from "@/server/api/root";
import type { SendToVendorInput } from "@/server/api/routers/quote/quote.schemas";
import { api } from "@/trpc/react";

type TRPCError = TRPCClientErrorLike<AppRouter>;

// Context type for optimistic updates - using 'any' to avoid complex type inference
// The actual type is inferred from the query return value at runtime
type UseSendQuoteContext = {
  // biome-ignore lint/suspicious/noExplicitAny: Complex tRPC query type, runtime type-safe
  previousQuote?: any;
};

type UseSendQuoteOptions = {
  /**
   * Callback fired when mutation succeeds
   */
  onSuccess?: (data: { id: string; sentAt: Date }) => void;
  /**
   * Callback fired when mutation fails
   */
  onError?: (error: TRPCError) => void;
  /**
   * Whether to redirect to quote detail page after success
   * @default true
   */
  redirectOnSuccess?: boolean;
};

/**
 * Hook for sending draft quotes to vendor
 *
 * @example
 * ```tsx
 * function QuoteForm() {
 *   const { mutate, isPending } = useSendQuote({
 *     onSuccess: (data) => {
 *       console.log('Quote sent:', data.id);
 *     }
 *   });
 *
 *   const handleSubmit = (data: SendToVendorInput) => {
 *     mutate(data);
 *   };
 *
 *   return <button disabled={isPending}>Enviar</button>;
 * }
 * ```
 */
export function useSendQuote(options: UseSendQuoteOptions = {}) {
  const { onSuccess, onError, redirectOnSuccess = true } = options;

  const router = useRouter();
  const utils = api.useUtils();
  const [isPending, startTransition] = useTransition();
  const [optimisticQuoteId, setOptimisticQuoteId] = useState<string | null>(
    null
  );

  const mutation = api.quote["send-to-vendor"].useMutation<UseSendQuoteContext>(
    {
      onError: (error, input, context) => {
        // Rollback optimistic update
        if (context?.previousQuote) {
          utils.quote["get-by-id"].setData(
            { id: input.quoteId },
            context.previousQuote
          );
        }

        setOptimisticQuoteId(null);

        // Dismiss loading toast
        toast.dismiss(`send-quote-${input.quoteId}`);

        // Show error toast with user-friendly message
        const errorMessage =
          error.message ||
          "No se pudo enviar la cotización. Intenta nuevamente.";
        toast.error("Error al enviar cotización", {
          description: errorMessage,
          duration: 5000,
        });

        // Call custom error handler
        if (onError) {
          onError(error);
        }
      },
      onMutate: async (input) => {
        // Cancel outgoing refetches to avoid overwriting optimistic update
        await utils.quote["get-by-id"].cancel({ id: input.quoteId });

        // Store quote ID for rollback
        setOptimisticQuoteId(input.quoteId);

        // Snapshot the previous value
        const previousQuote = utils.quote["get-by-id"].getData({
          id: input.quoteId,
        });

        // Optimistically update to 'sent' status
        utils.quote["get-by-id"].setData({ id: input.quoteId }, (old) => {
          if (!old) return old;

          return {
            ...old,
            contactPhone: input.contactPhone,
            sentAt: new Date(),
            status: "sent" as const,
          };
        });

        // Show loading toast
        toast.loading("Enviando cotización...", {
          id: `send-quote-${input.quoteId}`,
        });

        return { previousQuote };
      },

      onSettled: () => {
        setOptimisticQuoteId(null);
      },

      onSuccess: (data, input) => {
        setOptimisticQuoteId(null);

        // Dismiss loading toast
        toast.dismiss(`send-quote-${input.quoteId}`);

        // Show success toast
        toast.success("¡Cotización enviada exitosamente!", {
          description:
            "Tu cotización ha sido enviada al fabricante. Recibirás respuesta en 24-48 horas.",
          duration: 6000,
        });

        // Invalidate related queries to refetch fresh data
        startTransition(async () => {
          await Promise.all([
            utils.quote["get-by-id"].invalidate({ id: input.quoteId }),
            utils.quote["list-user-quotes"].invalidate(),
          ]);
        });

        // Call custom success handler
        if (onSuccess) {
          onSuccess({
            id: data.id,
            sentAt: data.sentAt,
          });
        }

        // Redirect to quote detail page
        if (redirectOnSuccess) {
          router.push(`/dashboard/quotes/${data.id}`);
          router.refresh();
        }
      },
    }
  );

  return {
    /**
     * The success data if mutation succeeded
     */
    data: mutation.data,
    /**
     * The error object if mutation failed
     */
    error: mutation.error,
    /**
     * Whether the mutation failed
     */
    isError: mutation.isError,
    /**
     * Whether the mutation is currently pending
     */
    isPending: mutation.isPending || isPending,
    /**
     * Whether the mutation succeeded
     */
    isSuccess: mutation.isSuccess,
    /**
     * Execute the mutation to send quote to vendor
     */
    mutate: mutation.mutate,
    /**
     * Execute the mutation with promise-based API
     */
    mutateAsync: mutation.mutateAsync,
    /**
     * Quote ID being optimistically updated (if any)
     */
    optimisticQuoteId,
    /**
     * Reset the mutation state
     */
    reset: mutation.reset,
  };
}

/**
 * Type-safe input for useSendQuote mutation
 */
export type SendQuoteInput = SendToVendorInput;
