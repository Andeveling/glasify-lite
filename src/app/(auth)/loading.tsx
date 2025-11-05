/** biome-ignore-all lint/suspicious/noArrayIndexKey: Using array index as key is acceptable here because skeleton items are purely presentational and do not require stable identity. */
/** biome-ignore-all lint/style/noMagicNumbers: Magic numbers are used intentionally for animation delays and skeleton layout to match the design specification. */
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <div className="w-full max-w-md space-y-8">
        {/* Auth form container skeleton */}
        <div className="space-y-6 rounded-lg border border-border bg-card p-8 shadow-lg">
          {/* Header */}
          <div className="space-y-2 text-center">
            <div className="mx-auto h-12 w-12 animate-pulse rounded-full bg-muted" />
            <div className="mx-auto h-6 w-32 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-4 w-48 animate-pulse rounded bg-muted" />
          </div>

          {/* Form fields skeleton */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 w-20 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>

          {/* Button skeleton */}
          <div className="h-10 w-full animate-pulse rounded bg-muted" />

          {/* Footer links skeleton */}
          <div className="space-y-2 text-center">
            <div className="mx-auto h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="mx-auto h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
        </div>

        {/* Centered loading indicator overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground text-sm">
              Validando credenciales...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
