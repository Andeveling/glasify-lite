/**
 * Excel Styles Configuration
 *
 * Defines cell formats, column widths, fonts, and colors for Excel generation.
 * Used by QuoteExcelWorkbook.
 */

import type { Alignment, Borders, Fill, Font } from "exceljs";

/**
 * Excel Color Palette (using hex codes)
 */
export const excelColors = {
	black: "FF000000",
	error: "FFEF4444", // Red-500
	gray50: "FFF9FAFB",
	gray100: "FFF3F4F6",
	gray200: "FFE5E7EB",
	gray300: "FFD1D5DB",
	gray400: "FF9CA3AF",
	gray500: "FF6B7280",
	gray600: "FF4B5563",
	gray700: "FF374151",
	gray800: "FF1F2937",
	gray900: "FF111827",
	info: "FF3B82F6", // Blue-500
	// Primary colors
	primary: "FF2563EB", // Blue-600
	primaryDark: "FF1E40AF", // Blue-800
	primaryLight: "FFDBEAFE", // Blue-100

	// Semantic colors
	success: "FF10B981", // Green-500
	warning: "FFF59E0B", // Amber-500

	// Neutral colors
	white: "FFFFFFFF",
} as const;

/**
 * Excel Font Styles
 */
export const excelFonts = {
	body: {
		color: { argb: excelColors.gray900 },
		name: "Calibri",
		size: 11,
	} as Font,

	bold: {
		bold: true,
		color: { argb: excelColors.gray900 },
		name: "Calibri",
		size: 11,
	} as Font,
	header: {
		bold: true,
		color: { argb: excelColors.white },
		name: "Calibri",
		size: 14,
	} as Font,

	sectionTitle: {
		bold: true,
		color: { argb: excelColors.gray900 },
		name: "Calibri",
		size: 12,
	} as Font,

	small: {
		color: { argb: excelColors.gray600 },
		name: "Calibri",
		size: 9,
	} as Font,

	tableHeader: {
		bold: true,
		color: { argb: excelColors.white },
		name: "Calibri",
		size: 11,
	} as Font,

	totalLabel: {
		bold: true,
		color: { argb: excelColors.gray900 },
		name: "Calibri",
		size: 12,
	} as Font,

	totalValue: {
		bold: true,
		color: { argb: excelColors.primary },
		name: "Calibri",
		size: 12,
	} as Font,
} as const;

/**
 * Excel Fill Styles (backgrounds)
 */
export const excelFills = {
	header: {
		fgColor: { argb: excelColors.primary },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	sectionTitle: {
		fgColor: { argb: excelColors.gray100 },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	tableHeader: {
		fgColor: { argb: excelColors.primary },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	tableRowEven: {
		fgColor: { argb: excelColors.gray50 },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	tableRowOdd: {
		fgColor: { argb: excelColors.white },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	totalRow: {
		fgColor: { argb: excelColors.primaryLight },
		pattern: "solid",
		type: "pattern",
	} as Fill,

	totalsSection: {
		fgColor: { argb: excelColors.gray50 },
		pattern: "solid",
		type: "pattern",
	} as Fill,
} as const;

/**
 * Excel Border Styles
 */
export const excelBorders = {
	bottom: {
		bottom: { color: { argb: excelColors.gray300 }, style: "thin" },
	} as Partial<Borders>,

	medium: {
		bottom: { color: { argb: excelColors.gray400 }, style: "medium" },
		left: { color: { argb: excelColors.gray400 }, style: "medium" },
		right: { color: { argb: excelColors.gray400 }, style: "medium" },
		top: { color: { argb: excelColors.gray400 }, style: "medium" },
	} as Partial<Borders>,

	thick: {
		bottom: { color: { argb: excelColors.primary }, style: "thick" },
		top: { color: { argb: excelColors.primary }, style: "thick" },
	} as Partial<Borders>,
	thin: {
		bottom: { color: { argb: excelColors.gray300 }, style: "thin" },
		left: { color: { argb: excelColors.gray300 }, style: "thin" },
		right: { color: { argb: excelColors.gray300 }, style: "thin" },
		top: { color: { argb: excelColors.gray300 }, style: "thin" },
	} as Partial<Borders>,

	topBottom: {
		bottom: { color: { argb: excelColors.gray300 }, style: "thin" },
		top: { color: { argb: excelColors.gray300 }, style: "thin" },
	} as Partial<Borders>,
} as const;

/**
 * Excel Alignment Styles
 */
export const excelAlignments = {
	center: {
		horizontal: "center",
		vertical: "middle",
		wrapText: false,
	} as Alignment,

	centerWrap: {
		horizontal: "center",
		vertical: "middle",
		wrapText: true,
	} as Alignment,
	left: {
		horizontal: "left",
		vertical: "middle",
		wrapText: false,
	} as Alignment,

	leftWrap: {
		horizontal: "left",
		vertical: "middle",
		wrapText: true,
	} as Alignment,

	right: {
		horizontal: "right",
		vertical: "middle",
		wrapText: false,
	} as Alignment,
} as const;

/**
 * Excel Column Widths
 */
export const excelColumnWidths = {
	dimensions: 15,
	itemDescription: 30,
	itemName: 25,

	// Items sheet
	itemNumber: 8,
	quantity: 10,
	subtotal: 12,
	// Summary sheet
	summaryLabel: 20,
	summaryValue: 30,
	unitPrice: 12,
} as const;

/**
 * Excel Number Formats
 */
export const excelNumberFormats = {
	currency: "$#,##0",
	currencyDecimals: "$#,##0.00",
	date: "yyyy-mm-dd",
	dateLong: "dd/mm/yyyy",
	decimal: "#,##0.00",
	number: "#,##0",
	percentage: "0.00%",
} as const;

/**
 * Excel Row Heights
 */
export const excelRowHeights = {
	default: 15,
	header: 30,
	sectionTitle: 25,
	small: 15,
	tableHeader: 20,
	tableRow: 18,
} as const;
