# Log

## 2026-04-13

### Limpieza: remove pricing del sistema y estructura de archivos

**Ambas violate el principio del wiki**: documentar al cliente, no al sistema.

**Perfil de cliente (`profile.md`)**:
- Eliminada sección "Consideraciones para el Sistema CPQ" (fórmulas, restricciones dimensionales, compatibilidad con schema)
- Eliminada sección "Estructura de Archivos de Datos" (árbol de archivos del proyecto)
- Eliminada referencia a `[[pricing-formula]]`

**Preset (`presets.md`)**:
- Eliminada sección "Sistema de Precios" (explicaba cómo calcula Glasify, no cómo cotiza Vitro Rojas manualmente)
- Eliminada sección "Estructura de Archivos"
- Eliminada referencia a `[[pricing-formula]]`

**Resultado**: ambos documentos ahora describen al cliente — quién es, qué vende, con quién trabaja — sin mezcla con detalles de implementación del sistema CPQ.

---

### Corrección: pricing NO es por m²

**Error**: En `profile.md` se indicó que `basePrice` era "USD/m²". **Incorrecto.**

**Corrección aplicada**:
- Columnas de tablas: "Base USD/m²" → "`basePrice USD`"
- Sección de pricing: corregida la fórmula para incluir `colorMultiplier` (que estaba faltando)
- Añadida nota aclaratoria sobre qué es `basePrice` vs `pricePerSqm` del vidrio

**Fuente correcta**: `src/domain/pricing/core/services/profile-calculator.ts`

**Archivos creados:**
- `wiki/wiki/30-clients/01-vitro-rojas/profile.md` — Perfil completo de cliente

**Fuentes consultadas:**
- `prisma/data/clients/vitro-rojas/tenant-config.data.ts`
- `prisma/data/clients/vitro-rojas/models-sliding.data.ts`
- `prisma/data/clients/vitro-rojas/models-casement.data.ts`
- Sitio web: vitrorojas.com (no pudo ser scrapeado — navegador no disponible)

**Contenido del perfil:**
- Identificación (nombre, país, industria, mercado)
- Contacto (email, teléfono, dirección)
- Catálogo completo (9 modelos: 6 corredizos + 3 abatibles)
- Proveedores (Extralum, Vidriera Nacional, Guardian Glass)
- Configuración TenantConfig
- Consideraciones de pricing y restricciones dimensionales

**Cambios en index:**
- Actualizada seccion 30-clients para reflejar estructura real
- Eliminados enlaces a paginas que no existen (stubs planeados)
- Agregados enlaces a profile.md y presets.md con rutas correctas

---

### Nuevo: Calculo de Precios en PYMES LATAM

**Archivo creado**: `wiki/wiki/20-manufacturers/calculo-precios-pymes-latam.md`

**Contenido**: Dominio de calculo de precios en talleres y fabricas de ventanas en LATAM. Tres metodos documentados:
1. Precio por m2 (el mas comun para cotizaciones rapidas)
2. Desglose por componentes (perfil + vidrio + accesorios + mano de obra + margen)
3. Tablas de precio unitario estandar (para empresas constructoras)

Tambien cubre: variables clave (tamano, apertura, vidrio, aislamiento, acabados) y flujo tipico en talleres.

**Relacionado**: Conecta con [[pricing-formula]] (como Glasify implementa estos metodos) y [[ecosistema-participantes]] (contexto de fabricantes).

---

### Nuevo: Plan de Calibracion de Precios Vitro Rojas

**Archivo creado**: `wiki/wiki/30-clients/01-vitro-rojas/calibracion-precios.md`

**Problema que resuelve**: Juan no sabe como pasar de su lista de precios por componente (perfil marco $45, rueda $3, metro felpa $0.30...) a los parametros abstractos de Glasify (`basePrice`, `costPerMmWidth`, `costPerMmHeight`).

**Contenido**:
- CORRECCION CLAVE: precios de proveedor son por **barra de 5.8m**, no por unidad
- Concepto de bundle: `costPerMmWidth` = suma de todos los perfiles horizontales por mm (marco sup/inf + guia traslape + hoja anchos). `costPerMmHeight` = suma de todos los perfiles verticales por mm (marco izq/der + hoja largos)
- Logica de calculo: costo por mm = (cantidad_perfiles × mm_extra × costo_metro_del_perfil)
- Ejemplo: costPerMmWidth = (2×$7.76 + 1×$0.50 + 4×$6.03)/m = $0.04014/mm
- Calculo completo de bundles para VC Panama 2 Panos: costPerMmWidth=$0.0401, costPerMmHeight=$0.0396, basePrice=$236.04
- Factor de desperdicio de barra (87% rendimiento)
- Paso 5: verificacion con dos ventanas (900x900 y 1500x1200mm)
- Resumen del proceso en 9 pasos

---

### Nuevo: Plan de Onboarding de Calibracion para PYMES

**Archivo creado**: `wiki/wiki/30-clients/01-vitro-rojas/onboarding-calibracion.md`

**Problema que resuelve**: Juan no puede integrarse a Glasify porque los parametros abstractos (basePrice, costPerMmWidth, costPerMmHeight) no tienen sentido para el. El sistema debe adaptarse al lenguaje de Juan, no al reves.

**Contenido**:
- Diagnostico de friccion: Juan piensa en costos de fabricacion, no en bundles ni mm
- Estrategia: wizard de calibracion en 5 pasos que habla el idioma de Juan
- Paso 1: Datos del negocio (TenantConfig) - nombre, moneda, proveedor
- Paso 2: Seleccionar plantilla de modelo con min/max predefinidos (Juan solo elige OX, XOX, etc.)
- Paso 3: Precios del proveedor - Juan ingresa "$45 por barra" sin calculos, el sistema deduce $/m automaticamente
- Paso 4: Dos ventanas de referencia - Juan ingresa dimensiones y costo real de fabricacion, sistema resuelve parametros automaticamente
- Paso 5: Revision y validacion - breakdown visual, verificacion con ventanas de referencia
- Logica interna del sistema: como resuelve el sistema de ecuaciones automaticamente
- ModelCostBreakdown: como se almacena el detalle de componentes en el schema existente
- Validacion post-calibracion: como Juan ajusta margen, recalibra, y compara con cotizaciones reales
- Alternativa: modo directo sin ventanas de referencia (si Juan conoce MO con precision)
- Roadmap de implementacion en 4 fases (MVP, UX, multi-modelo, inteligencia de negocio)
- Tabla comparativa: sin wizard vs con wizard (20 min vs 4 horas de configuracion)
