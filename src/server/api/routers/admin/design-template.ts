/**
 * DesignTemplate tRPC Router
 *
 * Admin CRUD operations for DesignTemplate management.
 * DesignTemplates define window panel patterns (XX, XO, OX, XXO, etc.)
 * used by the DesignRenderer to generate SVG visualizations.
 * Now unified to support both window and door types.
 */

import type { Prisma } from "@prisma/generated/client"
import { TRPCError } from "@trpc/server"
import logger from "@/lib/logger"
import {
  designTemplateCreateSchema,
  designTemplateIdSchema,
  designTemplateListSchema,
  designTemplateUpdateSchema,
} from "@/lib/validations/design-template"
import { adminProcedure, createTRPCRouter } from "@/server/api/trpc"

function buildWhereClause(input: {
  search?: string
  type?: string
}): Prisma.DesignTemplateWhereInput {
  const where: Prisma.DesignTemplateWhereInput = {}
  if (input.search) {
    where.OR = [{ name: { contains: input.search } }, { pattern: { contains: input.search } }]
  }
  if (input.type) {
    where.type = input.type
  }
  return where
}

export const designTemplateRouter = createTRPCRouter({
  list: adminProcedure.input(designTemplateListSchema).query(async ({ ctx, input }) => {
    try {
      const where = buildWhereClause(input)
      const total = await ctx.db.designTemplate.count({ where })
      const skip = (input.page - 1) * input.limit
      const totalPages = Math.ceil(total / input.limit)

      const items = await ctx.db.designTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          type: true,
          pattern: true,
          frameConfig: true,
          createdAt: true,
          updatedAt: true,
          _count: { select: { models: true } },
        },
        orderBy: { [input.sortBy]: input.sortOrder },
        skip,
        take: input.limit,
      })

      logger.info("Design templates list retrieved", {
        userId: ctx.session?.user.id,
        count: items.length,
        total,
      })

      return { items, total, page: input.page, limit: input.limit, totalPages }
    } catch (error) {
      logger.error("Failed to list design templates", {
        userId: ctx.session?.user.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener las plantillas de diseño",
      })
    }
  }),

  getById: adminProcedure.input(designTemplateIdSchema).query(async ({ ctx, input }) => {
    try {
      const template = await ctx.db.designTemplate.findUnique({
        where: { id: input.id },
        include: { _count: { select: { models: true } } },
      })

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plantilla de diseño no encontrada" })
      }

      return template
    } catch (error) {
      if (error instanceof TRPCError) throw error
      logger.error("Failed to get design template", {
        userId: ctx.session?.user.id,
        templateId: input.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener la plantilla de diseño",
      })
    }
  }),

  listAll: adminProcedure.query(async ({ ctx }) => {
    try {
      const items = await ctx.db.designTemplate.findMany({
        orderBy: { name: "asc" },
        select: { id: true, name: true, type: true, pattern: true },
      })
      return items
    } catch (error) {
      logger.error("Failed to list all design templates", {
        userId: ctx.session?.user.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al obtener las plantillas",
      })
    }
  }),

  create: adminProcedure.input(designTemplateCreateSchema).mutation(async ({ ctx, input }) => {
    try {
      const existing = await ctx.db.designTemplate.findUnique({
        where: { name: input.name },
      })

      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una plantilla con este nombre",
        })
      }

      const template = await ctx.db.designTemplate.create({
        data: {
          name: input.name,
          type: input.type,
          frameConfig: JSON.stringify(input.frameConfig),
          // Window-specific fields
          ...(input.type === "window" && {
            pattern: input.pattern,
            showArrows: input.showArrows,
            showHandles: input.showHandles,
          }),
          // Door-specific fields
          ...(input.type === "door" && {
            openingType: input.openingType,
            traverseCount: input.traverseCount,
            traverseStyle: input.traverseStyle,
            frameColor: input.frameColor,
            glassColor: input.glassColor,
            handleStyle: input.handleStyle,
            showLock: input.showLock,
          }),
        },
      })

      logger.info("Design template created", {
        userId: ctx.session?.user.id,
        templateId: template.id,
        name: template.name,
        type: template.type,
      })

      return template
    } catch (error) {
      if (error instanceof TRPCError) throw error
      if (
        error instanceof Error &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
      ) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Ya existe una plantilla con este nombre",
        })
      }
      logger.error("Failed to create design template", {
        userId: ctx.session?.user.id,
        input,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al crear la plantilla de diseño",
      })
    }
  }),

  update: adminProcedure
    .input(designTemplateIdSchema.merge(designTemplateUpdateSchema))
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...data } = input
        const existing = await ctx.db.designTemplate.findUnique({ where: { id } })
        if (!existing) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Plantilla de diseño no encontrada" })
        }

        if (data.name && data.name !== existing.name) {
          const duplicate = await ctx.db.designTemplate.findUnique({
            where: { name: data.name },
          })
          if (duplicate) {
            throw new TRPCError({
              code: "CONFLICT",
              message: "Ya existe una plantilla con este nombre",
            })
          }
        }

        const frameConfig = data.frameConfig
          ? JSON.stringify(data.frameConfig)
          : existing.frameConfig

        // Base fields
        const updateData: Prisma.DesignTemplateUpdateInput = {
          name: data.name ?? existing.name,
          frameConfig,
        }

        // Type-specific fields with existing as fallback
        if (data.type === "window" || (!data.type && existing.type === "window")) {
          const isWindow = data.type === "window"
          updateData.type = existing.type
          updateData.pattern = isWindow ? (data.pattern ?? existing.pattern) : null
          updateData.showArrows = isWindow ? (data.showArrows ?? existing.showArrows) : null
          updateData.showHandles = isWindow ? (data.showHandles ?? existing.showHandles) : null
          updateData.openingType = null
          updateData.traverseCount = null
          updateData.traverseStyle = null
          updateData.frameColor = null
          updateData.glassColor = null
          updateData.handleStyle = null
          updateData.showLock = null
        } else if (data.type === "door" || (!data.type && existing.type === "door")) {
          const isDoor = data.type === "door"
          updateData.type = existing.type
          updateData.openingType = isDoor ? (data.openingType ?? existing.openingType) : null
          updateData.traverseCount = isDoor ? (data.traverseCount ?? existing.traverseCount) : null
          updateData.traverseStyle = isDoor ? (data.traverseStyle ?? existing.traverseStyle) : null
          updateData.frameColor = isDoor ? (data.frameColor ?? existing.frameColor) : null
          updateData.glassColor = isDoor ? (data.glassColor ?? existing.glassColor) : null
          updateData.handleStyle = isDoor ? (data.handleStyle ?? existing.handleStyle) : null
          updateData.showLock = isDoor ? (data.showLock ?? existing.showLock) : null
          updateData.pattern = null
          updateData.showArrows = null
          updateData.showHandles = null
        }

        const template = await ctx.db.designTemplate.update({
          where: { id },
          data: updateData,
        })

        logger.info("Design template updated", {
          userId: ctx.session?.user.id,
          templateId: id,
        })

        return template
      } catch (error) {
        if (error instanceof TRPCError) throw error
        logger.error("Failed to update design template", {
          userId: ctx.session?.user.id,
          templateId: input.id,
          error: error instanceof Error ? error.message : String(error),
        })
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error al actualizar la plantilla de diseño",
        })
      }
    }),

  delete: adminProcedure.input(designTemplateIdSchema).mutation(async ({ ctx, input }) => {
    try {
      const template = await ctx.db.designTemplate.findUnique({
        where: { id: input.id },
        include: { _count: { select: { models: true } } },
      })

      if (!template) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Plantilla de diseño no encontrada" })
      }

      if (template._count.models > 0) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: `No se puede eliminar. Plantilla usada en ${template._count.models} modelo(s)`,
        })
      }

      await ctx.db.designTemplate.delete({ where: { id: input.id } })

      logger.info("Design template deleted", {
        userId: ctx.session?.user.id,
        templateId: input.id,
      })

      return { success: true, message: "Plantilla eliminada exitosamente" }
    } catch (error) {
      if (error instanceof TRPCError) throw error
      logger.error("Failed to delete design template", {
        userId: ctx.session?.user.id,
        templateId: input.id,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Error al eliminar la plantilla de diseño",
      })
    }
  }),
})
