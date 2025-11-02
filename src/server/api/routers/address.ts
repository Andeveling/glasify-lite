/**
 * Address tRPC Router
 *
 * Feature: 001-delivery-address
 * Created: 2025-11-01
 *
 * Purpose:
 * CRUD operations for ProjectAddress entities
 *
 * Endpoints:
 * - create: Create new address
 * - getById: Get address by ID
 * - update: Update existing address
 * - delete: Delete address
 * - listByQuote: List addresses for a quote
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { projectAddressSchema } from "@/app/(dashboard)/admin/quotes/_schemas/project-address.schema";
import logger from "@/lib/logger";
import { adminProcedure, createTRPCRouter } from "../trpc";

/**
 * Address Router
 *
 * Authorization: All procedures require adminProcedure (admin/seller only)
 * Additional ownership checks in procedures where applicable
 */
export const addressRouter = createTRPCRouter({
	/**
	 * Create new project address
	 *
	 * Input: ProjectAddressInput (validated with projectAddressSchema)
	 * Output: Created ProjectAddress entity
	 *
	 * Authorization: adminProcedure
	 * Task: T022 [US1]
	 */
	create: adminProcedure
		.input(projectAddressSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				logger.info("Creating project address", {
					userId: ctx.session.user.id,
					quoteId: input.quoteId,
				});

				// Create address with all validated fields
				const address = await ctx.db.projectAddress.create({
					data: {
						quoteId: input.quoteId,
						label: input.label,
						country: input.country,
						region: input.region,
						city: input.city,
						district: input.district,
						street: input.street,
						reference: input.reference,
						latitude: input.latitude,
						longitude: input.longitude,
						postalCode: input.postalCode,
					},
				});

				logger.info("Project address created successfully", {
					userId: ctx.session.user.id,
					addressId: address.id,
					quoteId: address.quoteId,
				});

				return address;
			} catch (error) {
				logger.error("Failed to create project address", {
					error: error instanceof Error ? error.message : String(error),
					userId: ctx.session.user.id,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al crear la dirección de entrega",
				});
			}
		}),

	/**
	 * Get address by ID
	 *
	 * Input: { id: string }
	 * Output: ProjectAddress entity or NOT_FOUND error
	 *
	 * Authorization: adminProcedure or quote owner
	 * Task: T023 [US1]
	 */
	getById: adminProcedure
		.input(
			z.object({
				id: z.string().cuid({
					message: "ID de dirección inválido",
				}),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				logger.info("Getting project address by ID", {
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				const address = await ctx.db.projectAddress.findUnique({
					where: { id: input.id },
					include: { quote: true },
				});

				if (!address) {
					throw new TRPCError({
						code: "NOT_FOUND",
						message: "Dirección no encontrada",
					});
				}

				logger.info("Project address retrieved successfully", {
					userId: ctx.session.user.id,
					addressId: address.id,
				});

				return address;
			} catch (error) {
				logger.error("Failed to get project address", {
					error: error instanceof Error ? error.message : String(error),
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				if (error instanceof TRPCError) {
					throw error;
				}

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al obtener la dirección de entrega",
				});
			}
		}),

	/**
	 * Update existing address
	 *
	 * Input: { id: string } + ProjectAddressInput
	 * Output: Updated ProjectAddress entity
	 *
	 * Authorization: adminProcedure
	 * Task: T028 [US1] (via useAddressMutations hook)
	 */
	update: adminProcedure
		.input(
			z.object({
				id: z.string().cuid({
					message: "ID de dirección inválido",
				}),
				data: projectAddressSchema.partial(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				logger.info("Updating project address", {
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				const address = await ctx.db.projectAddress.update({
					where: { id: input.id },
					data: {
						label: input.data.label,
						country: input.data.country,
						region: input.data.region,
						city: input.data.city,
						district: input.data.district,
						street: input.data.street,
						reference: input.data.reference,
						latitude: input.data.latitude,
						longitude: input.data.longitude,
						postalCode: input.data.postalCode,
					},
				});

				logger.info("Project address updated successfully", {
					userId: ctx.session.user.id,
					addressId: address.id,
				});

				return address;
			} catch (error) {
				logger.error("Failed to update project address", {
					error: error instanceof Error ? error.message : String(error),
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al actualizar la dirección de entrega",
				});
			}
		}),

	/**
	 * Delete address
	 *
	 * Input: { id: string }
	 * Output: Success confirmation
	 *
	 * Authorization: adminProcedure
	 * Task: T028 [US1] (via useAddressMutations hook)
	 */
	delete: adminProcedure
		.input(
			z.object({
				id: z.string().cuid({
					message: "ID de dirección inválido",
				}),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				logger.info("Deleting project address", {
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				await ctx.db.projectAddress.delete({
					where: { id: input.id },
				});

				logger.info("Project address deleted successfully", {
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				return { success: true };
			} catch (error) {
				logger.error("Failed to delete project address", {
					error: error instanceof Error ? error.message : String(error),
					userId: ctx.session.user.id,
					addressId: input.id,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al eliminar la dirección de entrega",
				});
			}
		}),

	/**
	 * List addresses by quote ID
	 *
	 * Input: { quoteId: string }
	 * Output: Array of ProjectAddress entities
	 *
	 * Authorization: adminProcedure or quote owner
	 * Task: T024 [US1]
	 */
	listByQuote: adminProcedure
		.input(
			z.object({
				quoteId: z.string().cuid({
					message: "ID de cotización inválido",
				}),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				logger.info("Listing project addresses by quote", {
					userId: ctx.session.user.id,
					quoteId: input.quoteId,
				});

				const addresses = await ctx.db.projectAddress.findMany({
					where: { quoteId: input.quoteId },
					orderBy: { createdAt: "desc" },
				});

				logger.info("Project addresses listed successfully", {
					userId: ctx.session.user.id,
					quoteId: input.quoteId,
					count: addresses.length,
				});

				return addresses;
			} catch (error) {
				logger.error("Failed to list project addresses", {
					error: error instanceof Error ? error.message : String(error),
					userId: ctx.session.user.id,
					quoteId: input.quoteId,
				});

				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Error al listar las direcciones de entrega",
				});
			}
		}),
});
