/**
 * QuoteExportButtons Component
 *
 * Renders PDF and Excel export buttons with loading states for quote export functionality.
 * Uses useQuoteExport hook to handle export logic.
 */

"use client";

import { FileDown, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuoteExport } from "../../_hooks/use-quote-export";

type QuoteExportButtonsProps = {
	/** Quote ID to export */
	quoteId: string;

	/** Button size variant */
	size?: "sm" | "default" | "lg";

	/** Display mode: full (both icons + text), compact (icons only), or icons (icons with tooltips) */
	variant?: "full" | "compact" | "icons";

	/** Additional CSS classes */
	className?: string;
};

/**
 * Export buttons for quote PDF and Excel downloads
 */
export function QuoteExportButtons({
	quoteId,
	size = "default",
	variant = "full",
	className,
}: QuoteExportButtonsProps) {
	const { exportPDF, exportExcel, isExportingPDF, isExportingExcel } =
		useQuoteExport();

	const handlePDFExport = () => {
		exportPDF(quoteId);
	};

	const handleExcelExport = () => {
		exportExcel(quoteId);
	};

	const showText = variant === "full";
	const isCompact = variant === "compact" || variant === "icons";

	return (
		<div className={`flex gap-2 ${className || ""}`}>
			{/* PDF Export Button */}
			<Button
				aria-label="Exportar a PDF"
				className="gap-2"
				disabled={isExportingPDF || isExportingExcel}
				onClick={handlePDFExport}
				size={size}
				title={isCompact ? "Exportar a PDF" : undefined}
				variant="outline"
			>
				<FileDown
					aria-hidden="true"
					className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
				/>
				{showText && <span>{isExportingPDF ? "Generando PDF..." : "PDF"}</span>}
			</Button>

			{/* Excel Export Button */}
			<Button
				aria-label="Exportar a Excel"
				className="gap-2"
				disabled={isExportingPDF || isExportingExcel}
				onClick={handleExcelExport}
				size={size}
				title={isCompact ? "Exportar a Excel" : undefined}
				variant="outline"
			>
				<FileSpreadsheet
					aria-hidden="true"
					className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
				/>
				{showText && (
					<span>{isExportingExcel ? "Generando Excel..." : "Excel"}</span>
				)}
			</Button>
		</div>
	);
}
