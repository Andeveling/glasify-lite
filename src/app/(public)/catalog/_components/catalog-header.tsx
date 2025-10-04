/**
 * Catalog Header Component
 * Issue: #002-ui-ux-requirements
 *
 * Presentational component - displays catalog title and description.
 * Pure component with no business logic.
 */
export function CatalogHeader() {
  return (
    <header className="mb-8">
      <h1 className="mb-2 font-bold text-3xl text-foreground">Catálogo de Vidrios</h1>
      <p className="text-lg text-muted-foreground">
        Explore nuestra amplia selección de modelos de vidrio para encontrar la solución perfecta para su proyecto.
      </p>
    </header>
  );
}
