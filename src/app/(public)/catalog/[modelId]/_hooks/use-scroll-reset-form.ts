import { useEffect, useRef } from "react";

type UseScrollResetFormOptions = {
	/** Whether the form was just submitted (item added to cart) */
	isFormSubmitted: boolean;
	/** Callback to reset the form state */
	onReset: () => void;
	/** Success card ref to track its position */
	successCardRef: React.RefObject<HTMLDivElement | null>;
	/** Minimum scroll distance (in pixels) upward to trigger reset */
	scrollThreshold?: number;
};

/**
 * Custom hook to detect upward scroll after form submission
 *
 * Problem: When user adds item to cart, success message appears at bottom.
 * If user scrolls up without clicking any action, form appears disabled
 * (because justAddedToCart is still true), causing confusion.
 *
 * Solution: Detect when user scrolls up past the success card and
 * automatically reset the form to allow new configuration.
 *
 * UX Principles:
 * - Don't Make Me Think: Form should be ready to use when user scrolls to it
 * - Recognition Over Recall: Clear visual state (form enabled/disabled)
 * - Error Prevention: Avoid confusion by auto-resetting form state
 *
 * @param options - Configuration options
 *
 * @example
 * ```tsx
 * const successCardRef = useRef<HTMLDivElement>(null);
 *
 * useScrollResetForm({
 *   isFormSubmitted: justAddedToCart,
 *   onReset: handleConfigureAnother,
 *   successCardRef,
 * });
 * ```
 */
export function useScrollResetForm({
	isFormSubmitted,
	onReset,
	scrollThreshold = 100,
	successCardRef,
}: UseScrollResetFormOptions) {
	const lastScrollY = useRef(0);
	const hasUserInteracted = useRef(false);

	useEffect(() => {
		// Only activate scroll detection when form is submitted
		if (!isFormSubmitted) {
			hasUserInteracted.current = false;
			return;
		}

		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			const scrollDelta = lastScrollY.current - currentScrollY;

			// Check if scrolling up (positive delta means upward scroll)
			const isScrollingUp = scrollDelta > 0;

			// Get success card position
			const successCardElement = successCardRef.current;
			if (!successCardElement) return;

			const successCardTop =
				successCardElement.getBoundingClientRect().top + window.scrollY;
			const isAboveSuccessCard = currentScrollY < successCardTop - 200; // 200px buffer

			// If user scrolls up past threshold and is above success card
			if (
				isScrollingUp &&
				scrollDelta > scrollThreshold &&
				isAboveSuccessCard &&
				!hasUserInteracted.current
			) {
				// Mark that we've detected the scroll pattern
				hasUserInteracted.current = true;

				// Reset the form with a small delay for better UX
				setTimeout(() => {
					onReset();
				}, 100);
			}

			// Update last scroll position
			lastScrollY.current = currentScrollY;
		};

		// Attach scroll listener
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Cleanup
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [isFormSubmitted, onReset, scrollThreshold, successCardRef]);
}
