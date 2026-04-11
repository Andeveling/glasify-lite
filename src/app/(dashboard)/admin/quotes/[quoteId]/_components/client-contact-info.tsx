/**
 * Client Contact Info Component
 *
 * Displays client contact information in quote detail view
 *
 * Features:
 * - Client name (or company fallback)
 * - Mailto link for email
 * - Tel link for phone
 * - Handles missing client gracefully
 */

'use client'

import { Building2, Mail, Phone, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClientContactInfo as ClientInfoType } from '../../_types/quote-list.types'

type ClientContactInfoProps = {
  client: ClientInfoType | null
  contactPhone?: string | null
}

export function ClientContactInfo({ client, contactPhone }: ClientContactInfoProps) {
  // Handle missing client
  if (!client) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <User className="size-4" />
            Información del Cliente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Cliente no asignado</p>
        </CardContent>
      </Card>
    )
  }

  const displayName = client.name || client.company || 'Cliente sin nombre'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="size-4" />
          Información del Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Name */}
        <div>
          <p className="font-medium text-muted-foreground text-sm">Nombre</p>
          <p className="font-semibold">{displayName}</p>
        </div>

        {/* Company */}
        {client.company && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">Empresa</p>
            <p className="font-semibold">{client.company}</p>
          </div>
        )}

        {/* Email (clickable mailto) */}
        {client.email && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">Email</p>
            <a
              className="flex items-center gap-2 text-primary hover:underline"
              href={`mailto:${client.email}`}
            >
              <Mail className="size-4" />
              {client.email}
            </a>
          </div>
        )}

        {/* Phone (from client record) */}
        {client.phone && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">Teléfono</p>
            <a
              className="flex items-center gap-2 text-primary hover:underline"
              href={`tel:${client.phone}`}
            >
              <Phone className="size-4" />
              {client.phone}
            </a>
          </div>
        )}

        {/* Contact phone from quote (separate from client phone) */}
        {contactPhone && (
          <div>
            <p className="font-medium text-muted-foreground text-sm">Teléfono de Contacto</p>
            <a
              className="flex items-center gap-2 text-primary hover:underline"
              href={`tel:${contactPhone}`}
            >
              <Phone className="size-4" />
              {contactPhone}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
