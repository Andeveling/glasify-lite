/**
 * TODOs para la nueva implementación:
 *
 * 1. Obtener el modelo por ID usando tRPC (get-model-by-id)
 * 2. Mostrar columna izquierda con info del modelo:
 *    - Nombre
 *    - Fabricante
 *    - Tipo de vidrio compatible
 *    - Precio base
 *    - Dimensiones mínimas/máximas
 *    - Imagen (si existe)
 *    - Especificaciones técnicas
 * 3. Mostrar columna derecha con formulario de parametrización:
 *    - Ancho (mm)
 *    - Alto (mm)
 *    - Cantidad
 *    - Servicios adicionales (pulido, corte, etc.)
 *    - Observaciones
 *    - Validación con Zod (modelParametrizationSchema)
 *    - Botón "Añadir a cotización"
 * 4. Manejar loading y error states
 * 5. Mostrar resumen de precio calculado en tiempo real
 * 6. Navegación segura (volver al catálogo si el modelo no existe)
 * 7. Accesibilidad y responsividad
 * 8. Logging de eventos relevantes (Winston)
 *
 * @returns Página de parametrización de modelo para cotización
 */
export default function ModelFormPage() {
  return (
    <div className="container mx-auto max-w-7xl">
      <div>columna 1: info del modelo</div>
      <div>columna 2: formulario de parametrización</div>
    </div>
  );
}
