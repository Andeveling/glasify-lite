import type { ReactNode } from "react";
import { FormLabel } from "@/components/ui/form";
import { ValidationIndicator } from "@/components/validation-indicator";
import { cn } from "@/lib/utils";

/**
 * Props for DimensionFieldHeader component
 * Interface Segregation Principle: Only what's needed for header rendering
 */
type DimensionFieldHeaderProps = {
	label: string;
	labelClassName: string;
	showInlineRangeHint: boolean;
	min: number;
	max: number;
	showValidationIndicator: boolean;
	isValid: boolean;
	hasValue: boolean;
};

/**
 * Header component for dimension fields
 * Single Responsibility: Renders label, optional range hint, and validation indicator
 *
 * @example
 * <DimensionFieldHeader
 *   label="Ancho"
 *   labelClassName="text-sm"
 *   showInlineRangeHint={true}
 *   min={100}
 *   max={3000}
 *   showValidationIndicator={true}
 *   isValid={true}
 *   hasValue={true}
 * />
 */
export function DimensionFieldHeader({
	label,
	labelClassName,
	showInlineRangeHint,
	min,
	max,
	showValidationIndicator,
	isValid,
	hasValue,
}: DimensionFieldHeaderProps) {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex items-center gap-2 text-base">
				<FormLabel className={labelClassName}>
					<span className="text-base">{label}</span>
				</FormLabel>
				{showInlineRangeHint && (
					<span className="text-muted-foreground">
						({min} - {max} mm)
					</span>
				)}
			</div>
			{showValidationIndicator && (
				<ValidationIndicator isValid={isValid} showIndicator={hasValue} />
			)}
		</div>
	);
}

/**
 * Props for optional content wrapper
 */
type OptionalContentProps = {
	show: boolean;
	children: ReactNode;
	className?: string;
};

/**
 * Wrapper component for optional conditional content
 * Single Responsibility: Handles conditional rendering logic
 * Reduces repetitive {condition && <Component />} patterns
 */
export function OptionalContent({
	show,
	children,
	className,
}: OptionalContentProps) {
	if (!show) {
		return null;
	}

	if (className) {
		return <div className={className}>{children}</div>;
	}

	return children;
}
