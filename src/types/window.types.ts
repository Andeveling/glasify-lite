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
 * Defines all supported window types for the catalog system.
 * Each type corresponds to a specific window configuration and diagram.
 *
 * - FRENCH_2_PANEL: French door - 2 panels, both open outward
 * - FRENCH_4_PANEL: French door - 4 panels (2 per side), all open outward
 * - SLIDING_2_PANEL: Sliding window - 2 panels, 1 fixed, 1 slides
 * - SLIDING_3_PANEL: Sliding window - 3 panels, 1 or 2 slide
 * - SLIDING_4_PANEL: Sliding window - 4 panels, 2 slide
 * - FIXED_SINGLE: Fixed single pane - no operation
 * - PICTURE_WINDOW: Picture window - large fixed pane
 * - CASEMENT_LEFT: Casement window hinged on left, opens outward
 * - CASEMENT_RIGHT: Casement window hinged on right, opens outward
 * - CASEMENT_DOUBLE: Casement window - 2 panels, both open outward
 * - AWNING: Awning window - hinged at top, opens outward
 * - HOPPER: Hopper window - hinged at bottom, opens inward
 * - TILT_TURN: Tilt & Turn - dual operation (tilt in, turn open)
 * - BAY_WINDOW: Bay window - 3 panels at angles
 * - BOW_WINDOW: Bow window - 4+ curved panels
 * - CORNER: Corner window - 2 panels meeting at 90°
 * - DOUBLE_HUNG: Double hung - both sashes slide vertically
 * - SINGLE_HUNG: Single hung - only bottom sash slides
 * - TRANSOM: Transom window - fixed panel above door
 * - LOUVRE: Louvre window - horizontal slats
 * - PIVOT: Pivot window - rotates on central axis
 * - SKYLIGHT: Skylight - roof-mounted window
 * - UNKNOWN: Unknown/custom window type - uses default diagram
 */
export type WindowType =
  | 'french-2-panel'
  | 'french-4-panel'
  | 'sliding-2-panel'
  | 'sliding-3-panel'
  | 'sliding-4-panel'
  | 'fixed-single'
  | 'picture-window'
  | 'casement-left'
  | 'casement-right'
  | 'casement-double'
  | 'awning'
  | 'hopper'
  | 'tilt-turn'
  | 'bay-window'
  | 'bow-window'
  | 'corner'
  | 'double-hung'
  | 'single-hung'
  | 'transom'
  | 'louvre'
  | 'pivot'
  | 'skylight'
  | 'unknown';

/**
 * Window type constants
 *
 * Provides enum-like access to window type values
 */
export const WindowType = {
  // === Awning & Hopper (Proyectantes) ===
  AWNING: 'awning' as const,
  BAY_WINDOW: 'bay-window' as const,
  BOW_WINDOW: 'bow-window' as const,
  CASEMENT_DOUBLE: 'casement-double' as const,

  // === Casement Windows (Ventanas Abatibles) ===
  CASEMENT_LEFT: 'casement-left' as const,
  CASEMENT_RIGHT: 'casement-right' as const,
  CORNER: 'corner' as const,

  // === Double Hung & Single Hung (Guillotina) ===
  DOUBLE_HUNG: 'double-hung' as const,

  // === Fixed Windows (Ventanas Fijas) ===
  FIXED_SINGLE: 'fixed-single' as const,
  // === French Doors (Puertas Francesas) ===
  FRENCH_2_PANEL: 'french-2-panel' as const,
  FRENCH_4_PANEL: 'french-4-panel' as const,
  HOPPER: 'hopper' as const,
  LOUVRE: 'louvre' as const,
  PICTURE_WINDOW: 'picture-window' as const,
  PIVOT: 'pivot' as const,
  SINGLE_HUNG: 'single-hung' as const,
  SKYLIGHT: 'skylight' as const,

  // === Sliding Windows (Ventanas Corredizas) ===
  SLIDING_2_PANEL: 'sliding-2-panel' as const,
  SLIDING_3_PANEL: 'sliding-3-panel' as const,
  SLIDING_4_PANEL: 'sliding-4-panel' as const,

  // === Specialty Windows ===
  TILT_TURN: 'tilt-turn' as const,

  // === Additional Types ===
  TRANSOM: 'transom' as const,

  // === Fallback ===
  UNKNOWN: 'unknown' as const,
} as const;

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
  casement: [ WindowType.CASEMENT_LEFT, WindowType.CASEMENT_RIGHT, WindowType.CASEMENT_DOUBLE ],

  fixed: [ WindowType.FIXED_SINGLE, WindowType.PICTURE_WINDOW ],
  french: [ WindowType.FRENCH_2_PANEL, WindowType.FRENCH_4_PANEL ],

  hung: [ WindowType.DOUBLE_HUNG, WindowType.SINGLE_HUNG ],

  other: [ WindowType.TRANSOM, WindowType.LOUVRE, WindowType.PIVOT, WindowType.SKYLIGHT ],

  projecting: [ WindowType.AWNING, WindowType.HOPPER ],

  sliding: [ WindowType.SLIDING_2_PANEL, WindowType.SLIDING_3_PANEL, WindowType.SLIDING_4_PANEL ],

  specialty: [ WindowType.TILT_TURN, WindowType.BAY_WINDOW, WindowType.BOW_WINDOW, WindowType.CORNER ],
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
