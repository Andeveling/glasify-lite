/**
 * Export Types for Quote PDF/Excel Generation
 *
 * Type definitions for quote export functionality including PDF and Excel formats.
 * Supports both @react-pdf/renderer and exceljs libraries.
 */

import type { Quote } from "@prisma/client";

/**
 * Supported export formats
 */
export type ExportFormat = "pdf" | "excel";

/**
 * Export configuration options
 */
export type ExportOptions = {
	/** Export format (PDF or Excel) */
	format: ExportFormat;

	/** Company name override (falls back to NEXT_PUBLIC_COMPANY_NAME) */
	companyName?: string;

	/** Company logo URL override (falls back to NEXT_PUBLIC_COMPANY_LOGO_URL) */
	logoUrl?: string;

	/** Include item images in export (default: false for performance) */
	includeImages?: boolean;

	/** Page size for PDF exports (default: 'A4') */
	pageSize?: "A4" | "LETTER" | "LEGAL";

	/** Locale for formatting (falls back to TENANT_LOCALE) */
	locale?: string;

	/** Currency code (falls back to TENANT_CURRENCY) */
	currency?: string;

	/** Timezone for date formatting (falls back to TENANT_TIMEZONE) */
	timezone?: string;
};

/**
 * Quote data structure for PDF generation
 * Enriched with computed fields and formatting helpers
 */
export type QuotePDFData = {
	/** Quote metadata */
	quote: {
		id: string;
		projectName: string;
		status: Quote["status"];
		createdAt: Date;
		validUntil: Date;
		totalAmount: number;
		itemCount: number;
		notes?: string | null;
	};

	/** Quote items with product details */
	items: Array<{
		id: string;
		name: string;
		quantity: number;
		unitPrice: number;
		subtotal: number;

		/** Product/Model information */
		product?: {
			name: string;
			manufacturer?: string;
			category?: string;
			imageUrl?: string;
		};

		/** Window dimensions (if applicable) */
		dimensions?: {
			width: number;
			height: number;
			area: number;
			unit: "m²" | "cm²";
		};

		/** Glass specifications (if applicable) */
		glass?: {
			type: string;
			thickness?: number;
			color?: string;
			colorHexCode?: string;
			colorSurchargePercentage?: number;
			treatment?: string;
		};
	}>;

	/** Customer information */
	customer: {
		name: string;
		email: string;
		phone?: string | null;
	};

	/** Company information (from TenantConfig + env vars) */
	company: {
		name: string;
		logoUrl?: string;
		email?: string;
		phone?: string;
		address?: string;
	};

	/** Formatting configuration */
	formatting: {
		locale: string;
		currency: string;
		timezone: string;
	};

	/** Computed totals */
	totals: {
		subtotal: number;
		tax?: number;
		discount?: number;
		total: number;
	};
};

/**
 * Quote data structure for Excel generation
 * Similar to PDF but optimized for spreadsheet format
 */
export type QuoteExcelData = {
	/** Quote metadata */
	quote: {
		id: string;
		projectName: string;
		status: Quote["status"];
		createdAt: Date;
		validUntil: Date;
		totalAmount: number;
		itemCount: number;
		notes?: string | null;
	};

	/** Quote items (flat structure for Excel rows) */
	items: Array<{
		itemNumber: number; // Row number in Excel (1-based)
		id: string;
		name: string;
		quantity: number;
		unitPrice: number;
		subtotal: number;

		// Product columns
		productName?: string;
		manufacturer?: string;
		category?: string;

		// Dimensions columns
		width?: number;
		height?: number;
		area?: number;

		// Glass columns
		glassType?: string;
		glassThickness?: number;
		glassColor?: string;
		glassTreatment?: string;
	}>;

	/** Customer information */
	customer: {
		name: string;
		email: string;
		phone?: string | null;
	};

	/** Company information */
	company: {
		name: string;
		email?: string;
		phone?: string;
		address?: string;
	};

	/** Formatting configuration */
	formatting: {
		locale: string;
		currency: string;
		timezone: string;
	};

	/** Computed totals (for Summary sheet) */
	totals: {
		subtotal: number;
		tax?: number;
		discount?: number;
		total: number;
	};
};

/**
 * Export result returned from Server Actions
 */
export type ExportResult = {
	success: boolean;

	/** Base64-encoded file data (for download) */
	data?: string;

	/** Suggested filename with extension */
	filename?: string;

	/** MIME type for download */
	mimeType?: string;

	/** File size in bytes */
	fileSize?: number;

	/** Error message if success=false */
	error?: string;

	/** Generation duration in milliseconds (for logging) */
	duration?: number;
};

/**
 * Export metadata for logging and analytics
 */
export type ExportMetadata = {
	quoteId: string;
	format: ExportFormat;
	itemCount: number;
	fileSize: number;
	duration: number;
	userId: string;
	timestamp: Date;
	options: ExportOptions;
};
