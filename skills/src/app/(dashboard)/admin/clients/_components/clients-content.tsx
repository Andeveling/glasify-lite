/**
 * Clients Content Component
 *
 * Client wrapper for Clients page that manages dialog state.
 * Separates server data fetching (page.tsx) from client interactivity.
 *
 * Responsibilities:
 * - Manage create dialog state
 * - Pass create handler to filters
 * - Render filters and list
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ClientsFilters } from './clients-filters'
import { ClientsList } from './clients-list'

type ClientsContentProps = {
  initialData: Parameters<typeof ClientsList>[0]['initialData']
  searchParams: Parameters<typeof ClientsList>[0]['searchParams']
}

export function ClientsContent({ initialData, searchParams }: ClientsContentProps) {
  const router = useRouter()
  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (createDialogOpen) {
      router.push('/admin/clients/new')
    }
  }, [createDialogOpen, router])

  const handleCreateClick = () => {
    setCreateDialogOpen(true)
  }

  return (
    <>
      {/* Filters with create button */}
      <ClientsFilters onCreateClickAction={handleCreateClick} searchParams={searchParams} />

      {/* Clients List */}
      <ClientsList initialData={initialData} searchParams={searchParams} />
    </>
  )
}
