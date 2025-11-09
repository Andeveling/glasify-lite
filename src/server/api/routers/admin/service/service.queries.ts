/**
 * Service Queries - Read Procedures
 *
 * tRPC procedures for retrieving services.
 *
 * @module server/api/routers/admin/service/service.queries
 */

import { z } from "zod";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  serviceFilterInput,
  serviceListOutput,
  serviceOutput,
} from "./service.schemas";
import { getServiceById, listServices } from "./service.service";

// Input schemas
const getByIdInput = z.object({ id: z.string().uuid() });

export const serviceQueries = createTRPCRouter({
  /**
   * Get service by ID
   */
  getById: adminProcedure
    .input(getByIdInput)
    .output(serviceOutput)
    .query(async ({ ctx, input }) => getServiceById(ctx.db, input.id)),

  /**
   * List services with filters and pagination
   */
  list: adminProcedure
    .input(serviceFilterInput)
    .output(serviceListOutput)
    .query(async ({ ctx, input }) => listServices(ctx.db, input)),
});
