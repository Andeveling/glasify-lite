/**
 * Vitro Rojas - Glass Suppliers Data
 *
 * Proveedores de vidrio que suministran a Vitro Rojas.
 * Incluye fabricantes internacionales y distribuidores locales.
 *
 * Proveedores principales:
 * - Guardian Glass: Líder mundial en vidrio de alta performance
 * - Saint-Gobain: Fabricante francés con amplia gama
 * - AGC Glass: Fabricante japonés, excelente calidad
 * - Vitro Architectural Glass: Fabricante mexicano, buena relación calidad-precio
 *
 * @version 1.0.0
 * @date 2025-11-13
 */

export const vitroRojasGlassSuppliers = [
  {
    name: "Guardian Glass",
    code: "GUARDIAN",
    country: "USA",
    website: "https://www.guardianglass.com",
    contactEmail: "latam@guardianglass.com",
    contactPhone: "+1-866-482-7346",
    isActive: true,
    notes:
      "Proveedor principal. Excelente disponibilidad de productos Low-E y SunGuard.",
  },
  {
    name: "Saint-Gobain",
    code: "SGOBAIN",
    country: "France",
    website: "https://www.saint-gobain-glass.com",
    contactEmail: "panama@saint-gobain.com",
    contactPhone: "+33-1-4735-4000",
    isActive: true,
    notes:
      "Amplia gama de productos. Especialistas en vidrio acústico y de seguridad.",
  },
  {
    name: "AGC Glass",
    code: "AGC",
    country: "Japan",
    website: "https://www.agc-glass.eu",
    contactEmail: "americas@agc.com",
    contactPhone: "+81-3-3218-5555",
    isActive: true,
    notes: "Alta calidad. Productos Sunergy y Stopray para control solar.",
  },
  {
    name: "Vitro Architectural Glass",
    code: "VITRO",
    country: "Mexico",
    website: "https://www.vitro.com",
    contactEmail: "ventas@vitro.com",
    contactPhone: "+52-81-8863-1200",
    isActive: true,
    notes: "Buena relación calidad-precio. Entrega rápida desde México.",
  },
  {
    name: "Cristales Centroamericanos",
    code: "CRISTALCA",
    country: "Panama",
    website: undefined, // Local distributor, no website
    contactEmail: "info@cristalca.com.pa",
    contactPhone: "+507-236-5678",
    isActive: true,
    notes: "Distribuidor local. Stock inmediato de vidrios estándar.",
  },
  {
    name: "Pilkington",
    code: "PILK",
    country: "UK",
    website: "https://www.pilkington.com",
    contactEmail: "latam@nsg.com",
    contactPhone: "+44-1744-692000",
    isActive: false,
    notes:
      "Proveedor histórico. Actualmente con poca disponibilidad en la región.",
  },
];
