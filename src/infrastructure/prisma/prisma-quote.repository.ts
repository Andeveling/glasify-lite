/**
 * PrismaQuoteRepository - Adapter (Implementación)
 *
 * Implementa QuoteRepository usando Prisma como ORM.
 */

import type { PrismaClient } from '@prisma/generated/client'
import type {
  CreateQuoteInput,
  CreateQuoteItemInput,
  PaginatedQuotes,
  QuoteListFilters,
  QuoteRepository,
} from '@/domain/quotes/repositories/quote.repository'

export class PrismaQuoteRepository implements QuoteRepository {
  private readonly prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  findById(id: string) {
    return this.prisma.quote.findUnique({
      where: { id },
    })
  }

  findByIdWithItems(id: string) {
    return this.prisma.quote.findUnique({
      where: { id },
      include: {
        items: true,
      },
    })
  }

  create(input: CreateQuoteInput) {
    return this.prisma.quote.create({
      data: {
        currency: input.currency,
        status: input.status,
        validUntil: input.validUntil,
        ...(input.userId && { userId: input.userId }),
      },
    })
  }

  updateTotal(id: string, total: number) {
    return this.prisma.quote.update({
      where: { id },
      data: { total },
    })
  }

  updateStatus(id: string, status: CreateQuoteInput['status']) {
    return this.prisma.quote.update({
      where: { id },
      data: { status },
    })
  }

  async list(filters: QuoteListFilters): Promise<PaginatedQuotes> {
    const { userId, status, cursor, limit = 20 } = filters

    const where = {
      ...(userId && { userId }),
      ...(status && { status }),
    }

    const [quotes, totalCount] = await Promise.all([
      this.prisma.quote.findMany({
        where,
        take: limit + 1,
        ...(cursor && { cursor: { id: cursor }, skip: 1 }),
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.quote.count({ where }),
    ])

    const hasNextPage = quotes.length > limit
    const items = hasNextPage ? quotes.slice(0, -1) : quotes
    const nextCursor = hasNextPage ? items.at(-1)?.id : undefined

    return {
      quotes: items,
      totalCount,
      nextCursor,
    }
  }

  count(filters: Omit<QuoteListFilters, 'cursor' | 'limit'>) {
    const { userId, status } = filters

    const where = {
      ...(userId && { userId }),
      ...(status && { status }),
    }

    return this.prisma.quote.count({ where })
  }

  createItem(input: CreateQuoteItemInput) {
    return this.prisma.quoteItem.create({
      data: {
        quoteId: input.quoteId,
        modelId: input.modelId,
        glassTypeId: input.glassTypeId,
        widthMm: input.widthMm,
        heightMm: input.heightMm,
        quantity: input.quantity,
        subtotal: input.subtotal,
        roomLocation: input.roomLocation,
        name: `Item ${input.modelId}`,
      },
    })
  }

  listItems(quoteId: string) {
    return this.prisma.quoteItem.findMany({
      where: { quoteId },
      orderBy: { createdAt: 'asc' },
    })
  }

  async deleteItem(itemId: string): Promise<void> {
    await this.prisma.quoteItem.delete({
      where: { id: itemId },
    })
  }
}
