# Routes — Application Routes

**Summary**: Rutas de acceso — solo /sign-in y /sign-up son públicas; todo lo demás requiere auth.

**Sources**: (source: internal)

**Last updated**: 2026-04-13

---

## Arquitectura de Acceso

```
🌐 Pública (sin auth)
├── /sign-in
└── /sign-up

🔒 Privada (auth requerida)
```

## Rutas Públicas

| Ruta | Descripción |
|------|-------------|
| `/sign-in` | Login con email/password |
| `/sign-up` | Registro de usuarios |

**Nota**: SSR ahora es solo para seguridad (auth checks), NO para SEO.

## Rutas Privadas — Admin

```
/admin
├── /admin/models              → CRUD modelos de ventanas/puertas
├── /admin/glass-types        → CRUD tipos de vidrio
├── /admin/glass-solutions    → CRUD soluciones de vidrio
├── /admin/glass-suppliers    → CRUD proveedores de vidrio
├── /admin/profile-suppliers  → CRUD proveedores de perfiles
├── /admin/colors             → CRUD colores
├── /admin/design-templates   → CRUD templates de diseño
├── /admin/services           → CRUD servicios adicionales
├── /admin/clients            → CRUD clientes
├── /admin/quotes             → Dashboard de quotes
│   ├── /admin/quotes/new     → Nueva quote (CPQ)
│   └── /admin/quotes/[quoteId] → Editar quote
├── /admin/branding           → Configuración de marca (logo, colores)
└── /admin/metrics            → Métricas del sistema
```

## Rutas Privadas — Settings

```
/settings
├── /settings/tenant          → Configuración del tenant
└── /settings/suppliers      → Gestión de proveedores
```

## Decisión de Arquitectura

**Modelo CPQ vs Self-Service:**

| Aspecto | Anterior (v1.6) | Actual (v2.0) |
|---------|------------------|----------------|
| Catálogo | Público (`/catalog`) | Solo Admin (`/admin`) |
| Cliente | Self-service | Contacta al Comercial |
| Auth | Google OAuth | Email/Password |
| SEO | Importante | No relevante |

**¿Por qué CPQ?**
- El mercado prefirió que un collaborator/admin gestione la herramienta
- El cliente final no tiene acceso — contacta al Comercial por WhatsApp/teléfono
- El Comercial genera quotes con contexto completo para asesorar mejor

## Related pages

- [[prd]]
- [[entities]]
