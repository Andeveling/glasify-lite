/**
 * Service Mutations - Write Procedures
 *
 * tRPC procedures for creating, updating, and deleting services.
 *
 * @module server/api/routers/admin/service/service.mutations
 */

import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  serviceCreateInput,
  serviceOutput,
  serviceUpdateInput,
} from "./service.schemas";
import { createService, deleteService, updateService } from "./service.service";

const deleteInput = z.object({ id: z.string().uuid() });

export const serviceMutations = createTRPCRouter({
  /**
   * Create new service
   */
  create: adminProcedure
    .input(serviceCreateInput)
    .output(serviceOutput)
    .mutation(async ({ ctx, input }) => createService(ctx.db, input)),

  /**
   * Update service
   */
  update: adminProcedure
    .input(serviceUpdateInput)
    .output(serviceOutput)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      return await updateService(
        ctx.db,
        id,
        data as Parameters<typeof updateService>[2]
      );
    }),

  /**
   * Delete service
   */
  delete: adminProcedure
    .input(deleteInput)
    .output(z.void())
    .mutation(async ({ ctx, input }) => {
      await deleteService(ctx.db, input.id);
    }),
});
