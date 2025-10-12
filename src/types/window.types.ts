/**
 * Window Types and Diagram Mappings
 * 
 * Comprehensive type definitions for window configurations and their
 * corresponding SVG diagram representations.
 * 
 * @module WindowTypes
 */

/**
 * Window type enumeration
 * 
 * Covers 20+ common window configurations used in glass/aluminum industry.
 * Each type maps to a specific SVG diagram in /public/diagrams/windows/
 * 
 * Naming convention: STYLE_PANELS_OPERATION
 * Examples:
 * - FRENCH_2_PANEL: French door with 2 panels
 * - SLIDING_3_PANEL: Sliding window with 3 panels
 * - CASEMENT_LEFT: Casement window hinged on left
 */
export enum WindowType {
  // === French Doors (Puertas Francesas) ===
  /** French door - 2 panels, both open outward */
  FRENCH_2_PANEL = 'french-2-panel',

  /** French door - 4 panels (2 per side), all open outward */
  FRENCH_4_PANEL = 'french-4-panel',

  // === Sliding Windows (Ventanas Corredizas) ===
  /** Sliding window - 2 panels, 1 fixed, 1 slides */
  SLIDING_2_PANEL = 'sliding-2-panel',

  /** Sliding window - 3 panels, 1 or 2 slide */
  SLIDING_3_PANEL = 'sliding-3-panel',

  /** Sliding window - 4 panels, 2 slide */
  SLIDING_4_PANEL = 'sliding-4-panel',

  // === Fixed Windows (Ventanas Fijas) ===
  /** Fixed single pane - no operation */
  FIXED_SINGLE = 'fixed-single',

  /** Picture window - large fixed pane */
  PICTURE_WINDOW = 'picture-window',

  // === Casement Windows (Ventanas Abatibles) ===
  /** Casement window - hinged on left, opens outward */
  CASEMENT_LEFT = 'casement-left',

  /** Casement window - hinged on right, opens outward */
  CASEMENT_RIGHT = 'casement-right',

  /** Casement window - 2 panels, both open outward */
  CASEMENT_DOUBLE = 'casement-double',

  // === Awning & Hopper (Proyectantes) ===
  /** Awning window - hinged at top, opens outward */
  AWNING = 'awning',

  /** Hopper window - hinged at bottom, opens inward */
  HOPPER = 'hopper',

  // === Specialty Windows ===
  /** Tilt & Turn - dual operation (tilt in, turn open) */
  TILT_TURN = 'tilt-turn',

  /** Bay window - 3 panels at angles */
  BAY_WINDOW = 'bay-window',

  /** Bow window - 4+ curved panels */
  BOW_WINDOW = 'bow-window',

  /** Corner window - 2 panels meeting at 90° */
  CORNER = 'corner',

  // === Double Hung & Single Hung (Guillotina) ===
  /** Double hung - both sashes slide vertically */
  DOUBLE_HUNG = 'double-hung',

  /** Single hung - only bottom sash slides */
  SINGLE_HUNG = 'single-hung',

  // === Additional Types ===
  /** Transom window - fixed panel above door */
  TRANSOM = 'transom',

  /** Louvre window - horizontal slats */
  LOUVRE = 'louvre',

  /** Pivot window - rotates on central axis */
  PIVOT = 'pivot',

  /** Skylight - roof-mounted window */
  SKYLIGHT = 'skylight',

  // === Fallback ===
  /** Unknown/custom window type - uses default diagram */
  UNKNOWN = 'unknown',
}

/**
 * Window type metadata
 * 
 * Provides human-readable labels and descriptions for each window type
 */
export interface WindowTypeMetadata {
  /** Window type enum value */
  type: WindowType;

  /** Display name in Spanish (for UI) */
  label: string;

  /** Short description */
  description: string;

  /** Common use cases */
  useCases: string[];

  /** Number of operable panels */
  operablePanels: number;

  /** Total number of panels */
  totalPanels: number;

  /** Operation mechanism */
  operation: 'sliding' | 'swinging' | 'fixed' | 'tilt' | 'pivot' | 'vertical';
}

/**
 * Window diagram configuration
 * 
 * Maps WindowType to SVG file path and rendering options
 */
export interface WindowDiagram {
  /** Window type */
  type: WindowType;

  /** Relative path to SVG file from /public */
  svgPath: string;

  /** SVG viewBox dimensions */
  viewBox: {
    width: number;
    height: number;
  };

  /** Recommended aspect ratio for rendering */
  aspectRatio: number;

  /** Alternative text for accessibility */
  altText: string;
}

/**
 * Window dimension specifications
 * 
 * Used for quote items with dimensional data
 */
export interface WindowDimensions {
  /** Width in centimeters */
  width: number;

