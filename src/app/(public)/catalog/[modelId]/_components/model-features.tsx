import { Info } from 'lucide-react';
import { Card } from '@/components/ui/card';

type ModelFeaturesProps = {
  features: string[];
};

export function ModelFeatures({ features }: ModelFeaturesProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center gap-2">
        <Info className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Características</h3>
      </div>
      <ul className="space-y-2">
        {features.map((feature) => (
          <li className="flex items-start gap-2 text-sm" key={feature}>
            <span className="mt-0.5 text-primary">✓</span>
            <span className="text-muted-foreground">{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
