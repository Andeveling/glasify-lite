---
name: "US-003: Simplificar campos de dirección en cotización"
about: Reducción de campos de ubicación para menor fricción
title: "US-003: Simplificar campos de dirección en cotización"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Cliente final  
**Quiero** completar solo los campos esenciales de ubicación  
**Para** reducir la fricción al enviar mi cotización

---

## ✅ Criterios de Aceptación

- [ ] El formulario de cotización tiene solo estos campos de ubicación:
  - Proyecto/Nombre (opcional)
  - Ciudad/Municipio (requerido)
  - Región/Departamento/Provincia (requerido, select)
  - Barrio/Localidad (opcional, texto libre)
- [ ] NO se solicita código postal
- [ ] El campo `contactAddress` se depreca pero mantiene compatibilidad en Base de Datos
- [ ] Los valores de región se cargan dinámicamente según país del tenant (ej. provincias de Panamá)

---

## 🔧 Notas Técnicas

**Cambios en Prisma Schema:**
```prisma
model Quote {
  // Campos nuevos:
  projectName String? // ej. "Casa Los Pinos"
  projectCity String // ej. "Chitré"
  projectRegion String // ej. "Herrera" (select)
  projectNeighborhood String? // ej. "Zona Centro" (texto libre)
  
  // Campo deprecated (mantener por compatibilidad):
  contactAddress String? @deprecated("Usar projectCity, projectRegion, projectNeighborhood")
  
  // Otros campos existentes...
}
```

**Migraciones:**
```sql
ALTER TABLE Quote 
ADD COLUMN projectName VARCHAR(255),
ADD COLUMN projectCity VARCHAR(255) NOT NULL,
ADD COLUMN projectRegion VARCHAR(255) NOT NULL,
ADD COLUMN projectNeighborhood VARCHAR(255);

-- Migración de datos existentes (si aplica)
UPDATE Quote 
SET projectCity = COALESCE(SUBSTRING_INDEX(contactAddress, ',', 1), 'Por especificar')
WHERE projectCity IS NULL;
```

**Validación Zod:**
```typescript
const quoteLocationSchema = z.object({
  projectName: z.string().max(150).optional(),
  projectCity: z.string().min(2).max(100),
  projectRegion: z.string().min(2).max(100),
  projectNeighborhood: z.string().max(100).optional(),
});
```

**Datos Dinámicos de Regiones:**
- Crear archivo: `src/lib/data/countries.json`
- Estructura: `{ "PA": { "name": "Panamá", "regions": [...] }, ... }`
- Helper: `getRegionsByCountry(countryCode: string): string[]`

---

## 📝 Tareas de Implementación

### Backend
- [ ] Crear migración Prisma
- [ ] Actualizar schema Prisma
- [ ] Actualizar validación Zod de Quote
- [ ] Endpoint tRPC: modificar `quotes.create` y `quotes.update`

### Frontend
- [ ] Formulario: reemplazar `contactAddress` con nuevos campos
- [ ] Dropdown de regiones (populate dinámicamente)
- [ ] Formulario de Budget/Quote actualizado
- [ ] Wizard (US-007): integrar nuevos campos

### Data
- [ ] Crear `src/lib/data/countries.json` con regiones
- [ ] Para Panamá: 10 provincias
- [ ] Para Colombia: 32 departamentos + 1 capital (futuro)

### Testing
- [ ] Unit: validaciones de ubicación
- [ ] Integration: CRUD de cotizaciones con nuevos campos
- [ ] E2E: formulario completo

---

## 🎯 Métricas de Éxito

- Reducción de campos: de 6+ a 4 esenciales
- Tiempo de llenado reducido: -40% respecto a versión anterior
- 0 errores de validación con nuevos campos

---

## 📚 Referencias

- Épica: Simplificación de Dirección
- Sprint: 2 (Media Prioridad)
- Estimación: **2 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-007: Wizard minimalista (integración)
- US-016: Configurar regiones por país
