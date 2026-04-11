/**
 * Clients Table Component
 *
 * Atomic component: Pure presentation of clients in a table format.
 * - No business logic
 * - Single Responsibility: Display tabular data
 * - Receives data as props
 * - Handles edit/delete actions via callbacks
 */

'use client'

import { FileText, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type ClientWithQuoteCount = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    quotes: number
  }
}

type ClientsTableProps = {
  clients: ClientWithQuoteCount[]
  onEditAction: (id: string) => void
  onDeleteAction: (client: { id: string; name: string }) => void
  onQuoteAction: (id: string) => void
}

const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 3_600_000
const MS_PER_DAY = 86_400_000
const MINUTES_PER_HOUR = 60
const HOURS_PER_DAY = 24
const MAX_DAYS_FOR_RELATIVE_TIME = 30

function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / MS_PER_MINUTE)
  const diffHours = Math.floor(diffMs / MS_PER_HOUR)
  const diffDays = Math.floor(diffMs / MS_PER_DAY)

  if (diffMins < 1) {
    return 'hace un momento'
  }
  if (diffMins < MINUTES_PER_HOUR) {
    return `hace ${diffMins} min`
  }
  if (diffHours < HOURS_PER_DAY) {
    return `hace ${diffHours}h`
  }
  if (diffDays < MAX_DAYS_FOR_RELATIVE_TIME) {
    return `hace ${diffDays}d`
  }
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ClientsTable({
  clients,
  onEditAction,
  onDeleteAction,
  onQuoteAction,
}: ClientsTableProps) {
  if (clients.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="font-medium text-muted-foreground">No se encontraron clientes</p>
          <p className="mt-2 text-muted-foreground text-sm">Crea tu primer cliente para comenzar</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Empresa</TableHead>
            <TableHead>Correo</TableHead>
            <TableHead>Teléfono</TableHead>
            <TableHead>Cotizaciones</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead className="w-[100px] text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell className="font-medium">{client.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {client.company ?? '—'}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">{client.email ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">{client.phone ?? '—'}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {client._count.quotes}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelativeTime(client.updatedAt)}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => onQuoteAction(client.id)}
                    size="sm"
                    title="Nueva Cotización"
                    variant="ghost"
                  >
                    <FileText className="h-4 w-4" />
                    <span className="sr-only">Nueva Cotización para {client.name}</span>
                  </Button>
                  <Button onClick={() => onEditAction(client.id)} size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Editar {client.name}</span>
                  </Button>
                  <Button
                    onClick={() => onDeleteAction({ id: client.id, name: client.name })}
                    size="sm"
                    variant="ghost"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Eliminar {client.name}</span>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
