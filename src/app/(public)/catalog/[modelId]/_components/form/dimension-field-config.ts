/**
 * Configuration module for DimensionField variants
 * Single Responsibility: Manages variant configurations only
 */

/**
 * Available dimension field variants
 * Each variant optimizes for different UX contexts
 */
export type DimensionVariant = "full" | "simple" | "compact" | "minimal";

/**
 * Configuration shape for dimension field display
 */
export type DimensionVariantConfig = {
	showInput: boolean;
	showSlider: boolean;
	showSuggestedValues: boolean;
	showValidationIndicator: boolean;
	showDescription: boolean;
	showFormMessage: boolean;
	spacingClassName: string;
	labelClassName: string;
};

/**
 * Predefined configurations for each variant
 * Reduces cognitive load and optimizes for different contexts
 */
export const VARIANT_CONFIGS: Record<DimensionVariant, DimensionVariantConfig> =
	{
		// Full: All features (default for backward compatibility)
		full: {
			showInput: true,
			showSlider: true,
			showSuggestedValues: true,
			showValidationIndicator: true,
			showDescription: true,
			showFormMessage: true,
			spacingClassName: "space-y-2",
			labelClassName: "text-sm",
		},
		// Simple: Input, slider and validation (recommended for most cases)
		simple: {
			showInput: true,
			showSlider: true,
			showSuggestedValues: false,
			showValidationIndicator: true,
			showDescription: true,
			showFormMessage: true,
			spacingClassName: "space-y-1.5",
			labelClassName: "text-sm",
		},
		// Compact: Input only with description (maximum cognitive load reduction)
		compact: {
			showInput: true,
			showSlider: false,
			showSuggestedValues: false,
			showValidationIndicator: false,
			showDescription: false,
			showFormMessage: true,
			spacingClassName: "space-y-1",
			labelClassName: "text-xs",
		},
		// Minimal: Input only (for very specific cases)
		minimal: {
			showInput: true,
			showSlider: false,
			showSuggestedValues: false,
			showValidationIndicator: false,
			showDescription: false,
			showFormMessage: false,
			spacingClassName: "space-y-0.5",
			labelClassName: "text-xs",
		},
	};

/**
 * Resolves final configuration by merging variant config with custom overrides
 * Open/Closed Principle: Config is open for extension via customConfig
 */
export function resolveVariantConfig(
	variant: DimensionVariant,
	customConfig?: Partial<DimensionVariantConfig>,
): DimensionVariantConfig {
	return {
		...VARIANT_CONFIGS[variant],
		...customConfig,
	};
}

/**
 * Determines if inline range hint should be shown
 * Logic extracted for testability and reusability
 */
export function shouldShowInlineRangeHint(
	config: DimensionVariantConfig,
): boolean {
	return !config.showDescription;
}
