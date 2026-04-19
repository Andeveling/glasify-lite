"use client"

import { Circle } from "lucide-react"
import { cn } from "@/lib/utils"

export function WaitingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center", className)}>
      <Circle className="size-4 animate-bounce [animation-delay:-150ms]" />
      <Circle className="size-4 animate-bounce [animation-delay:-300ms]" />
      <Circle className="size-4 animate-bounce [animation-delay:-450ms]" />
    </div>
  )
}
