import Link from "next/link"
import { BackLink } from "@/components/ui/back-link"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container relative grid min-h-screen flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* Left side - Branding/Info */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/80 to-primary/60" />
        <div className="absolute inset-0 opacity-30">
          <svg
            aria-hidden="true"
            className="h-full w-full"
            viewBox="0 0 400 800"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern height="60" id="glass-pattern" patternUnits="userSpaceOnUse" width="60">
                <rect
                  fill="none"
                  height="60"
                  stroke="currentColor"
                  strokeOpacity="0.15"
                  strokeWidth="0.5"
                  width="60"
                />
                <rect
                  fill="none"
                  height="22"
                  rx="2"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="0.5"
                  width="22"
                  x="5"
                  y="5"
                />
                <rect
                  fill="none"
                  height="22"
                  rx="2"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="0.5"
                  width="22"
                  x="33"
                  y="5"
                />
                <rect
                  fill="none"
                  height="22"
                  rx="2"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="0.5"
                  width="22"
                  x="5"
                  y="33"
                />
                <rect
                  fill="none"
                  height="22"
                  rx="2"
                  stroke="currentColor"
                  strokeOpacity="0.1"
                  strokeWidth="0.5"
                  width="22"
                  x="33"
                  y="33"
                />
              </pattern>
            </defs>
            <rect fill="url(#glass-pattern)" height="100%" width="100%" />
          </svg>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute z-20 flex items-center font-medium text-lg">
          <Link className="flex items-center space-x-2" href="/catalog">
            <span className="font-bold text-8xl">Glasify</span>
          </Link>
        </div>
        <div className="relative z-20 mt-auto space-y-8">
          <blockquote className="space-y-2">
            <p className="font-medium text-2xl leading-relaxed">
              &ldquo;Cotización inteligente de productos de vidrio para fabricantes y
              distribuidores.&rdquo;
            </p>
            <footer className="text-sm opacity-70">Glasify Lite</footer>
          </blockquote>
          <div className="flex items-center gap-4 text-sm opacity-70">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Gestión integral de cotizaciones</title>
                <path
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.807 10.35 9 11.623 5.193-1.273 9-6.03 9-11.622zm-9-3.198a11.98 11.98 0 012.004 2.028"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Corte personalizado de vidrios</title>
                <path
                  d="M2.25 6L9 12.75l6.75-6.75M22.5 6L16 12.75l-6.75-6.75M22.5 18L16 11.25l-6.75 6.75M2.25 18l6.75-6.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10">
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Entrega rápida de productos</title>
                <path
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Forms */}
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
          {/* Mobile branding */}
          <div className="flex flex-col space-y-2 text-center lg:hidden">
            <Link className="mx-auto" href="/catalog">
              <span className="font-bold text-2xl">Glasify</span>
            </Link>
            <p className="text-muted-foreground text-sm">Cotizador inteligente de vidrios</p>
          </div>

          <div className="p-8">{children}</div>

          {/* Back to catalog link */}
          <p className="px-8 text-center text-muted-foreground text-sm">
            <BackLink href="/catalog" icon="none" variant="link">
              Volver al catálogo
            </BackLink>
          </p>
        </div>
      </div>
    </div>
  )
}
