/**
 * Window Diagram Map Utility
 *
 * Maps WindowType enum values to their corresponding SVG diagram paths.
 * Provides fallback logic for unknown types and helper functions for rendering.
 *
 * @module WindowDiagramMap
 */

import type { WindowDiagram, WindowType } from "@/types/window.types";
import { DEFAULT_WINDOW_TYPE, WindowType as WT } from "@/types/window.types";

/**
 * Base path for window diagram SVGs (relative to /public)
 */
const DIAGRAMS_BASE_PATH = "/diagrams/windows";

/**
 * Default diagram used when window type is unknown or not found
 */
const DEFAULT_DIAGRAM_PATH = `${DIAGRAMS_BASE_PATH}/fixed-single.svg`;

/**
 * Window diagram registry
 *
 * Maps each WindowType to its SVG file path and metadata.
 * SVG files must exist in /public/diagrams/windows/
 */
export const WINDOW_DIAGRAM_MAP: Record<WindowType, WindowDiagram> = {
  // French Doors
  [WT.FRENCH_2_PANEL]: {
    altText: "Diagrama de puerta francesa de 2 hojas",
    aspectRatio: 200 / 240,
    svgPath: `${DIAGRAMS_BASE_PATH}/french-2-panel.svg`,
    type: WT.FRENCH_2_PANEL,
    viewBox: { height: 240, width: 200 },
  },

  [WT.FRENCH_4_PANEL]: {
    altText: "Diagrama de puerta francesa de 4 hojas",
    aspectRatio: 400 / 240,
    svgPath: `${DIAGRAMS_BASE_PATH}/french-4-panel.svg`,
    type: WT.FRENCH_4_PANEL,
    viewBox: { height: 240, width: 400 },
  },

  // Sliding Windows
  [WT.SLIDING_2_PANEL]: {
    altText: "Diagrama de ventana corrediza de 2 hojas",
    aspectRatio: 240 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-2-panel.svg`,
    type: WT.SLIDING_2_PANEL,
    viewBox: { height: 180, width: 240 },
  },

  [WT.SLIDING_3_PANEL]: {
    altText: "Diagrama de ventana corrediza de 3 hojas",
    aspectRatio: 360 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-3-panel.svg`,
    type: WT.SLIDING_3_PANEL,
    viewBox: { height: 180, width: 360 },
  },

  [WT.SLIDING_4_PANEL]: {
    altText: "Diagrama de ventana corrediza de 4 hojas",
    aspectRatio: 480 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-4-panel.svg`,
    type: WT.SLIDING_4_PANEL,
    viewBox: { height: 180, width: 480 },
  },

  // Fixed Windows
  [WT.FIXED_SINGLE]: {
    altText: "Diagrama de ventana fija",
    aspectRatio: 120 / 150,
    svgPath: `${DIAGRAMS_BASE_PATH}/fixed-single.svg`,
    type: WT.FIXED_SINGLE,
    viewBox: { height: 150, width: 120 },
  },

  [WT.PICTURE_WINDOW]: {
    altText: "Diagrama de ventanal panorámico",
    aspectRatio: 300 / 200,
    svgPath: `${DIAGRAMS_BASE_PATH}/picture-window.svg`,
    type: WT.PICTURE_WINDOW,
    viewBox: { height: 200, width: 300 },
  },

  // Casement Windows
  [WT.CASEMENT_LEFT]: {
    altText: "Diagrama de ventana abatible izquierda",
    aspectRatio: 120 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-left.svg`,
    type: WT.CASEMENT_LEFT,
    viewBox: { height: 180, width: 120 },
  },

  [WT.CASEMENT_RIGHT]: {
    altText: "Diagrama de ventana abatible derecha",
    aspectRatio: 120 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-right.svg`,
    type: WT.CASEMENT_RIGHT,
    viewBox: { height: 180, width: 120 },
  },

  [WT.CASEMENT_DOUBLE]: {
    altText: "Diagrama de ventana abatible doble",
    aspectRatio: 240 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-double.svg`,
    type: WT.CASEMENT_DOUBLE,
    viewBox: { height: 180, width: 240 },
  },

  // Awning & Hopper
  [WT.AWNING]: {
    altText: "Diagrama de ventana proyectante superior",
    aspectRatio: 180 / 100,
    svgPath: `${DIAGRAMS_BASE_PATH}/awning.svg`,
    type: WT.AWNING,
    viewBox: { height: 100, width: 180 },
  },

  [WT.HOPPER]: {
    altText: "Diagrama de ventana proyectante inferior",
    aspectRatio: 180 / 100,
    svgPath: `${DIAGRAMS_BASE_PATH}/hopper.svg`,
    type: WT.HOPPER,
    viewBox: { height: 100, width: 180 },
  },

  // Specialty Windows
  [WT.TILT_TURN]: {
    altText: "Diagrama de ventana oscilobatiente",
    aspectRatio: 120 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/tilt-turn.svg`,
    type: WT.TILT_TURN,
    viewBox: { height: 180, width: 120 },
  },

  [WT.BAY_WINDOW]: {
    altText: "Diagrama de ventana bahía",
    aspectRatio: 360 / 200,
    svgPath: `${DIAGRAMS_BASE_PATH}/bay-window.svg`,
    type: WT.BAY_WINDOW,
    viewBox: { height: 200, width: 360 },
  },

  [WT.BOW_WINDOW]: {
    altText: "Diagrama de ventana arco",
    aspectRatio: 480 / 200,
    svgPath: `${DIAGRAMS_BASE_PATH}/bow-window.svg`,
    type: WT.BOW_WINDOW,
    viewBox: { height: 200, width: 480 },
  },

  [WT.CORNER]: {
    altText: "Diagrama de ventana esquinera",
    aspectRatio: 1,
    svgPath: `${DIAGRAMS_BASE_PATH}/corner.svg`,
    type: WT.CORNER,
    viewBox: { height: 240, width: 240 },
  },

  // Double/Single Hung
  [WT.DOUBLE_HUNG]: {
    altText: "Diagrama de ventana guillotina doble",
    aspectRatio: 120 / 200,
    svgPath: `${DIAGRAMS_BASE_PATH}/double-hung.svg`,
    type: WT.DOUBLE_HUNG,
    viewBox: { height: 200, width: 120 },
  },

  [WT.SINGLE_HUNG]: {
    altText: "Diagrama de ventana guillotina simple",
    aspectRatio: 120 / 200,
    svgPath: `${DIAGRAMS_BASE_PATH}/single-hung.svg`,
    type: WT.SINGLE_HUNG,
    viewBox: { height: 200, width: 120 },
  },

  // Other Types
  [WT.TRANSOM]: {
    altText: "Diagrama de ventana montante",
    aspectRatio: 180 / 80,
    svgPath: `${DIAGRAMS_BASE_PATH}/transom.svg`,
    type: WT.TRANSOM,
    viewBox: { height: 80, width: 180 },
  },

  [WT.LOUVRE]: {
    altText: "Diagrama de ventana celosía",
    aspectRatio: 120 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/louvre.svg`,
    type: WT.LOUVRE,
    viewBox: { height: 180, width: 120 },
  },

  [WT.PIVOT]: {
    altText: "Diagrama de ventana pivotante",
    aspectRatio: 120 / 180,
    svgPath: `${DIAGRAMS_BASE_PATH}/pivot.svg`,
    type: WT.PIVOT,
    viewBox: { height: 180, width: 120 },
  },

  [WT.SKYLIGHT]: {
    altText: "Diagrama de tragaluz",
    aspectRatio: 200 / 120,
    svgPath: `${DIAGRAMS_BASE_PATH}/skylight.svg`,
    type: WT.SKYLIGHT,
    viewBox: { height: 120, width: 200 },
  },

  // Unknown/Default
  [WT.UNKNOWN]: {
    altText: "Diagrama de ventana genérica",
    aspectRatio: 120 / 150,
    svgPath: DEFAULT_DIAGRAM_PATH,
    type: WT.UNKNOWN,
    viewBox: { height: 150, width: 120 },
  },
};

