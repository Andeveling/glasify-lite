/**
 * PDF Styles Configuration
 *
 * Defines fonts, colors, spacing, and table styles for PDF generation.
 * Used by QuotePDFDocument component.
 */

import { StyleSheet } from "@react-pdf/renderer";

/**
 * PDF Color Palette
 */
export const pdfColors = {
  // Neutral colors
  black: "#000000",
  error: "#ef4444", // Red-500
  gray50: "#f9fafb",
  gray100: "#f3f4f6",
  gray200: "#e5e7eb",
  gray300: "#d1d5db",
  gray400: "#9ca3af",
  gray500: "#6b7280",
  gray600: "#4b5563",
  gray700: "#374151",
  gray800: "#1f2937",
  gray900: "#111827",
  info: "#3b82f6", // Blue-500
  // Primary colors
  primary: "#2563eb", // Blue-600
  primaryDark: "#1e40af", // Blue-800
  primaryLight: "#dbeafe", // Blue-100

  // Semantic colors
  success: "#10b981", // Green-500
  warning: "#f59e0b", // Amber-500
  white: "#ffffff",
} as const;

/**
 * PDF Typography
 */
export const pdfFonts = {
  lineHeights: {
    normal: 1.5,
    relaxed: 1.75,
    tight: 1.2,
  },
  sizes: {
    "2xl": 18,
    "3xl": 24,
    "4xl": 32,
    base: 12,
    lg: 14,
    sm: 10,
    xl: 16,
    xs: 8,
  },
  weights: {
    bold: 700,
    medium: 500,
    normal: 400,
    semibold: 600,
  },
} as const;

/**
 * PDF Spacing
 */
export const pdfSpacing = {
  "2xl": 32,
  "3xl": 48,
  lg: 16,
  md: 12,
  sm: 8,
  xl: 24,
  xs: 4,
} as const;

/**
 * PDF Page Layout
 */
export const pdfLayout = {
  borders: {
    radius: 4,
    width: 1,
  },
  margins: {
    paragraph: 8,
    section: 16,
  },
  page: {
    padding: 40,
    paddingBottom: 80,
    paddingTop: 60,
  },
} as const;

/**
 * PDF Styles
 */
