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
