import { useEffect, useState } from "react";

/**
 * Custom hook for responsive media queries
 * @param query - Media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);

		// Set initial value
		setMatches(media.matches);

		// Create listener for changes
		const listener = (event: MediaQueryListEvent) => {
			setMatches(event.matches);
		};

		// Add listener
		media.addEventListener("change", listener);

		// Cleanup
		return () => {
			media.removeEventListener("change", listener);
		};
	}, [query]);

	return matches;
}
