import { useEffect, useRef } from "react";

// Small delay to ensure DOM is fully updated before scrolling
const SCROLL_DELAY_MS = 100;

/**
 * Hook para scrollear suavemente a un elemento cuando una condición se cumple
 *
 * @param shouldScroll - Condición que activa el scroll
 * @param options - Opciones de scroll behavior
 * @returns ref que debe asignarse al elemento target
 *
 * @example
 * const successRef = useScrollIntoView(justAddedToCart);
 * return <div ref={successRef}>Success!</div>
 */
export function useScrollIntoView<T extends HTMLElement = HTMLDivElement>(
  shouldScroll: boolean,
  options: ScrollIntoViewOptions = {
    behavior: "smooth",
    block: "start",
    inline: "nearest",
  }
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (shouldScroll && ref.current) {
      // Small delay to ensure DOM is fully updated
      const timeoutId = setTimeout(() => {
        ref.current?.scrollIntoView(options);
      }, SCROLL_DELAY_MS);

      return () => clearTimeout(timeoutId);
    }
  }, [shouldScroll, options]);

  return ref;
}