  /** Height in centimeters */
  height: number;

  /** Computed area in square meters */
  area: number;

  /** Unit for area display */
  unit: 'm²' | 'cm²';

  /** Optional: Number of panels */
  panels?: number;

  /** Optional: Glass thickness in millimeters */
  glassThickness?: number;
}

/**
 * Window product specification
 * 
 * Complete specification for a window product in a quote
 */
export interface WindowProduct {
  /** Window type */
  type: WindowType;

  /** Dimensions */
  dimensions: WindowDimensions;

  /** Optional: Model/product name */
  modelName?: string;

  /** Optional: Manufacturer */
  manufacturer?: string;

  /** Optional: Glass type (tempered, laminated, etc.) */
  glassType?: string;

  /** Optional: Frame material (aluminum, PVC, wood) */
  frameMaterial?: string;

  /** Optional: Color/finish */
  color?: string;

  /** Optional: Additional features */
  features?: string[];
}

/**
 * Type guard to check if a string is a valid WindowType
 */
export function isWindowType(value: string): value is WindowType {
  return Object.values(WindowType).includes(value as WindowType);
}

/**
 * Default window type when type cannot be determined
 */
export const DEFAULT_WINDOW_TYPE = WindowType.FIXED_SINGLE;

/**
 * Window type categories for grouping in UI
 */
export const WINDOW_TYPE_CATEGORIES = {
  french: [ WindowType.FRENCH_2_PANEL, WindowType.FRENCH_4_PANEL ],

  sliding: [
    WindowType.SLIDING_2_PANEL,
    WindowType.SLIDING_3_PANEL,
    WindowType.SLIDING_4_PANEL,
  ],

  fixed: [ WindowType.FIXED_SINGLE, WindowType.PICTURE_WINDOW ],

  casement: [
    WindowType.CASEMENT_LEFT,
    WindowType.CASEMENT_RIGHT,
    WindowType.CASEMENT_DOUBLE,
  ],

  projecting: [ WindowType.AWNING, WindowType.HOPPER ],

  specialty: [
    WindowType.TILT_TURN,
    WindowType.BAY_WINDOW,
    WindowType.BOW_WINDOW,
    WindowType.CORNER,
  ],

  hung: [ WindowType.DOUBLE_HUNG, WindowType.SINGLE_HUNG ],

  other: [
    WindowType.TRANSOM,
    WindowType.LOUVRE,
    WindowType.PIVOT,
    WindowType.SKYLIGHT,
  ],
} as const;

/**
 * Window type display labels (Spanish)
 */
export const WINDOW_TYPE_LABELS: Record<WindowType, string> = {
  [ WindowType.FRENCH_2_PANEL ]: 'Puerta Francesa 2 Hojas',
  [ WindowType.FRENCH_4_PANEL ]: 'Puerta Francesa 4 Hojas',
  [ WindowType.SLIDING_2_PANEL ]: 'Ventana Corrediza 2 Hojas',
  [ WindowType.SLIDING_3_PANEL ]: 'Ventana Corrediza 3 Hojas',
  [ WindowType.SLIDING_4_PANEL ]: 'Ventana Corrediza 4 Hojas',
  [ WindowType.FIXED_SINGLE ]: 'Ventana Fija',
  [ WindowType.PICTURE_WINDOW ]: 'Ventanal Panorámico',
  [ WindowType.CASEMENT_LEFT ]: 'Ventana Abatible Izquierda',
  [ WindowType.CASEMENT_RIGHT ]: 'Ventana Abatible Derecha',
  [ WindowType.CASEMENT_DOUBLE ]: 'Ventana Abatible Doble',
  [ WindowType.AWNING ]: 'Ventana Proyectante Superior',
  [ WindowType.HOPPER ]: 'Ventana Proyectante Inferior',
  [ WindowType.TILT_TURN ]: 'Ventana Oscilobatiente',
  [ WindowType.BAY_WINDOW ]: 'Ventana Bahía',
  [ WindowType.BOW_WINDOW ]: 'Ventana Arco',
  [ WindowType.CORNER ]: 'Ventana Esquinera',
  [ WindowType.DOUBLE_HUNG ]: 'Ventana Guillotina Doble',
  [ WindowType.SINGLE_HUNG ]: 'Ventana Guillotina Simple',
  [ WindowType.TRANSOM ]: 'Ventana Montante',
  [ WindowType.LOUVRE ]: 'Ventana Celosía',
  [ WindowType.PIVOT ]: 'Ventana Pivotante',
  [ WindowType.SKYLIGHT ]: 'Tragaluz',
  [ WindowType.UNKNOWN ]: 'Tipo Desconocido',
};
