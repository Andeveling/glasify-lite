# Contratos de Navegación (Next.js App Router)

## Route Groups Structure

### (public) - Rutas Públicas (sin autenticación)
- **Layout**: Navegación principal, footer, breadcrumbs
- **Rutas**:
  - `/catalog` - Listado de modelos con filtros
  - `/catalog/[modelId]` - Detalle de modelo específico  
  - `/quote` - Configuración de cotización
  - `/quote/review` - Revisión de cotización
- **Archivos especiales**:
  - `loading.tsx` - Estados de carga para rutas públicas
  - `error.tsx` - Manejo de errores públicos con opciones de recuperación
  - `not-found.tsx` - 404 público con navegación al catálogo

### (auth) - Rutas de Autenticación
- **Layout**: Diseño centrado, minimal, solo formularios
- **Rutas**:
  - `/signin` - Página de login con OAuth (Google)
- **Archivos especiales**:
  - `loading.tsx` - Estados de carga de autenticación
  - `error.tsx` - Errores de auth con opciones de redirect

### (dashboard) - Rutas Protegidas (requiere autenticación admin)  
- **Layout**: Sidebar de administración, contexto de admin
- **Rutas**:
  - `/dashboard` - Panel principal con estadísticas
  - `/dashboard/models` - Gestión de modelos CRUD
  - `/dashboard/quotes` - Gestión de cotizaciones recibidas
  - `/dashboard/settings` - Configuración de admin
- **Archivos especiales**:
  - `loading.tsx` - Estados de carga del dashboard
  - `error.tsx` - Errores de admin con contexto administrativo
  - `not-found.tsx` - 404 de admin con navegación del dashboard

## Estados Globales
- **Global error**: `global-error.tsx` - Errores catastróficos del sistema
- **Global not-found**: `not-found.tsx` - 404 general con navegación principal
- **Home redirect**: `/page.tsx` - Redirección automática a `/catalog`

## Middleware de Rutas
- **Público**: Sin restricciones de acceso
- **Auth**: Redirect si ya está logueado
- **Dashboard**: Verificación de autenticación admin obligatoria
  Refs: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware

## Componentes de Navegación
- **MainNavigation**: Para rutas públicas (catálogo, cotización)
- **DashboardSidebar**: Para rutas de administración  
- **Breadcrumbs**: Contexto de ubicación por route group
- **QuoteCounter**: Estado de cotización en rutas públicas
