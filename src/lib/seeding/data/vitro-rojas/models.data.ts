/**
 * Vitro Rojas - Models Data
 *
 * Modelos de ventanas y puertas disponibles en catálogo de Vitro Rojas.
 * Incluye modelos de diferentes proveedores de perfiles.
 *
 * Nota: profileSupplierId y compatibleGlassTypeIds se resolverán dinámicamente
 *
 * Campos numéricos (almacenados como text en DB):
 * - minWidthMm, maxWidthMm, minHeightMm, maxHeightMm
 * - glassDiscountWidthMm, glassDiscountHeightMm
 *
 * Campos decimales (almacenados como decimal/string en DB):
 * - basePrice, costPerMmWidth, costPerMmHeight
 * - accessoryPrice, profitMarginPercentage
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

export const vitroRojasModels = [
  // Sliding Windows - Most popular category
  {
    profileSupplierId: null, // Will be resolved to "Aluminios Panamá" in preset
    name: "Ventana Corrediza 2 Hojas",
    imageUrl: "/models/sliding-window-2h.jpg",
    status: "published" as const,
    minWidthMm: "600",
    maxWidthMm: "2000",
    minHeightMm: "600",
    maxHeightMm: "1500",
    basePrice: "150.00",
    costPerMmWidth: "0.08",
    costPerMmHeight: "0.06",
    accessoryPrice: "25.00",
    glassDiscountWidthMm: "50",
    glassDiscountHeightMm: "50",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "35.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Incluye herrajes estándar y juntas de goma",
  },
  {
    profileSupplierId: null,
    name: "Ventana Corrediza 3 Hojas - Aluminio",
    imageUrl: "/models/ventana-corrediza-3h.jpg",
    status: "published" as const,
    minWidthMm: "900",
    maxWidthMm: "3000",
    minHeightMm: "600",
    maxHeightMm: "1500",
    basePrice: "220.00",
    costPerMmWidth: "0.10",
    costPerMmHeight: "0.07",
    accessoryPrice: "35.00",
    glassDiscountWidthMm: "50",
    glassDiscountHeightMm: "50",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "35.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Incluye herrajes reforzados para 3 hojas",
  },

  // Ventanas Proyectantes - Perfiles del Istmo
  {
    profileSupplierId: null,
    name: "Ventana Proyectante 1 Hoja - Premium",
    imageUrl: "/models/ventana-proyectante-1h.jpg",
    status: "published" as const,
    minWidthMm: "400",
    maxWidthMm: "1200",
    minHeightMm: "400",
    maxHeightMm: "1200",
    basePrice: "180.00",
    costPerMmWidth: "0.09",
    costPerMmHeight: "0.08",
    accessoryPrice: "30.00",
    glassDiscountWidthMm: "40",
    glassDiscountHeightMm: "40",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "40.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Sistema europeo con bisagras ocultas",
  },

  // Ventanas Fijas - Alumicorp
  {
    profileSupplierId: null,
    name: "Ventana Fija - Económica",
    imageUrl: "/models/ventana-fija.jpg",
    status: "published" as const,
    minWidthMm: "300",
    maxWidthMm: "2500",
    minHeightMm: "300",
    maxHeightMm: "2000",
    basePrice: "80.00",
    costPerMmWidth: "0.05",
    costPerMmHeight: "0.04",
    accessoryPrice: "10.00",
    glassDiscountWidthMm: "30",
    glassDiscountHeightMm: "30",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "30.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Marco simple sin herrajes móviles",
  },

  // Puertas - Aluminios Panamá
  {
    profileSupplierId: null,
    name: "Puerta Corrediza 2 Hojas - Aluminio",
    imageUrl: "/models/puerta-corrediza-2h.jpg",
    status: "published" as const,
    minWidthMm: "1400",
    maxWidthMm: "2400",
    minHeightMm: "2000",
    maxHeightMm: "2400",
    basePrice: "350.00",
    costPerMmWidth: "0.15",
    costPerMmHeight: "0.12",
    accessoryPrice: "80.00",
    glassDiscountWidthMm: "60",
    glassDiscountHeightMm: "80",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "38.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes:
      "Incluye cerradura, rieles reforzados y vidrio templado requerido",
  },
  {
    profileSupplierId: null,
    name: "Puerta Batiente 1 Hoja - Aluminio",
    imageUrl: "/models/puerta-batiente-1h.jpg",
    status: "published" as const,
    minWidthMm: "700",
    maxWidthMm: "1000",
    minHeightMm: "2000",
    maxHeightMm: "2400",
    basePrice: "320.00",
    costPerMmWidth: "0.14",
    costPerMmHeight: "0.11",
    accessoryPrice: "75.00",
    glassDiscountWidthMm: "50",
    glassDiscountHeightMm: "80",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "38.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Incluye bisagras de pivote, cerradura y vidrio templado",
  },

  // Ventanas PVC
  {
    profileSupplierId: null,
    name: "Ventana Corrediza 2 Hojas - PVC",
    imageUrl: "/models/ventana-pvc-2h.jpg",
    status: "published" as const,
    minWidthMm: "600",
    maxWidthMm: "1800",
    minHeightMm: "600",
    maxHeightMm: "1400",
    basePrice: "200.00",
    costPerMmWidth: "0.09",
    costPerMmHeight: "0.07",
    accessoryPrice: "30.00",
    glassDiscountWidthMm: "45",
    glassDiscountHeightMm: "45",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "36.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "Sistema PVC reforzado con acero, apto para clima tropical",
  },

  // Modelos Premium - Sistemas Mixtos
  {
    profileSupplierId: null,
    name: "Ventana Oscilobatiente - Aluminio-Madera",
    imageUrl: "/models/ventana-oscilobatiente-premium.jpg",
    status: "published" as const,
    minWidthMm: "500",
    maxWidthMm: "1400",
    minHeightMm: "600",
    maxHeightMm: "1600",
    basePrice: "450.00",
    costPerMmWidth: "0.18",
    costPerMmHeight: "0.15",
    accessoryPrice: "120.00",
    glassDiscountWidthMm: "40",
    glassDiscountHeightMm: "50",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "45.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes:
      "Sistema premium con herrajes europeos, interior madera tropical",
  },

  // Modelo en desarrollo
  {
    profileSupplierId: null,
    name: "Mampara Plegable 6 Hojas - Aluminio",
    imageUrl: "/models/mampara-plegable-6h.jpg",
    status: "draft" as const,
    minWidthMm: "3000",
    maxWidthMm: "6000",
    minHeightMm: "2000",
    maxHeightMm: "2800",
    basePrice: "800.00",
    costPerMmWidth: "0.25",
    costPerMmHeight: "0.20",
    accessoryPrice: "200.00",
    glassDiscountWidthMm: "60",
    glassDiscountHeightMm: "80",
    compatibleGlassTypeIds: [],
    profitMarginPercentage: "42.00",
    lastCostReviewDate: new Date("2025-11-01"),
    costNotes: "En desarrollo - herrajes de importación, rieles especiales",
  },
];
