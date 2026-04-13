import { cn } from "@/lib/utils"

type GlasifyLogoProps = {
  className?: string
}

export function GlasifyLogo({ className }: GlasifyLogoProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex size-11 items-center justify-center rounded-2xl border border-current/15 bg-current/10 backdrop-blur-sm">
        <svg
          aria-labelledby="glasify-logo-title"
          className="size-6"
          fill="none"
          viewBox="0 0 32 32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title id="glasify-logo-title">Glasify logo</title>
          <path
            d="M6.5 7.5h7v7h-7zm12 0h7v7h-7zm-12 10h7v7h-7zm12 0h7v7h-7z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path d="M16 5v22M5 16h22" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" />
        </svg>
      </div>
      <div className="space-y-0.5">
        <p className="font-semibold text-[0.68rem] uppercase tracking-[0.2em] opacity-70">
          Workspace
        </p>
        <span className="block font-semibold text-xl tracking-tight">Glasify Lite</span>
      </div>
    </div>
  )
}
