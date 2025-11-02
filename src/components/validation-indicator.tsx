import { AlertCircle, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type ValidationIndicatorProps = {
	isValid: boolean;
	showIndicator: boolean;
	className?: string;
};

/**
 * ValidationIndicator - Molecule component
 * Shows a check icon for valid state or alert icon for invalid state
 * Uses theme colors (success/destructive) for consistency across light/dark modes
 */
export function ValidationIndicator({
	isValid,
	showIndicator,
	className,
}: ValidationIndicatorProps) {
	if (!showIndicator) {
		return null;
	}

	return isValid ? (
		<Check
			aria-label="Válido"
			className={cn("h-4 w-4 text-success", className)}
		/>
	) : (
		<AlertCircle
			aria-label="Inválido"
			className={cn("h-4 w-4 text-destructive", className)}
		/>
	);
}