/**
 * Get window diagram by type
 *
 * @param type - WindowType enum value or string
 * @returns WindowDiagram configuration or default diagram if not found
 *
 * @example
 * ```typescript
 * const diagram = getWindowDiagram('sliding-2-panel');
 * console.log(diagram.svgPath); // '/diagrams/windows/sliding-2-panel.svg'
 * ```
 */
export function getWindowDiagram(type: WindowType | string): WindowDiagram {
  // Type guard: check if valid WindowType
  const windowType = Object.values(WT).includes(type as WindowType)
    ? (type as WindowType)
    : DEFAULT_WINDOW_TYPE;

  const diagram =
    WINDOW_DIAGRAM_MAP[windowType] ?? WINDOW_DIAGRAM_MAP[DEFAULT_WINDOW_TYPE];

  if (!diagram) {
    throw new Error(`Window diagram not found for type: ${windowType}`);
  }

  return diagram;
}

/**
 * Get SVG path for a window type
 *
 * Convenience function that returns just the SVG path string.
 *
 * @param type - WindowType enum value or string
 * @returns SVG file path relative to /public
 *
 * @example
 * ```typescript
 * const path = getWindowDiagramPath('casement-left');
 * // '/diagrams/windows/casement-left.svg'
 * ```
 */
export function getWindowDiagramPath(type: WindowType | string): string {
  return getWindowDiagram(type).svgPath;
}

