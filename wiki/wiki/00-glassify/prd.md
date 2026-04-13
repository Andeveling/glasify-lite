# PRD — Product Requirements Document

**Summary**: Glasify Lite v2.0 es un sistema CPQ (Configure-Price-Quote) donde el Admin/Comercial configura ventanas para el cliente final.

**Sources**: (source: internal)

**Last updated**: 2026-04-13

---

## ¿Qué ES Glasify?

> **"Glasify es un CPQ, NO una tienda."**

Glasify permite que un Admin o Comercial configure una ventana a medida (modelo, dimensiones, vidrio, colores, servicios) y genere un Quote formal con precio para asesorar a un cliente.

- ✅ Sistema CPQ (Configure-Price-Quote)
- ✅ Admin gestiona catálogo (modelos, vidrios, colores, precios)
- ✅ Comercial genera quotes para clientes
- ✅ Brief automático para asesorar con contexto
- ✅ Exportación PDF/Excel con branding

## ¿Qué NO ES?

- ❌ E-commerce / portal self-service
- ❌ Catálogo público para clientes finales
- ❌ Multi-tenant
- ❌ Google OAuth / PostgreSQL

## Modelo CPQ

```
Cliente contacta al Comercial (WhatsApp, llamada)
         ↓
Comercial configura ventana en CPQ
  - Modelo (ventana/puerta)
  - Dimensiones (ancho x alto en mm)
  - Vidrio (tipo y espesor)
  - Color
  - Servicios (instalación, templado, etc.)
         ↓
Sistema calcula precio en tiempo real (<200ms)
         ↓
Comercial genera Quote formal
         ↓
Exporta PDF/Excel o envía directamente al cliente
```

## Roles

| Rol | Responsabilidad | Acceso |
|-----|-----------------|--------|
| **Admin** | Gestiona catálogo completo | `/admin/*` |
| **Comercial** | Usa CPQ para quotes | `/admin/quotes/*` |

**Nota**: El "Cliente" final (quien pide la ventana) NO tiene acceso al sistema.

## Métricas

- ⏱️ Tiempo creación quote via CPQ: **<2 min**
- 📈 Tasa de conversión Quote→Venta: **>50%**
- 📉 Reducción carga operativa: **60%**

## Estados de Quote

- `draft`: En edición
- `sent`: Enviada al cliente
- `canceled`: Cancelada

## Fuera del Alcance

- ❌ Portal self-service para clientes
- ❌ Catálogo público
- ❌ Google OAuth
- ❌ Multi-tenant
- ❌ SEO / SSR para indexación

## Related pages

- [[brief]] — Brief completo del proyecto
- [[tech-stack]]
- [[entities]]
- [[pricing-formula]]
