/**
 * Public Header Skeleton - Loading State
 *
 * Skeleton loading state for public header.
 * Matches the layout of PublicHeader for smooth loading experience.
 *
 * @component Client Component
 */

import { Skeleton } from "@/components/ui/skeleton";

export function PublicHeaderSkeleton() {
	return (
		<header className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto max-w-7xl">
				<div className="flex h-16 items-center justify-between px-4 md:px-6">
					{/* Logo + Navigation Skeleton */}
					<div className="flex items-center gap-8">
						{/* Logo */}
						<Skeleton className="h-6 w-24" />

						{/* Navigation Items (Desktop only) */}
						<div className="hidden gap-4 md:flex">
							<Skeleton className="h-5 w-20" />
							<Skeleton className="h-5 w-24" />
							<Skeleton className="h-5 w-28" />
						</div>
					</div>

					{/* Actions Skeleton: Cart + User Menu */}
					<div className="flex items-center gap-3">
						{/* Cart Indicator */}
						<Skeleton className="h-9 w-9 rounded-full" />

						{/* User Menu */}
						<Skeleton className="h-9 w-9 rounded-full" />
					</div>
				</div>
			</div>
		</header>
	);
}
