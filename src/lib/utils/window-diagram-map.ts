/**
 * Window Diagram Map Utility
 * 
 * Maps WindowType enum values to their corresponding SVG diagram paths.
 * Provides fallback logic for unknown types and helper functions for rendering.
 * 
 * @module WindowDiagramMap
 */

import type { WindowType, WindowDiagram } from '@/types/window.types';
import { WindowType as WT, DEFAULT_WINDOW_TYPE } from '@/types/window.types';

/**
 * Base path for window diagram SVGs (relative to /public)
 */
const DIAGRAMS_BASE_PATH = '/diagrams/windows';

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
    type: WT.FRENCH_2_PANEL,
    svgPath: `${DIAGRAMS_BASE_PATH}/french-2-panel.svg`,
    viewBox: { width: 200, height: 240 },
    aspectRatio: 200 / 240,
    altText: 'Diagrama de puerta francesa de 2 hojas',
  },
  
  [WT.FRENCH_4_PANEL]: {
    type: WT.FRENCH_4_PANEL,
    svgPath: `${DIAGRAMS_BASE_PATH}/french-4-panel.svg`,
    viewBox: { width: 400, height: 240 },
    aspectRatio: 400 / 240,
    altText: 'Diagrama de puerta francesa de 4 hojas',
  },
  
  // Sliding Windows
  [WT.SLIDING_2_PANEL]: {
    type: WT.SLIDING_2_PANEL,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-2-panel.svg`,
    viewBox: { width: 240, height: 180 },
    aspectRatio: 240 / 180,
    altText: 'Diagrama de ventana corrediza de 2 hojas',
  },
  
  [WT.SLIDING_3_PANEL]: {
    type: WT.SLIDING_3_PANEL,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-3-panel.svg`,
    viewBox: { width: 360, height: 180 },
    aspectRatio: 360 / 180,
    altText: 'Diagrama de ventana corrediza de 3 hojas',
  },
  
  [WT.SLIDING_4_PANEL]: {
    type: WT.SLIDING_4_PANEL,
    svgPath: `${DIAGRAMS_BASE_PATH}/sliding-4-panel.svg`,
    viewBox: { width: 480, height: 180 },
    aspectRatio: 480 / 180,
    altText: 'Diagrama de ventana corrediza de 4 hojas',
  },
  
  // Fixed Windows
  [WT.FIXED_SINGLE]: {
    type: WT.FIXED_SINGLE,
    svgPath: `${DIAGRAMS_BASE_PATH}/fixed-single.svg`,
    viewBox: { width: 120, height: 150 },
    aspectRatio: 120 / 150,
    altText: 'Diagrama de ventana fija',
  },
  
  [WT.PICTURE_WINDOW]: {
    type: WT.PICTURE_WINDOW,
    svgPath: `${DIAGRAMS_BASE_PATH}/picture-window.svg`,
    viewBox: { width: 300, height: 200 },
    aspectRatio: 300 / 200,
    altText: 'Diagrama de ventanal panorámico',
  },
  
  // Casement Windows
  [WT.CASEMENT_LEFT]: {
    type: WT.CASEMENT_LEFT,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-left.svg`,
    viewBox: { width: 120, height: 180 },
    aspectRatio: 120 / 180,
    altText: 'Diagrama de ventana abatible izquierda',
  },
  
  [WT.CASEMENT_RIGHT]: {
    type: WT.CASEMENT_RIGHT,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-right.svg`,
    viewBox: { width: 120, height: 180 },
    aspectRatio: 120 / 180,
    altText: 'Diagrama de ventana abatible derecha',
  },
  
  [WT.CASEMENT_DOUBLE]: {
    type: WT.CASEMENT_DOUBLE,
    svgPath: `${DIAGRAMS_BASE_PATH}/casement-double.svg`,
    viewBox: { width: 240, height: 180 },
    aspectRatio: 240 / 180,
    altText: 'Diagrama de ventana abatible doble',
  },
  
  // Awning & Hopper
  [WT.AWNING]: {
    type: WT.AWNING,
    svgPath: `${DIAGRAMS_BASE_PATH}/awning.svg`,
    viewBox: { width: 180, height: 100 },
    aspectRatio: 180 / 100,
    altText: 'Diagrama de ventana proyectante superior',
  },
  
  [WT.HOPPER]: {
    type: WT.HOPPER,
    svgPath: `${DIAGRAMS_BASE_PATH}/hopper.svg`,
    viewBox: { width: 180, height: 100 },
    aspectRatio: 180 / 100,
    altText: 'Diagrama de ventana proyectante inferior',
  },
  
  // Specialty Windows
  [WT.TILT_TURN]: {
    type: WT.TILT_TURN,
    svgPath: `${DIAGRAMS_BASE_PATH}/tilt-turn.svg`,
    viewBox: { width: 120, height: 180 },
    aspectRatio: 120 / 180,
    altText: 'Diagrama de ventana oscilobatiente',
  },
  
  [WT.BAY_WINDOW]: {
    type: WT.BAY_WINDOW,
    svgPath: `${DIAGRAMS_BASE_PATH}/bay-window.svg`,
    viewBox: { width: 360, height: 200 },
    aspectRatio: 360 / 200,
    altText: 'Diagrama de ventana bahía',
  },
  
  [WT.BOW_WINDOW]: {
    type: WT.BOW_WINDOW,
    svgPath: `${DIAGRAMS_BASE_PATH}/bow-window.svg`,
    viewBox: { width: 480, height: 200 },
    aspectRatio: 480 / 200,
    altText: 'Diagrama de ventana arco',
  },
  
  [WT.CORNER]: {
    type: WT.CORNER,
    svgPath: `${DIAGRAMS_BASE_PATH}/corner.svg`,
    viewBox: { width: 240, height: 240 },
    aspectRatio: 1,
    altText: 'Diagrama de ventana esquinera',
  },
  
  // Double/Single Hung
  [WT.DOUBLE_HUNG]: {
    type: WT.DOUBLE_HUNG,
    svgPath: `${DIAGRAMS_BASE_PATH}/double-hung.svg`,
    viewBox: { width: 120, height: 200 },
    aspectRatio: 120 / 200,
    altText: 'Diagrama de ventana guillotina doble',
  },
  
  [WT.SINGLE_HUNG]: {
    type: WT.SINGLE_HUNG,
    svgPath: `${DIAGRAMS_BASE_PATH}/single-hung.svg`,
    viewBox: { width: 120, height: 200 },
    aspectRatio: 120 / 200,
    altText: 'Diagrama de ventana guillotina simple',
  },
  
  // Other Types
  [WT.TRANSOM]: {
    type: WT.TRANSOM,
    svgPath: `${DIAGRAMS_BASE_PATH}/transom.svg`,
    viewBox: { width: 180, height: 80 },
    aspectRatio: 180 / 80,
    altText: 'Diagrama de ventana montante',
  },
  
  [WT.LOUVRE]: {
    type: WT.LOUVRE,
    svgPath: `${DIAGRAMS_BASE_PATH}/louvre.svg`,
    viewBox: { width: 120, height: 180 },
    aspectRatio: 120 / 180,
    altText: 'Diagrama de ventana celosía',
  },
  
  [WT.PIVOT]: {
    type: WT.PIVOT,
    svgPath: `${DIAGRAMS_BASE_PATH}/pivot.svg`,
    viewBox: { width: 120, height: 180 },
    aspectRatio: 120 / 180,
    altText: 'Diagrama de ventana pivotante',
  },
  
  [WT.SKYLIGHT]: {
    type: WT.SKYLIGHT,
    svgPath: `${DIAGRAMS_BASE_PATH}/skylight.svg`,
    viewBox: { width: 200, height: 120 },
    aspectRatio: 200 / 120,
    altText: 'Diagrama de tragaluz',
  },
  
  // Unknown/Default
  [WT.UNKNOWN]: {
    type: WT.UNKNOWN,
    svgPath: DEFAULT_DIAGRAM_PATH,
    viewBox: { width: 120, height: 150 },
    aspectRatio: 120 / 150,
    altText: 'Diagrama de ventana genérica',
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
  
  return WINDOW_DIAGRAM_MAP[windowType] ?? WINDOW_DIAGRAM_MAP[DEFAULT_WINDOW_TYPE]!;
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
  category: 'french' | 'sliding' | 'fixed' | 'casement' | 'projecting' | 'specialty' | 'hung' | 'other'
): WindowDiagram[] {
  const categories = {
    french: [WT.FRENCH_2_PANEL, WT.FRENCH_4_PANEL],
    sliding: [WT.SLIDING_2_PANEL, WT.SLIDING_3_PANEL, WT.SLIDING_4_PANEL],
    fixed: [WT.FIXED_SINGLE, WT.PICTURE_WINDOW],
    casement: [WT.CASEMENT_LEFT, WT.CASEMENT_RIGHT, WT.CASEMENT_DOUBLE],
    projecting: [WT.AWNING, WT.HOPPER],
    specialty: [WT.TILT_TURN, WT.BAY_WINDOW, WT.BOW_WINDOW, WT.CORNER],
    hung: [WT.DOUBLE_HUNG, WT.SINGLE_HUNG],
    other: [WT.TRANSOM, WT.LOUVRE, WT.PIVOT, WT.SKYLIGHT],
  };
  
  return categories[category].map((type) => WINDOW_DIAGRAM_MAP[type]!);
}
