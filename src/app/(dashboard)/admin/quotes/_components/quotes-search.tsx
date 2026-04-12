/**
 * Quotes Search Component (US8 - T032)
 *
 * Client Component for searching quotes with debounced URL updates.
 * Follows Next.js best practices for URL state management.
 *
 * Features:
 * - Searches by project name OR user name
 * - 300ms debounce to reduce server load
 * - URL state driven - search value syncs to URL
 * - Clear button
 * - Spanish placeholder
 *
 * Pattern: useCallback for createQueryString, useEffect for debounce,
 * but NOT putting searchParams in useEffect deps to avoid infinite loop
 */

'use client'

import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type QuotesSearchProps = {
  currentSearch?: string
}

const SEARCH_DEBOUNCE_MS = 300

export function QuotesSearch({ currentSearch = '' }: QuotesSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)
  const isFirstRender = useRef(true)

  // Sync local state from URL only on mount
  // biome-ignore lint: intentionally skipping searchValue dep - we only want mount behavior
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      if (!searchValue && searchParams.get('search')) {
        setSearchValue(searchParams.get('search') ?? '')
      }
    }
  }, [searchParams])

  // Create query string function - stable reference via useCallback
  const createQueryString = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set('search', value)
      } else {
        params.delete('search')
      }
      params.delete('page') // Reset to page 1 when search changes
      return params.toString()
    },
    [searchParams],
  )

  // Debounced URL update - only depends on searchValue, NOT searchParams
  // This breaks the infinite loop: searchParams change → re-render → effect doesn't re-run
  useEffect(() => {
    if (isFirstRender.current) return

    const timer = setTimeout(() => {
      const queryString = createQueryString(searchValue)
      router.push(`?${queryString}`)
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [searchValue, router, createQueryString])

  const handleClear = () => {
    setSearchValue('')
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
      <Input
        className="pr-8 pl-8"
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar por proyecto o usuario..."
        type="search"
        value={searchValue}
      />
      {searchValue && (
        <Button
          className="absolute top-0 right-0 size-9"
          onClick={handleClear}
          size="icon"
          variant="ghost"
        >
          <X className="size-4" />
        </Button>
      )}
    </div>
  )
}
