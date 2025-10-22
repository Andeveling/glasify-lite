/**
 * NavigationLoader Component
 *
 * Displays an elegant loading bar at the top of the page during navigation
 * Uses Framer Motion for smooth animations
 */

'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const LOADER_DISPLAY_DURATION_MS = 800;
const LOADER_DURATION_SECONDS = LOADER_DISPLAY_DURATION_MS / 1000;
const SHIMMER_DURATION_SECONDS = 0.8;

// Framer Motion animation constants
const EASING_CURVE = [ 0.4, 0, 0.2, 1 ] as const; // Custom cubic-bezier for smooth acceleration
const PROGRESS_KEYFRAMES = [ 0, 0.5, 0.8, 1 ]; // Animation timing points

export function NavigationLoader() {
  const pathname = usePathname();
  const [ isNavigating, setIsNavigating ] = useState(false);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    // Check if pathname changed (navigation occurred)
    if (prevPathname.current !== pathname) {
      // Show loader on navigation
      setIsNavigating(true);

      // Hide loader after animation completes
      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, LOADER_DISPLAY_DURATION_MS);

      // Update previous pathname
      prevPathname.current = pathname;

      return () => clearTimeout(timer);
    }
  }, [ pathname ]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden bg-primary/10"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Progress bar with shimmer effect */}
          <motion.div
            animate={{
              width: [ '0%', '70%', '90%', '100%' ],
              x: [ '0%', '0%', '0%', '0%' ],
            }}
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary"
            exit={{ opacity: 0, width: '100%' }}
            initial={{ width: '0%', x: '0%' }}
            transition={{
              duration: LOADER_DURATION_SECONDS,
              ease: EASING_CURVE,
              times: PROGRESS_KEYFRAMES,
            }}
          />

          {/* Shimmer overlay effect */}
          <motion.div
            animate={{ x: '200%' }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            transition={{
              duration: SHIMMER_DURATION_SECONDS,
              ease: 'linear',
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