export const pdfStyles = StyleSheet.create({
  // Column Widths - Optimized for better text wrapping and readability
  // Total: 100% (20% + 20% + 15% + 12% + 16% + 17%)
  colDescription: { width: "20%" },
  colDimensions: { width: "15%" },
  colItem: { width: "20%" },
  colQuantity: { width: "12%" },
  colSubtotal: { width: "17%" },
  colUnitPrice: { width: "16%" },
  companyLogo: {
    height: 40,
    objectFit: "contain",
    width: 120,
  },
  companyName: {
    color: pdfColors.primary,
    fontSize: pdfFonts.sizes["2xl"],
    fontWeight: "bold",
  },

  // Footer
  footer: {
    borderTopColor: pdfColors.gray300,
    borderTopWidth: 1,
    bottom: 30,
    flexDirection: "column",
    gap: pdfSpacing.sm,
    left: 40,
    paddingTop: pdfSpacing.md,
    position: "absolute",
    right: 40,
  },
  footerBold: {
    color: pdfColors.gray800,
    fontWeight: "semibold",
  },
  footerText: {
    color: pdfColors.gray600,
    fontSize: pdfFonts.sizes.xs,
    textAlign: "center",
  },

  // Header
  header: {
    alignItems: "flex-start",
    borderBottomColor: pdfColors.primary,
    borderBottomWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: pdfSpacing.xl,
    paddingBottom: pdfSpacing.md,
  },
  headerLeft: {
    flexDirection: "column",
    gap: pdfSpacing.xs,
  },
  headerRight: {
    alignItems: "flex-end",
    flexDirection: "column",
    gap: pdfSpacing.xs,
  },
  mb: {
    marginBottom: pdfSpacing.md,
  },
  mt: {
    marginTop: pdfSpacing.md,
  },
  // Page
  page: {
    backgroundColor: pdfColors.white,
    color: pdfColors.gray900,
    flexDirection: "column",
    fontFamily: "Helvetica",
    fontSize: pdfFonts.sizes.base,
    padding: pdfLayout.page.padding,
    paddingBottom: pdfLayout.page.paddingBottom,
    paddingTop: pdfLayout.page.paddingTop,
  },
  pageNumber: {
    color: pdfColors.gray500,
    fontSize: pdfFonts.sizes.xs,
    textAlign: "center",
  },
  projectInfo: {
    flexDirection: "column",
    gap: pdfSpacing.xs,
  },
  projectLabel: {
    color: pdfColors.gray700,
    fontSize: pdfFonts.sizes.sm,
    fontWeight: "semibold",
    minWidth: 80,
  },
  projectRow: {
    flexDirection: "row",
    gap: pdfSpacing.sm,
  },

  // Project Information Section
  projectSection: {
    backgroundColor: pdfColors.gray50,
    borderRadius: pdfLayout.borders.radius,
    marginBottom: pdfSpacing.lg,
    padding: pdfSpacing.md,
  },
  projectValue: {
    color: pdfColors.gray900,
    flex: 1,
    fontSize: pdfFonts.sizes.sm,
  },
  quoteDate: {
    color: pdfColors.gray600,
    fontSize: pdfFonts.sizes.sm,
  },
  quoteNumber: {
    color: pdfColors.gray800,
    fontSize: pdfFonts.sizes.lg,
    fontWeight: "semibold",
  },
  sectionTitle: {
    color: pdfColors.gray900,
    fontSize: pdfFonts.sizes.lg,
    fontWeight: "semibold",
    marginBottom: pdfSpacing.sm,
  },
  table: {
    borderColor: pdfColors.gray300,
    borderRadius: pdfLayout.borders.radius,
    borderWidth: 1,
    display: "flex",
    flexDirection: "column",
  },
  tableCell: {
    color: pdfColors.gray900,
    flex: 1,
    fontSize: pdfFonts.sizes.sm,
    padding: pdfSpacing.xs,
  },
  tableCellCenter: {
    textAlign: "center",
  },
  tableCellLeft: {
    textAlign: "left",
  },
  tableCellRight: {
    textAlign: "right",
  },
  tableHeader: {
    backgroundColor: pdfColors.primary,
    borderTopLeftRadius: pdfLayout.borders.radius,
    borderTopRightRadius: pdfLayout.borders.radius,
    display: "flex",
    flexDirection: "row",
    gap: 0,
    padding: pdfSpacing.sm,
  },
  tableHeaderCell: {
    alignItems: "center",
    color: pdfColors.white,
    display: "flex",
    flex: 1,
    fontSize: pdfFonts.sizes.sm,
    fontWeight: "bold",
    justifyContent: "center",
    textAlign: "center",
  },
  tableRow: {
    alignItems: "flex-start",
    borderBottomColor: pdfColors.gray200,
    borderBottomWidth: 1,
    flexDirection: "row",
    minHeight: 50,
    padding: pdfSpacing.sm,
  },
  tableRowEven: {
    backgroundColor: pdfColors.gray50,
  },

  // Items Table
  tableSection: {
    marginBottom: pdfSpacing.lg,
  },

  // Utility Classes
  textBold: {
    fontWeight: "bold",
  },
  textGray: {
    color: pdfColors.gray600,
  },
  textPrimary: {
    color: pdfColors.primary,
  },
  textSemibold: {
    fontWeight: "semibold",
  },
  totalLabel: {
    color: pdfColors.gray900,
    fontSize: pdfFonts.sizes.lg,
    fontWeight: "bold",
  },
  totalRow: {
    borderBottomColor: pdfColors.primary,
    borderBottomWidth: 2,
    paddingVertical: pdfSpacing.sm,
  },
  totalsLabel: {
    color: pdfColors.gray700,
    fontSize: pdfFonts.sizes.base,
  },
  totalsRow: {
    borderBottomColor: pdfColors.gray200,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: pdfSpacing.xs,
  },

  // Totals Section
  totalsSection: {
    marginLeft: "auto",
    marginTop: pdfSpacing.lg,
    width: "40%",
  },
  totalsValue: {
    color: pdfColors.gray900,
    fontSize: pdfFonts.sizes.base,
    fontWeight: "semibold",
  },
  totalValue: {
    color: pdfColors.primary,
    fontSize: pdfFonts.sizes.lg,
    fontWeight: "bold",
  },
});
