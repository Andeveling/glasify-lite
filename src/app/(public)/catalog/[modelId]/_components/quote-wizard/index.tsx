/**
 * Quote Wizard Exports
 * Main entry point with error boundary wrapper
 */

"use client";

import { QuoteWizard as QuoteWizardComponent } from "./quote-wizard";
import { QuoteWizardErrorBoundary } from "./quote-wizard-error-boundary";

type QuoteWizardWithErrorBoundaryProps = React.ComponentProps<
  typeof QuoteWizardComponent
>;

/**
 * Quote Wizard with Error Boundary
 * Wrapped version for safe usage in pages
 *
 * @example
 * ```tsx
 * import { QuoteWizard } from './_components/quote-wizard';
 *
 * <QuoteWizard
 *   modelId={modelId}
 *   glassSolutions={glassSolutions}
 *   services={services}
 * />
 * ```
 */
export function QuoteWizard(props: QuoteWizardWithErrorBoundaryProps) {
  return (
    <QuoteWizardErrorBoundary>
      <QuoteWizardComponent {...props} />
    </QuoteWizardErrorBoundary>
  );
}
