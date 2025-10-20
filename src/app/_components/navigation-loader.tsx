/**
 * NavigationLoader Component
 *
 * Displays a loading indicator at the top of the page during navigation
 * Uses Next.js usePathname to detect route changes
 */

'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const LOADER_DISPLAY_DURATION_MS = 300;

export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Check if pathname changed (navigation occurred)
    if (prevPathname.current !== pathname) {
      // Show loader on navigation
      setIsNavigating(true);

      // Hide loader after a short delay to show visual feedback
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, LOADER_DISPLAY_DURATION_MS);

      // Update previous pathname
      prevPathname.current = pathname;

      return () => clearTimeout(timer);
    }
  });

  if (!isNavigating) return null;

  return (
    <div className="fixed top-0 right-0 left-0 z-50 h-1 animate-pulse bg-gradient-to-r from-primary via-primary/50 to-primary">
      <div className="h-full w-full animate-shimmer bg-primary" />
    </div>
  );
}
