/**
 * Profile Suppliers Catalog - Colombian Market
 *
 * Window and door profile manufacturers available in Colombia.
 *
 * Data sources:
 * - docs/context/alumina.info.md (Alumina - Colombian aluminum manufacturer)
 * - docs/context/veka-example.info.md (VEKA - German PVC profiles)
 * - https://www.deceuninck.co/ (Deceuninck - Belgian PVC profiles)
 * - Rehau references (German PVC profiles)
 *
 * @version 1.0.0
 * @lastUpdated 2025-01-10
 */

import type { ProfileSupplierInput } from "../../factories/profile-supplier.factory";

/**
 * Profile suppliers available in Colombian market
 *
 * Material types:
 * - PVC: Excellent thermal insulation, low maintenance, European quality
 * - ALUMINUM: Durable, modern aesthetics, requires RPT for insulation
 * - WOOD: Traditional, natural insulation, higher maintenance
 * - MIXED: Combination of materials (aluminum-wood, etc.)
 */
export const profileSuppliersCatalog: ProfileSupplierInput[] = [
	// ==========================================
	// PVC EUROPEO - Premium Quality
	// ==========================================
	{
		isActive: true,
		materialType: "PVC",
		name: "Deceuninck",
		notes:
			"Belgian manufacturer, premium PVC profiles. Leader in European market. Excellent thermal and acoustic insulation. Series: Inoutic, Zendow, Elegant.",
	},
	{
		isActive: true,
		materialType: "PVC",
		name: "Rehau",
		notes:
			"German manufacturer, high-quality PVC profiles. Known for durability and UV resistance in tropical climates. Wide range of designs and colors.",
	},
	{
		isActive: true,
		materialType: "PVC",
		name: "VEKA",
		notes:
			"German manufacturer, world leader in PVC profile systems. Multichamber profiles, excellent insulation. Lines: Euroline, Softline, Ekosol.",
	},

	// ==========================================
	// ALUMINIO - Local & European
	// ==========================================
	{
		isActive: true,
		materialType: "ALUMINUM",
		name: "Alumina",
		notes:
			"Colombian aluminum manufacturer. Series: Koncept (100, 70, 55, 50, 40), Superior (80, 50, 35), Maestro (7038, 8025, 744, 3890, 5020, 3825, 3831). RPT options available.",
	},
	{
		isActive: true,
		materialType: "ALUMINUM",
		name: "Sistemas Europeos",
		notes:
			"European aluminum systems with thermal break (RPT). Premium quality, modern designs, excellent thermal performance.",
	},

	// ==========================================
	// LÍNEAS ECONÓMICAS
	// ==========================================
	{
		isActive: true,
		materialType: "ALUMINUM",
		name: "Aluminio Económico",
		notes:
			"Economic aluminum profiles without thermal break. Basic functionality, lower cost. Suitable for tropical climates where insulation is less critical.",
	},

	// ==========================================
	// MIXED / SPECIALTY
	// ==========================================
	{
		isActive: false,
		materialType: "WOOD",
		name: "Madera Premium",
		notes:
			"Premium wood profiles for traditional and luxury applications. High maintenance, excellent natural insulation. Limited availability in Colombia.",
	},
];

/**
 * Profile suppliers grouped by material type
 */
export const profileSuppliersByMaterial = {
	ALUMINUM: profileSuppliersCatalog.filter(
		(s) => s.materialType === "ALUMINUM",
	),
	MIXED: profileSuppliersCatalog.filter((s) => s.materialType === "MIXED"),
	PVC: profileSuppliersCatalog.filter((s) => s.materialType === "PVC"),
	WOOD: profileSuppliersCatalog.filter((s) => s.materialType === "WOOD"),
};

/**
 * Active suppliers only
 */
export const activeProfileSuppliers = profileSuppliersCatalog.filter(
	(s) => s.isActive,
);

/**
 * Profile suppliers grouped by country/origin
 */
export const profileSuppliersByCountry = {
	Colombia: profileSuppliersCatalog.filter((s) =>
		["Alumina", "Sistemas Europeos", "Aluminio Económico"].includes(s.name),
	),
	Germany: profileSuppliersCatalog.filter((s) =>
		["Deceuninck", "Rehau", "VEKA"].includes(s.name),
	),
};

/**
 * Recommended suppliers by project type
 */
export const recommendedSuppliers = {
	budget: ["Aluminio Económico", "Alumina"],
	commercial: ["Sistemas Europeos", "Deceuninck", "Alumina"],
	premium: ["Deceuninck", "VEKA", "Sistemas Europeos"],
	residential: ["Deceuninck", "Rehau", "Alumina"],
	tropical: ["Rehau", "Deceuninck", "Alumina"], // UV resistance important
};
