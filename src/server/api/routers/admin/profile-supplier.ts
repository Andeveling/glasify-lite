/**
 * Profile Supplier tRPC Router
 *
 * Admin CRUD operations for ProfileSupplier entity
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Includes referential integrity check for deletions
 */

import type { Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import logger from "@/lib/logger";
import {
	createProfileSupplierSchema,
	deleteProfileSupplierSchema,
	getProfileSupplierByIdSchema,
	listProfileSuppliersSchema,
	updateProfileSupplierSchema,
} from "@/lib/validations/admin/profile-supplier.schema";
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc";
import { canDeleteProfileSupplier } from "@/server/services/referential-integrity.service";

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: {
	search?: string;
	materialType?: string;
	isActive?: "all" | "active" | "inactive";
}): Prisma.ProfileSupplierWhereInput {
	const where: Prisma.ProfileSupplierWhereInput = {};

	// Search by name
	if (input.search) {
		where.name = {
			contains: input.search,
			mode: "insensitive",
		};
	}

	// Filter by material type
	if (input.materialType) {
		where.materialType = input.materialType as Prisma.EnumMaterialTypeFilter;
	}

	// Filter by active status
	if (input.isActive && input.isActive !== "all") {
		where.isActive = input.isActive === "active";
	}

	return where;
}

/**
 * Helper: Build orderBy clause for list query
 */
function buildOrderByClause(
	sortBy: string,
	sortOrder: "asc" | "desc",
): Prisma.ProfileSupplierOrderByWithRelationInput {
	const orderBy: Prisma.ProfileSupplierOrderByWithRelationInput = {};

	switch (sortBy) {
		case "name":
			orderBy.name = sortOrder;
			break;
		case "materialType":
			orderBy.materialType = sortOrder;
			break;
		case "createdAt":
			orderBy.createdAt = sortOrder;
			break;
		default:
			orderBy.name = "asc"; // Default sort
	}

	return orderBy;
}

/**
 * Profile Supplier Router
 */
export const profileSupplierRouter = createTRPCRouter({
	/**
	 * Create Profile Supplier
	 * POST /api/trpc/admin/profile-supplier.create
	 *
	 * Creates a new profile supplier
	 */
	create: adminProcedure
		.input(createProfileSupplierSchema)
		.mutation(async ({ ctx, input }) => {
			// Check for duplicate name
			const existing = await ctx.db.profileSupplier.findUnique({
				where: { name: input.name },
			});

			if (existing) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Ya existe un proveedor con este nombre",
				});
			}

			const profileSupplier = await ctx.db.profileSupplier.create({
				data: input,
			});

			logger.info("Profile supplier created", {
				materialType: profileSupplier.materialType,
				supplierId: profileSupplier.id,
				supplierName: profileSupplier.name,
				userId: ctx.session.user.id,
			});

			return profileSupplier;
		}),

	/**
	 * Delete Profile Supplier
	 * DELETE /api/trpc/admin/profile-supplier.delete
	 *
	 * Deletes a profile supplier if no models are associated
	 * Uses referential integrity service to check dependencies
	 */
	delete: adminProcedure
		.input(deleteProfileSupplierSchema)
		.mutation(async ({ ctx, input }) => {
			// Check if exists
			const existing = await ctx.db.profileSupplier.findUnique({
				where: { id: input.id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Proveedor de perfiles no encontrado",
				});
			}

			// Check referential integrity
			const integrityCheck = await canDeleteProfileSupplier(input.id);

			if (!integrityCheck.canDelete) {
				throw new TRPCError({
					code: "CONFLICT",
					message: integrityCheck.message,
				});
			}

			await ctx.db.profileSupplier.delete({
				where: { id: input.id },
			});

			logger.warn("Profile supplier deleted", {
				supplierId: input.id,
				supplierName: existing.name,
				userId: ctx.session.user.id,
			});

			return { success: true };
		}),

	/**
	 * Get Profile Supplier by ID
	 * GET /api/trpc/admin/profile-supplier.getById
	 *
	 * Returns full profile supplier details with model count
	 */
	getById: adminProcedure
		.input(getProfileSupplierByIdSchema)
		.query(async ({ ctx, input }) => {
			const profileSupplier = await ctx.db.profileSupplier.findUnique({
				where: { id: input.id },
			});

			if (!profileSupplier) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Proveedor de perfiles no encontrado",
				});
			}

			logger.info("Profile supplier retrieved", {
				supplierId: input.id,
				supplierName: profileSupplier.name,
				userId: ctx.session.user.id,
			});

			return profileSupplier;
		}),
	/**
	 * List Profile Suppliers
	 * GET /api/trpc/admin/profile-supplier.list
	 *
	 * Supports pagination, search, filtering, and sorting
	 */
	list: adminProcedure
		.input(listProfileSuppliersSchema)
		.query(async ({ ctx, input }) => {
			const { page, limit, sortBy, sortOrder, ...filters } = input;

			const where = buildWhereClause(filters);
			const orderBy = buildOrderByClause(sortBy, sortOrder);

			// Get total count
			const total = await ctx.db.profileSupplier.count({ where });

			// Get paginated items
			const items = await ctx.db.profileSupplier.findMany({
				orderBy,
				skip: (page - 1) * limit,
				take: limit,
				where,
			});

			logger.info("Profile suppliers listed", {
				filters,
				limit,
				page,
				total,
				userId: ctx.session.user.id,
			});

			return {
				items,
				limit,
				page,
				total,
				totalPages: Math.ceil(total / limit),
			};
		}),

	/**
	 * Update Profile Supplier
	 * PUT /api/trpc/admin/profile-supplier.update
	 *
	 * Updates an existing profile supplier
	 */
	update: adminProcedure
		.input(updateProfileSupplierSchema)
		.mutation(async ({ ctx, input }) => {
			const { id, data } = input;

			// Check if exists
			const existing = await ctx.db.profileSupplier.findUnique({
				where: { id },
			});

			if (!existing) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Proveedor de perfiles no encontrado",
				});
			}

			// Check for duplicate name (if name is being updated)
			if (data.name && data.name !== existing.name) {
				const duplicate = await ctx.db.profileSupplier.findUnique({
					where: { name: data.name },
				});

				if (duplicate) {
					throw new TRPCError({
						code: "CONFLICT",
						message: "Ya existe un proveedor con este nombre",
					});
				}
			}

			const profileSupplier = await ctx.db.profileSupplier.update({
				data,
				where: { id },
			});

			logger.info("Profile supplier updated", {
				changes: data,
				supplierId: profileSupplier.id,
				supplierName: profileSupplier.name,
				userId: ctx.session.user.id,
			});

			return profileSupplier;
		}),
});
