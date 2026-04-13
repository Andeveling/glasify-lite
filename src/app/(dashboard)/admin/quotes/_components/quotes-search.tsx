/**
 * Quotes Search Component (US8 - T032)
 *
 * Submit-driven search following Next.js best practices.
 * Uses explicit form submit to update URL search params.
 *
 * Features:
 * - Searches by project name OR user name
 * - Submit on Enter or button click
 * - Clear button resets URL
 * - Spanish placeholder
 *
 * Pattern: form submit → router.replace → no useEffect loops
 */

"use client"

import { Search, X } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type QuotesSearchProps = {
  currentSearch?: string
}

export function QuotesSearch({ currentSearch = "" }: QuotesSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentSearch)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())

    if (searchValue.trim()) {
      params.set("search", searchValue.trim())
    } else {
      params.delete("search")
    }

    params.delete("page")

    const queryString = params.toString()
    const newUrl = queryString ? `?${queryString}` : "/admin/quotes"

    router.replace(newUrl)
  }

  const handleClear = () => {
    setSearchValue("")
    router.replace("/admin/quotes")
  }

  return (
    <form className="flex gap-2" onSubmit={handleSubmit}>
      <Input
        className="max-w-md"
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Buscar por proyecto o usuario..."
        type="search"
        value={searchValue}
      />
      <Button size="sm" type="submit">
        <Search className="mr-2 h-4 w-4" />
        Buscar
      </Button>
      {searchValue && (
        <Button size="sm" type="button" variant="ghost" onClick={handleClear}>
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      )}
    </form>
  )
}
