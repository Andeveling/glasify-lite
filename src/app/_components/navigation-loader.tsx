/**
 * NavigationLoader Component
 *
 * Displays an elegant loading bar at the top of the page during navigation
 * Uses Framer Motion for smooth animations
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const LOADER_DISPLAY_DURATION_MS = 800;
const MILLISECONDS_PER_SECOND = 1000;
const LOADER_DURATION_SECONDS =
  LOADER_DISPLAY_DURATION_MS / MILLISECONDS_PER_SECOND;
const SHIMMER_DURATION_SECONDS = 0.8;

// Animation timing constants
const OPACITY_TRANSITION_DURATION = 0.2;

// Progress bar animation keyframes
const PROGRESS_WIDTH_KEYFRAMES = ["0%", "70%", "90%", "100%"];
const PROGRESS_POSITION_KEYFRAMES = ["0%", "0%", "0%", "0%"];

// Shimmer animation constants
const SHIMMER_START_POSITION = "-100%";
const SHIMMER_END_POSITION = "200%";

// Framer Motion easing curve values
const EASING_START = 0.4;
const EASING_FIRST_CONTROL = 0;
const EASING_SECOND_CONTROL = 0.2;
const EASING_END = 1;

// Framer Motion animation timing points
const PROGRESS_START = 0;
const PROGRESS_QUARTER = 0.5;
const PROGRESS_THREE_QUARTERS = 0.8;
const PROGRESS_END = 1;

// Framer Motion animation constants
const EASING_CURVE = [
  EASING_START,
  EASING_FIRST_CONTROL,
  EASING_SECOND_CONTROL,
  EASING_END,
] as const;
const PROGRESS_KEYFRAMES = [
  PROGRESS_START,
  PROGRESS_QUARTER,
  PROGRESS_THREE_QUARTERS,
  PROGRESS_END,
];

export function NavigationLoader() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
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
  }, [pathname]);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed top-0 right-0 left-0 z-50 h-1 overflow-hidden bg-primary/10"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: OPACITY_TRANSITION_DURATION }}
        >
          {/* Progress bar with shimmer effect */}
          <motion.div
            animate={{
              width: PROGRESS_WIDTH_KEYFRAMES,
              x: PROGRESS_POSITION_KEYFRAMES,
            }}
            className="h-full bg-gradient-to-r from-primary via-primary/80 to-primary"
            exit={{ opacity: 0, width: "100%" }}
            initial={{ width: "0%", x: "0%" }}
            transition={{
              duration: LOADER_DURATION_SECONDS,
              ease: EASING_CURVE,
              times: PROGRESS_KEYFRAMES,
            }}
          />

          {/* Shimmer overlay effect */}
          <motion.div
            animate={{ x: SHIMMER_END_POSITION }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: SHIMMER_START_POSITION }}
            transition={{
              duration: SHIMMER_DURATION_SECONDS,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
