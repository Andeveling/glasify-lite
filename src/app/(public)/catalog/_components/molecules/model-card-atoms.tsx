/**
 * ProductImagePlaceholder - Placeholder for product images
 */
export function ProductImagePlaceholder({
  productName,
}: {
  productName: string;
}) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-muted">
      <div className="text-center">
        <div className="mb-2 text-4xl text-muted-foreground">📦</div>
        <p className="text-muted-foreground text-sm">{productName}</p>
      </div>
    </div>
  );
}

/**
 * ProductPrice - Display product price
 */
export function ProductPrice({ price }: { price: string }) {
  return <span className="font-bold text-foreground text-lg">{price}</span>;
}
