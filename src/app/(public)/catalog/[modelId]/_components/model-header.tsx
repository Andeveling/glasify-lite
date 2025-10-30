/**
 * Model Header Component
 * Displays model information above the wizard
 */

type ModelHeaderProps = {
  model: {
    id: string;
    name: string;
    basePrice: number;
    description?: string | null;
  };
};

export function ModelHeader({ model }: ModelHeaderProps) {
  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl md:text-3xl">{model.name}</h1>
        {model.description && (
          <p className="text-muted-foreground">{model.description}</p>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-muted-foreground text-sm">Precio base:</span>
        <span className="font-semibold text-lg">
          ${model.basePrice.toFixed(2)}
        </span>
      </div>
    </div>
  );
}
