/**
 * Clients Empty State Component
 *
 * Displays when no clients are found matching the filters.
 */

'use client'

import { Users } from 'lucide-react'
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty'

type ClientsEmptyProps = {
  searchTerm?: string
}

export function ClientsEmpty({ searchTerm }: ClientsEmptyProps) {
  const hasSearch = Boolean(searchTerm?.trim())

  return (
    <Empty className="border-0 bg-transparent">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Users className="h-6 w-6 text-muted-foreground" />
        </EmptyMedia>
        <div>
          <EmptyTitle>{hasSearch ? 'Sin resultados' : 'Sin clientes'}</EmptyTitle>
          <EmptyDescription>
            {hasSearch
              ? 'No hay clientes que coincidan con la búsqueda. Intenta con otros términos.'
              : 'Aún no hay clientes registrados. Crea uno para comenzar.'}
          </EmptyDescription>
        </div>
      </EmptyHeader>
    </Empty>
  )
}
