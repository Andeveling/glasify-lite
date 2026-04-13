/**
 * Clients tRPC Router
 *
 * Admin CRUD operations for Client entity management
 *
 * All procedures use adminProcedure (admin-only access)
 * Includes Winston logging for audit trail
 * Implements delete protection: prevents deletion if client has quotes
 */

import type { Prisma } from "@prisma/generated/client"
import { TRPCError } from "@trpc/server"
import logger from "@/lib/logger"
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"

// Validation constants
const MAX_NAME_LENGTH = 100
const MAX_EMAIL_LENGTH = 100
const MAX_PHONE_LENGTH = 20
const MAX_COMPANY_LENGTH = 100
const MAX_NOTES_LENGTH = 500
const MAX_PAGE_SIZE = 100
const DEFAULT_PAGE_SIZE = 20

// Input schemas
const clientIdSchema = z.object({
  id: z.string().cuid({ message: "ID de cliente inválido" }),
})

const clientCreateSchema = z.object({
  name: z
    .string()
    .min(1, { message: "El nombre es requerido" })
    .max(MAX_NAME_LENGTH, { message: `El nombre no puede exceder ${MAX_NAME_LENGTH} caracteres` })
    .trim(),
  email: z
    .string()
    .email({ message: "Correo electrónico inválido" })
    .max(MAX_EMAIL_LENGTH)
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(MAX_PHONE_LENGTH, { message: "El teléfono no puede exceder 20 caracteres" })
    .optional()
    .nullable(),
  company: z
    .string()
    .max(MAX_COMPANY_LENGTH, { message: "La empresa no puede exceder 100 caracteres" })
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(MAX_NOTES_LENGTH, { message: "Las notas no pueden exceder 500 caracteres" })
    .optional()
    .nullable(),
})

const clientUpdateSchema = clientCreateSchema.partial()

const clientListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
  search: z
    .string()
    .max(100, { message: "La búsqueda no puede exceder 100 caracteres" })
    .optional(),
  sortBy: z.enum(["name", "company", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
})

import { z } from "zod"

type ClientCreateInput = z.infer<typeof clientCreateSchema>
type ClientUpdateInput = z.infer<typeof clientUpdateSchema>
type ClientListInput = z.infer<typeof clientListSchema>

/**
 * Helper: Build where clause for list query
 */
function buildWhereClause(input: { search?: string }): Prisma.ClientWhereInput {
  const where: Prisma.ClientWhereInput = {}

  if (input.search) {
    const search = input.search.trim()
    if (search) {
      // SQLite Prisma does not support mode: 'insensitive', use contains directly
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ]
    }
  }

  return where
}

/**
 * Clients Router
 */
export const clientsRouter = createTRPCRouter({
  /**
   * List clients with optional filtering and pagination
   * Returns paginated clients with quote count (_count)
   */
  list: adminProcedure.input(clientListSchema).query(async ({ ctx, input }) => {
    try {
      const where = buildWhereClause(input)

      const total = await ctx.db.client.count({ where })

      const skip = (input.page - 1) * input.limit
      const totalPages = Math.ceil(total / input.limit)

      const clients = await ctx.db.client.findMany({
        where,
        include: {
          _count: {
            select: { quotes: true },
          },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip,
        take: input.limit,
      })

      logger.info("Clients list retrieved", {
        userId: ctx.session.user.id,
        count: clients.length,
        total,
        page: input.page,
        filters: input,
      })

      return {
        items: clients,
        total,
        page: input.page,
        limit: input.limit,
        totalPages,
      }
    } catch (error) {
      logger.error("Failed to list clients", {
        userId: ctx.session.user.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener la lista de clientes",
      })
    }
  }),

  /**
   * Get single client by ID with quote count
   */
  getById: adminProcedure.input(clientIdSchema).query(async ({ ctx, input }) => {
    try {
      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { quotes: true },
          },
        },
      })

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente no encontrado",
        })
      }

      logger.info("Client retrieved", {
        userId: ctx.session.user.id,
        clientId: input.id,
      })

      return client
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      logger.error("Failed to get client", {
        userId: ctx.session.user.id,
        clientId: input.id,
        error: error instanceof Error ? error.message : String(error),
      })

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener el cliente",
      })
    }
  }),

  /**
   * Create new client
   */
  create: adminProcedure.input(clientCreateSchema).mutation(async ({ ctx, input }) => {
    try {
      const client = await ctx.db.client.create({
        data: {
          name: input.name,
          email: input.email ?? null,
          phone: input.phone ?? null,
          company: input.company ?? null,
          notes: input.notes ?? null,
        },
      })

      logger.info("Client created", {
        userId: ctx.session.user.id,
        clientId: client.id,
        clientName: client.name,
      })

      return client
    } catch (error) {
      logger.error("Failed to create client", {
        userId: ctx.session.user.id,
        input,
        error: error instanceof Error ? error.message : String(error),
      })

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear el cliente",
      })
    }
  }),

  /**
   * Update existing client
   */
  update: adminProcedure
    .input(clientIdSchema.merge(clientUpdateSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input

        const existing = await ctx.db.client.findUnique({
          where: { id },
        })

        if (!existing) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Cliente no encontrado",
          })
        }

        const client = await ctx.db.client.update({
          where: { id },
          data,
        })

        logger.info("Client updated", {
          userId: ctx.session.user.id,
          clientId: id,
          changes: data,
        })

        return client
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error
        }

        logger.error("Failed to update client", {
          userId: ctx.session.user.id,
          clientId: input.id,
          error: error instanceof Error ? error.message : String(error),
        })

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar el cliente",
        })
      }
    }),

  /**
   * Delete client
   * Prevents deletion if client has associated quotes
   */
  delete: adminProcedure.input(clientIdSchema).mutation(async ({ ctx, input }) => {
    try {
      const quoteCount = await ctx.db.quote.count({
        where: { clientId: input.id },
      })

      if (quoteCount > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `No se puede eliminar. El cliente tiene ${quoteCount} cotización(es) asociada(s)`,
        })
      }

      const client = await ctx.db.client.findUnique({
        where: { id: input.id },
      })

      if (!client) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente no encontrado",
        })
      }

      await ctx.db.client.delete({
        where: { id: input.id },
      })

      logger.info("Client deleted", {
        userId: ctx.session.user.id,
        clientId: input.id,
      })

      return {
        success: true,
        message: "Cliente eliminado exitosamente",
      }
    } catch (error) {
      if (error instanceof TRPCError) {
        throw error
      }

      logger.error("Failed to delete client", {
        userId: ctx.session.user.id,
        clientId: input.id,
        error: error instanceof Error ? error.message : String(error),
      })

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al eliminar el cliente",
      })
    }
  }),
})
