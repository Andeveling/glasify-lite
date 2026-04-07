/**
 * Create Quote Server Actions
 *
 * Server actions for admin quote creation.
 * These handle the server-side logic for creating quotes directly from items.
 *
 * @module app/(dashboard)/admin/_actions/create-quote.actions
 */

"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { toast } from "sonner";
import { appRouter } from "@/server/api/root";
import { createCallerFactory, createTRPCContext } from "@/server/api/trpc";

// Create caller factory
const createCaller = createCallerFactory(appRouter);

// Quote ID prefix length for display
const QUOTE_ID_DISPLAY_LENGTH = 8;

/**
 * Create quote from items
 *
 * Admin action to create a quote directly from item specifications.
 * Validates input, creates quote via tRPC mutation, and revalidates the quotes list.
 *
 * @param input - Quote creation input (items + project info)
 * @returns Quote ID if successful, throws error otherwise
 */
export async function createQuoteFromItemsAction(input: {
  items: Array<{
    glassTypeId: string;
    heightMm: number;
    modelId: string;
    quantity: number;
    widthMm: number;
  }>;
  projectAddress: {
    projectCity: string;
    projectName: string;
    projectState: string;
    projectStreet: string;
  };
  projectName: string;
  clientId?: string;
}): Promise<{ quoteId: string }> {
  try {
    // Create headers for tRPC context
    const heads = new Headers(await headers());
    heads.set("x-trpc-source", "server-action");

    // Create tRPC context
    const ctx = await createTRPCContext({
      headers: heads,
    });

    // Create caller and call mutation
    const caller = createCaller(ctx);
    const result = await caller.quote["create-quote-from-items"](input);

    // Revalidate the quotes list
    revalidatePath("/admin/quotes");

    toast.success("Cotización creada exitosamente", {
      description: `Cotización #${result.quoteId.slice(0, QUOTE_ID_DISPLAY_LENGTH)} creada con ${result.itemCount} ítems`,
    });

    return { quoteId: result.quoteId };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al crear la cotización";
    toast.error("Error al crear cotización", { description: message });
    throw error;
  }
}
