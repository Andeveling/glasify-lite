### Observación sobre la navegación en vistas ✅

En las vistas de catálogo y el formulario de modelo, se ha identificado la ausencia de botones de "Ir hacia atrás". Esto genera confusión en los usuarios, ya que no pueden regresar fácilmente a una página anterior que desean volver a visitar.

**Recomendación:**
- Agregar botones de navegación hacia atrás en estas vistas para mejorar la experiencia del usuario.
  `/src/components/ui/back-link.tsx`

**Estado:** ✅ **Implementado**
- Se agregó el componente `BackLink` en:
  - `/catalog/page.tsx` → "Volver al Inicio"
  - `/catalog/[modelId]/page.tsx` → "Volver al Catálogo"
- Usa el componente atómico existente con iconos y estilos consistentes


### Observación sobre el formulario del modelo y el scroll ✅

Se ha identificado que los usuarios se confunden al terminar de llenar el formulario del modelo. Cuando hacen scroll hacia arriba, el formulario aparece deshabilitado para agregar al carrito, lo que genera confusión.

**Recomendación:**
- Implementar una funcionalidad que detecte el scroll hacia arriba y reinicie automáticamente el formulario si no se ha ejecutado ninguna acción.
- Asegurarse de que esta funcionalidad sea intuitiva y no interfiera con la experiencia del usuario.

**Estado:** ✅ **Implementado**
- Se creó el hook personalizado `useScrollResetForm` que:
  - Detecta cuando el usuario hace scroll hacia arriba después de agregar al carrito
  - Reinicia automáticamente el formulario cuando el usuario vuelve a la zona de configuración
  - Aplica principios de UX: "Don't Make Me Think", "Error Prevention"
- Se agregó un mensaje informativo: "💡 Puedes hacer scroll arriba para configurar otra ventana"
- Threshold configurable (100px por defecto) para evitar reinicios accidentales
- Buffer de 200px para determinar cuándo el usuario está sobre el card de éxito
- Implementado en `model-form.tsx` con integración transparente

### Observación sobre la edición de ítems en la vista de cotizaciones

Se ha identificado que los usuarios experimentan confusión al intentar modificar un ítem ya agregado al carrito en la vista de cotizaciones. Actualmente, no es posible editar parámetros como el tipo de vidrio o las medidas una vez que el ítem forma parte de la cotización.

**Recomendación:**
- Implementar una funcionalidad que permita a los usuarios editar parámetros clave de los ítems cotizados, como el tipo de vidrio y las medidas, directamente desde la vista de cotizaciones.
- Asegurarse de que esta funcionalidad sea accesible y fácil de usar para mejorar la experiencia del usuario.

### Observación sobre la vista de carrito

Se ha identificado que los usuarios presentan confusión en la vista de carrito debido a la falta de dibujos o representaciones visuales de los modelos cotizados. Además, se ha detectado la necesidad de permitir modificaciones en los anchos, los altos y el tipo de vidrio de los ítems en el carrito.

**Recomendación:**
- Incluir dibujos o representaciones visuales de los modelos cotizados en la vista de carrito para facilitar la identificación de los ítems.
- Implementar funcionalidades que permitan modificar los anchos, los altos y el tipo de vidrio directamente desde la vista de carrito.
- Asegurarse de que estas funcionalidades sean intuitivas y mejoren la experiencia del usuario.

### Observación sobre la autenticación en la vista de carrito

Se ha identificado que en la vista de carrito, al presionar el botón de "Cotización", se espera que el usuario sea forzado a autenticarse para obtener sus datos y completar el formulario de cotización.

**Recomendación:**
- Implementar un flujo que obligue al usuario a autenticarse antes de proceder con la cotización.
- Asegurarse de que el proceso de autenticación sea claro y rápido para no afectar la experiencia del usuario.


### Observación sobre la búsqueda de rangos de medidas y direcciones de apertura

Se ha identificado que los usuarios experimentan confusión al buscar los rangos de medidas y las direcciones de apertura de las ventanas en el catálogo.

**Recomendación:**
- Mejorar la claridad y organización de la información relacionada con los rangos de medidas y las direcciones de apertura.
- Considerar agregar filtros o herramientas de búsqueda más intuitivas para facilitar la navegación.

### Observación sobre las unidades de medida

Se ha identificado que los usuarios presentan dificultades al introducir las medidas en milímetros. Algunos usuarios han solicitado la opción de utilizar otras unidades de medida como centímetros, metros y pulgadas.

**Recomendación:**
- Implementar un selector de unidades de medida que permita a los usuarios elegir entre milímetros, centímetros, metros y pulgadas.
- Asegurarse de que las conversiones entre unidades sean precisas y claras para evitar confusiones.