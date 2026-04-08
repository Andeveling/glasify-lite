/**
 * GetQuoteByIdUseCase - Use Case
 *
 * Orquesta la obtención de una cotización por ID:
 * 1. Validar permisos (owner o admin)
 * 2. Obtener quote con items y relaciones
 * 3. Transformar a formato de presentación
 *
 * Este use-case NO depende de Prisma directamente.
 * Usa repositories (ports) para acceso a datos.
 */

import type { Quote, QuoteItem, QuoteStatus, User } from '@prisma/generated/client'

/**
 * Input para obtener una quote por ID
 */
export type GetQuoteByIdInput = {
  quoteId: string
  userId: string
  userRole: 'admin' | 'seller' | 'user'
}

/**
 * Quote Item detallado para la respuesta
 */
export type QuoteItemDetail = {
  id: string
  name: string
  modelName: string
  modelImageUrl: string | null
  glassTypeName: string
  widthMm: number
  heightMm: number
  quantity: number
  unitPrice: number
  subtotal: number
  serviceNames: string[]
  solutionName?: string
}

/**
 * Output del use-case
 */
export type GetQuoteByIdOutput = {
  id: string
  status: QuoteStatus
  currency: string
  total: number
  createdAt: Date
  sentAt: Date | null
  validUntil: Date | null
  isExpired: boolean
  contactPhone: string | null
  manufacturerName: string
  vendorContactPhone: string | null
  projectName: string
  projectAddress: {
    projectName: string
    projectStreet: string
    projectCity: string
    projectState: string
    projectPostalCode?: string
  }
  itemCount: number
  totalUnits: number
  items: QuoteItemDetail[]
  user: {
    id: string
    name: string | null
    email: string | null
    role: 'admin' | 'seller' | 'user'
  } | null
  userEmail?: string
}

/**
 * Quote con items expandidos (del repositorio)
 */
type QuoteWithItems = Quote & {
  items: Array<
    QuoteItem & {
      glassType: { id: string; name: string }
      model: { id: string; name: string; imageUrl: string | null }
      services: Array<{
        service: { id: string; name: string }
      }>
    }
  >
  user: Pick<User, 'id' | 'name' | 'email' | 'role'> | null
}

/**
 * Dependencies (ports) que necesita el use-case
 */
export type GetQuoteByIdDeps = {
  // Repository
  findQuoteWithDetails: (id: string) => Promise<QuoteWithItems | null>

  // Tenant config
  getTenantBusinessName: () => Promise<string>
  getTenantContactPhone: () => Promise<string | null>
}

/**
 * Error para autorización
 */
export class AuthorizationError extends Error {
  code: 'NOT_FOUND' | 'FORBIDDEN'

  constructor(message: string, code: 'NOT_FOUND' | 'FORBIDDEN') {
    super(message)
    this.name = 'AuthorizationError'
    this.code = code
  }
}

/**
 * GetQuoteByIdUseCase
 *
 * Esta función NO tiene efectos secundarios directos.
 * Todas las operaciones de I/O se pasan como dependencies.
 */
export async function getQuoteByIdUseCase(
  input: GetQuoteByIdInput,
  deps: GetQuoteByIdDeps,
): Promise<GetQuoteByIdOutput> {
  // 1. Fetch quote con detalles
  const quote = await deps.findQuoteWithDetails(input.quoteId)

  if (!quote) {
    throw new AuthorizationError('Cotización no encontrada', 'NOT_FOUND')
  }

  // 2. Validar permisos (ownership check)
  const isOwner = quote.userId === input.userId
  const isAdmin = input.userRole === 'admin'

  if (!(isOwner || isAdmin)) {
    throw new AuthorizationError('No tienes permiso para acceder a esta cotización', 'FORBIDDEN')
  }

  // 3. Obtener datos del tenant
  const [businessName, contactPhone] = await Promise.all([
    deps.getTenantBusinessName(),
    deps.getTenantContactPhone(),
  ])

  // 4. Transformar items
  const items: QuoteItemDetail[] = quote.items.map((item) => ({
    id: item.id,
    name: item.name,
    modelName: item.model.name,
    modelImageUrl: item.model.imageUrl,
    glassTypeName: item.glassType.name,
    widthMm: item.widthMm,
    heightMm: item.heightMm,
    quantity: item.quantity,
    unitPrice: Number(item.subtotal) / item.quantity,
    subtotal: Number(item.subtotal),
    serviceNames: item.services.map((s) => s.service.name),
    solutionName: undefined, // TODO: Add solution support
  }))

  // 5. Calcular totales
  const totalUnits = quote.items.reduce((sum, item) => sum + item.quantity, 0)
  const isExpired = quote.validUntil ? quote.validUntil < new Date() : false

  // 6. Construir respuesta
  return {
    id: quote.id,
    status: quote.status,
    currency: quote.currency,
    total: Number(quote.total),
    createdAt: quote.createdAt,
    sentAt: quote.sentAt,
    validUntil: quote.validUntil,
    isExpired,
    contactPhone: quote.contactPhone,
    manufacturerName: businessName,
    vendorContactPhone: contactPhone,
    projectName: quote.projectName ?? 'Sin nombre',
    projectAddress: {
      projectName: quote.projectName ?? 'Sin nombre',
      projectStreet: quote.projectStreet ?? '',
      projectCity: quote.projectCity ?? '',
      projectState: quote.projectState ?? '',
      projectPostalCode: quote.projectPostalCode ?? undefined,
    },
    itemCount: quote.items.length,
    totalUnits,
    items,
    user: quote.user
      ? {
          id: quote.user.id,
          name: quote.user.name,
          email: quote.user.email,
          role: quote.user.role as 'admin' | 'seller' | 'user',
        }
      : null,
    userEmail: undefined,
  }
}
