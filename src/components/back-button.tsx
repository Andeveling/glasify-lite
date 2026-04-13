"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export function BackButton() {
  const router = useRouter()

  return (
    <Button className="h-auto p-0" onClick={() => router.back()} size="sm" variant="link">
      ← Volver atrás
    </Button>
  )
}
