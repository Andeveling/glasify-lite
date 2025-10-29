/**
 * Wizard form types and utility functions
 * Defines the complete state of a quotation in progress
 */

/**
 * Complete wizard form data structure
 * Represents all data collected through the 4-step wizard
 */
export type WizardFormData = {
	roomLocation: string;
	width: number;
	height: number;
	colorId: string | null;
	glassSolutionId: string | null;
	selectedServices?: string[]; // Optional with default empty array
	modelId: string;
	currentStep: number;
	lastUpdated: string;
};

/**
 * Get default values for wizard form initialization
 * @param modelId - ID of the model being configured
 * @returns Default form data with empty/initial values
 */
export function getWizardDefaults(modelId: string): WizardFormData {
	return {
		colorId: null,
		currentStep: 1,
		glassSolutionId: null,
		height: 0,
		lastUpdated: new Date().toISOString(),
		modelId,
		roomLocation: '',
		selectedServices: [],
		width: 0,
	};
}

/**
 * Transform wizard form data to quote item API payload
 * Converts wizard state to the format expected by quote.add-item procedure
 *
 * @param data - Wizard form data
 * @param glassTypeId - Selected glass type ID (from glass solution)
 * @returns Payload for quote.add-item tRPC mutation
 */
export function transformWizardToQuoteItem(
	data: WizardFormData,
	glassTypeId: string,
) {
	return {
		adjustments: [], // No adjustments in wizard flow
		colorId: data.colorId ?? undefined,
		glassTypeId,
		heightMm: data.height,
		modelId: data.modelId,
		quantity: 1, // Wizard always creates single item
		roomLocation: data.roomLocation || undefined,
		services: (data.selectedServices ?? []).map((serviceId) => ({
			quantity: 1, // Default quantity for wizard
			serviceId,
		})),
		unit: 'unit' as const, // Wizard always uses unit pricing
		widthMm: data.width,
	};
}

/**
 * Type for transformed quote item payload
 * Matches the input schema of quote.add-item procedure
 */
export type QuoteItemPayload = ReturnType<typeof transformWizardToQuoteItem>;
