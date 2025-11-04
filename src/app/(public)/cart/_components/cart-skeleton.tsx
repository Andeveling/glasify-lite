/**
 * Cart Skeleton Loader
 *
 * Loading skeleton for cart items.
 * Matches cart item layout (image + content).
 *
 * @module app/(public)/cart/_components/cart-skeleton
 */

import { Skeleton } from "@/components/ui/skeleton";
import { CART_ITEM_IMAGE_SIZE } from "../_constants/cart-item.constants";

interface CartSkeletonProps {
	/**
	 * Number of skeleton items to display
	 * @default 3
	 */
	count?: number;
}

/**
 * Cart item skeleton loader
 *
 * Shows loading state while cart data fetches.
 * Matches layout of actual cart items.
 */
export function CartSkeleton({ count = 3 }: CartSkeletonProps) {
	return (
		<div className="space-y-4">
			{Array.from({ length: count }).map((_, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: Skeleton items are static, index is stable
				<div key={index} className="flex gap-4 rounded-lg border p-4">
					{/* Image skeleton */}
					<Skeleton
						className="shrink-0 rounded-md"
						style={{
							width: `${CART_ITEM_IMAGE_SIZE}px`,
							height: `${CART_ITEM_IMAGE_SIZE}px`,
						}}
					/>

					{/* Content skeleton */}
					<div className="flex flex-1 flex-col gap-2">
						{/* Title */}
						<Skeleton className="h-6 w-3/4" />

						{/* Glass type */}
						<Skeleton className="h-4 w-1/2" />

						{/* Dimensions */}
						<Skeleton className="h-4 w-2/3" />

						{/* Quantity and price */}
						<div className="mt-auto flex items-center justify-between">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-6 w-24" />
						</div>
					</div>

					{/* Edit button skeleton */}
					<div className="flex items-start">
						<Skeleton className="h-9 w-20" />
					</div>
				</div>
			))}
		</div>
	);
}
