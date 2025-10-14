import { Award, Info, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ModelFeaturesProps = {
  features: string[];
};

// ✅ Move to module scope - created once, not on every render
const HIGHLIGHT_KEYWORDS = [ 'excelente', 'máxima', 'excepcional', 'alta reducción', 'óptimo', 'superior' ];

/**
 * Determines if a feature highlights exceptional performance
 * @param feature - Feature text to check
 * @returns true if feature contains highlight keywords
 */
function isHighlightFeature(feature: string): boolean {
  return HIGHLIGHT_KEYWORDS.some((keyword) => feature.toLowerCase().includes(keyword));
}

/**
 * Displays model features and material-derived benefits
 * Features array is enhanced by adaptModelFromServer to include material-specific benefits
 *
 * User Story 3: Review Product Features and Benefits (Priority P2)
 * - Shows 4-8 practical benefit bullets
 * - Material-aware: PVC = thermal focus, Aluminum = structural focus
 * - Highlights key strengths based on performance ratings
 *
 * Performance: Helper function and constants moved to module scope to prevent re-creation on re-renders
 */
export function ModelFeatures({ features }: ModelFeaturesProps) {
  // Sort features so highlights come first
  const sortedFeatures = [ ...features ].sort((a, b) => {
    const aIsHighlight = isHighlightFeature(a);
    const bIsHighlight = isHighlightFeature(b);

    // If both are highlights or both are not, maintain original order
    if (aIsHighlight === bIsHighlight) return 0;

    // Highlights come first
    return aIsHighlight ? -1 : 1;
  });

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Características Destacadas</h3>
      </div>
      <ul className="space-y-2.5">
        {sortedFeatures.map((feature, index) => {
          const isHighlight = isHighlightFeature(feature);
          return (
            <li className="flex items-start gap-2 text-sm" key={index}>
              {isHighlight ? (
                <Sparkles aria-label="Característica destacada" className="mt-0.5 h-4 w-4 shrink-0 text-yellow-500" />
              ) : (
                <Award aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary/70" />
              )}
              <span className={isHighlight ? 'font-medium' : 'text-muted-foreground'}>{feature}</span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
