/**
 * Catalog Header Component
 * Issue: #002-ui-ux-requirements
 *
 * Minimalist header inspired by Saleor Storefront
 * Clean typography, generous spacing, professional tone
 */
export function CatalogHeader() {
  return (
    <div className="mb-8 space-y-1">
      <h2 className="font-semibold text-2xl tracking-tight">Catálogo de Productos</h2>
      <p className="text-foreground/60 text-sm">
        Explore nuestra selección de productos de vidrio para encontrar la solución perfecta para su proyecto.
      </p>
    </div>
  );
}