/**
 * Get alt text for a window diagram
 *
 * @param type - WindowType enum value or string
 * @returns Accessible description in Spanish
 */
export function getWindowDiagramAltText(type: WindowType | string): string {
  return getWindowDiagram(type).altText;
}

/**
 * Check if a window diagram exists
 *
 * @param type - WindowType enum value or string
 * @returns True if diagram is defined (doesn't check if file exists)
 */
export function hasWindowDiagram(type: WindowType | string): boolean {
  return Object.values(WT).includes(type as WindowType);
}

/**
 * Get all available window diagrams
 *
 * @returns Array of all WindowDiagram configurations
 */
export function getAllWindowDiagrams(): WindowDiagram[] {
  return Object.values(WINDOW_DIAGRAM_MAP);
}

/**
 * Get diagrams by category
 *
 * @param category - Window category (french, sliding, casement, etc.)
 * @returns Array of WindowDiagram configurations for that category
 */
export function getWindowDiagramsByCategory(
  category:
    | "french"
    | "sliding"
    | "fixed"
    | "casement"
    | "projecting"
    | "specialty"
    | "hung"
    | "other"
): WindowDiagram[] {
  const categories = {
    casement: [WT.CASEMENT_LEFT, WT.CASEMENT_RIGHT, WT.CASEMENT_DOUBLE],
    fixed: [WT.FIXED_SINGLE, WT.PICTURE_WINDOW],
    french: [WT.FRENCH_2_PANEL, WT.FRENCH_4_PANEL],
    hung: [WT.DOUBLE_HUNG, WT.SINGLE_HUNG],
    other: [WT.TRANSOM, WT.LOUVRE, WT.PIVOT, WT.SKYLIGHT],
    projecting: [WT.AWNING, WT.HOPPER],
    sliding: [WT.SLIDING_2_PANEL, WT.SLIDING_3_PANEL, WT.SLIDING_4_PANEL],
    specialty: [WT.TILT_TURN, WT.BAY_WINDOW, WT.BOW_WINDOW, WT.CORNER],
  };

  return categories[category].map((type) => {
    const diagram = WINDOW_DIAGRAM_MAP[type];
    if (!diagram) {
      throw new Error(`Window diagram not found for type: ${type}`);
    }
    return diagram;
  });
}
