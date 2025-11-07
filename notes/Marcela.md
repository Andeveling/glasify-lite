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

### Observación sobre la autenticación en la vista de carrito ✅

Se ha identificado que en la vista de carrito, al presionar el botón de "Cotización", se espera que el usuario sea forzado a autenticarse para obtener sus datos y completar el formulario de cotización.

**Problema detectado:**
- ~~Error "Failed to get session" (APIError runtime)~~ → **Causa raíz: UNAUTHORIZED en `tenantConfig.get`**
- El botón no detectaba correctamente si el usuario estaba autenticado
- Datos de sesión quedaban cacheados después de cerrar sesión
- El drawer se abría incluso sin autenticación válida
- **UI no se actualizaba después de logout** (mostraba nombre, email y menú de usuario aún después de cerrar sesión)

**Investigación con Browser Automation:**
- Error reportado: "Failed to get session"
- Error real en consola: `TRPCClientError: UNAUTHORIZED` para `tenantConfig.get`
- Queries afectadas: #2, #6, #7 (repetidos en cada navegación)
- Componente origen: `ModelsTableContent`, `CartIndicator` (llamadas desde público sin autenticación)
- Causa raíz: `tenantConfig.get` usaba `protectedProcedure` pero se invoca desde componentes públicos
- Impacto: La configuración de tenant (moneda, nombre comercial) es pública pero requería autenticación

**Recomendación:**
- Implementar un flujo que obligue al usuario a autenticarse antes de proceder con la cotización.
- Asegurarse de que el proceso de autenticación sea claro y rápido para no afectar la experiencia del usuario.

**Estado:** ✅ **Implementado**
- Se agregó verificación de sesión en tiempo real en `CartSummary`:
  - Hook `useSession()` con detección de errores (`error` field)
  - Estado reactivo que se actualiza cuando la sesión cambia
  - Prevención de apertura del drawer si no hay sesión válida
  - Modal de autenticación (`SignInModal`) se abre automáticamente para usuarios no autenticados
- Se agregó verificación adicional en `QuoteGenerationDrawer`:
  - Verifica sesión al abrir el drawer
  - Cierra automáticamente el drawer si la sesión expira mientras está abierto
  - Toast de notificación cuando se detecta sesión expirada
- Solución al problema de caché:
  - `useEffect` que monitorea cambios en `session` y `error`
  - Verificación en tiempo real en el `onClick` handler
  - `event.preventDefault()` y `event.stopPropagation()` para prevenir apertura del drawer sin autenticación
- **Solución al problema de UI después de logout**:
  - **Better Auth client-side logout**: `authClient.signOut()` en lugar de Server Action
  - **`useSession()` hook** para reactividad inmediata en el componente
  - Combina props iniciales (Server Component) con session reactiva (Client)
  - Manejo automático de cookie-cache por Better Auth (cookie invalidation)
  - **FIXME: `window.location.href = "/catalog"`** para forzar recarga completa de página
  - Solución drástica pero necesaria debido a race condition entre `useSession()` y `router.refresh()`
  - Estados de carga (`useTransition`, `useState`) en `UserMenu` para feedback visual
  - Botón deshabilitado durante logout con spinner
  - Texto "Cerrando sesión..." mientras procesa
  - **Patrón temporal**: `authClient.signOut()` → `window.location.href` = Recarga forzada de página
  - **Ideal (futuro)**: `authClient.signOut()` → `useSession()` actualiza → `router.refresh()` → UI actualizada sin reload
- **Solución al problema UNAUTHORIZED en tenantConfig**:
  - Cambio de `protectedProcedure` a `publicProcedure` en `/server/api/routers/admin/tenant-config.ts`
  - Procedimientos afectados: `get` y `getCurrency`
  - Justificación: Datos de configuración del tenant (moneda, nombre comercial, días validez) son públicos
  - Componentes beneficiados: `CartIndicator`, formatters de precio, `ModelsTableContent`
  - Validación: Browser automation confirmó eliminación de errores UNAUTHORIZED
- Flujo mejorado:
  - Usuario no autenticado → Click en "Generar Cotización" → Modal de login
  - Usuario autenticado → Click en "Generar Cotización" → Drawer del formulario
  - Sesión expira mientras drawer está abierto → Drawer se cierra + Toast de error
  - Usuario hace logout → UI se actualiza inmediatamente mostrando menú de invitado


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