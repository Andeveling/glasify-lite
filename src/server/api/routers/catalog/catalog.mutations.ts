// src/server/api/routers/catalog/catalog.mutations.ts

import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";

// Validation constants
const MIN_MODEL_NAME_LENGTH = 3;

export const catalogMutations = createTRPCRouter({
  /**
   * Create a new model (admin only)
   * @protected
   */
  "create-model": protectedProcedure
    .input(
      z.object({
        basePrice: z.number().positive(),
        manufacturerId: z.cuid(),
        name: z.string().min(MIN_MODEL_NAME_LENGTH),
        // ... otros campos
      })
    )
    .mutation(() => {
      // TODO: Implementar cuando sea necesario
      throw new Error("Not implemented yet");
    }),

  /**
   * Update an existing model (admin only)
   * @protected
   */
  "update-model": protectedProcedure
    .input(
      z.object({
        basePrice: z.number().positive().optional(),
        id: z.cuid(),
        name: z.string().min(MIN_MODEL_NAME_LENGTH).optional(),
        // ... otros campos
      })
    )
    .mutation(() => {
      // TODO: Implementar cuando sea necesario
      throw new Error("Not implemented yet");
    }),
});
