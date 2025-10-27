---
name: "US-016: Configurar regiones/provincias por país"
about: Soporte multi-país con regiones dinámicas
title: "US-016: Configurar regiones/provincias por país"
labels: ["feature", "vitro-rojas", "media-prioridad", "sprint-2", "backend"]
projects: ["glasify-lite"]
assignees: []
---

## 📋 Descripción de la Historia

**Como** Admin de Vitro Rojas (Panamá)  
**Quiero** que los clientes seleccionen provincias panameñas en vez de departamentos colombianos  
**Para** adaptar la plataforma a mi mercado local

---

## ✅ Criterios de Aceptación

- [ ] TenantConfig tiene campo `country` (ISO 3166-1 alpha-2: PA, CO, MX, etc.)
- [ ] Al seleccionar país, el sistema carga lista de regiones correspondiente:
  - Panamá: Bocas del Toro, Coclé, Colón, Chiriquí, Darién, Herrera, Los Santos, Panamá, Veraguas, Panamá Oeste
  - Colombia: Antioquia, Bogotá D.C., Valle del Cauca, etc.
  - México: Estados mexicanos
- [ ] El dropdown de región en formularios se ajusta automáticamente
- [ ] El sistema soporta agregar países nuevos sin modificar código (JSON config)

---

## 🔧 Notas Técnicas

**Archivo de Datos: `src/lib/data/countries.json`**
```json
{
  "PA": {
    "name": "Panamá",
    "regions": [
      "Bocas del Toro",
      "Coclé",
      "Colón",
      "Chiriquí",
      "Darién",
      "Herrera",
      "Los Santos",
      "Panamá",
      "Panamá Oeste",
      "Veraguas"
    ]
  },
  "CO": {
    "name": "Colombia",
    "regions": [
      "Amazonas",
      "Antioquia",
      "Arauca",
      "Atlántico",
      "Bolívar",
      "Boyacá",
      "Caldas",
      "Caquetá",
      "Cauca",
      "Cesar",
      "Chocó",
      "Córdoba",
      "Cundinamarca",
      "Distrito Capital",
      "Guainía",
      "Guaviare",
      "Huila",
      "La Guajira",
      "Magdalena",
      "Meta",
      "Nariño",
      "Norte de Santander",
      "Putumayo",
      "Quindío",
      "Risaralda",
      "Santander",
      "Sucre",
      "Tolima",
      "Valle del Cauca",
      "Vaupés",
      "Vichada"
    ]
  },
  "MX": {
    "name": "México",
    "regions": [
      "Aguascalientes",
      "Baja California",
      "Baja California Sur",
      "Campeche",
      "Chiapas",
      "Chihuahua",
      "Ciudad de México",
      "Coahuila",
      "Colima",
      "Durango",
      "Guanajuato",
      "Guerrero",
      "Hidalgo",
      "Jalisco",
      "México",
      "Michoacán",
      "Morelos",
      "Nayarit",
      "Nuevo León",
      "Oaxaca",
      "Puebla",
      "Querétaro",
      "Quintana Roo",
      "San Luis Potosí",
      "Sinaloa",
      "Sonora",
      "Tabasco",
      "Tamaulipas",
      "Tlaxcala",
      "Veracruz",
      "Yucatán",
      "Zacatecas"
    ]
  }
}
```

**Actualización TenantConfig:**
```prisma
model TenantConfig {
  country String @default("PA") // ISO 3166-1 alpha-2
  
  // Otros campos...
}
```

**Helper Functions:**
```typescript
// src/lib/utils/countries.ts
export function getRegionsByCountry(countryCode: string): string[] {
  const countriesData = require('./data/countries.json')
  return countriesData[countryCode]?.regions ?? []
}

export function getCountryName(countryCode: string): string {
  const countriesData = require('./data/countries.json')
  return countriesData[countryCode]?.name ?? countryCode
}
```

---

## 📝 Tareas de Implementación

### Data & Backend
- [ ] Crear archivo `src/lib/data/countries.json`
- [ ] Agregar campo `country` a TenantConfig
- [ ] Migración Prisma
- [ ] Crear helpers: `getRegionsByCountry()`, `getCountryName()`
- [ ] Endpoint tRPC: `admin.tenant.updateCountry`

### Frontend
- [ ] Componente `CountrySelect.tsx` (admin)
- [ ] Hook `useRegions(countryCode)` - carga regiones dinámicamente
- [ ] Integración en:
  - Formulario de cotización (cargar regiones según tenant)
  - Budget Cart
  - Quote detail
- [ ] Caché: almacenar regiones en estado local (no re-fetch)

### Validaciones
- [ ] Zod: `projectRegion` validado contra lista de regiones del país
- [ ] Error: "Región no válida para país [XX]"

### Testing
- [ ] Unit: `getRegionsByCountry()` devuelve lista correcta
- [ ] E2E: cambiar país → regiones se actualizan automáticamente

### Futuro
- [ ] Admin panel: selector de país en tenant config
- [ ] Agregar más países sin cambiar código

---

## 🎯 Métricas de Éxito

- Panamá: 10 provincias disponibles
- Colombia: 32 departamentos + 1 capital
- 0 errores de validación regional
- Futuro: soporta +10 países

---

## 📚 Referencias

- Épica: Configuración Multi-Tenant
- Sprint: 2 (Media Prioridad)
- Estimación: **3 puntos**
- Cliente: Vitro Rojas (Panamá)

---

## 🔗 Historias Relacionadas

- US-003: Simplificar dirección (usa regiones)
