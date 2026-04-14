# Integrations — External Services & APIs

## Authentication

### better-auth (v1.5.6)
Internal authentication system. Uses Account/Session models with `@map()` annotations for legacy NextAuth compatibility.

**Models:** `Account`, `Session`, `User`, `VerificationToken`, `Verification`

### Session Management
- JWT or session-based auth
- Multi-account support per user
- Refresh token rotation

## Database

### SQLite via libsql
- **File location:** `./prisma/dev.db`
- **Adapter:** `@prisma/adapter-libsql` + `@libsql/client`
- **Prisma client:** Generated to `prisma/generated/client`

Configuration in `prisma.config.ts`. Uses `DATABASE_URL` env var.

## AI/ML Integrations

### MiniMax AI
- Provider: `vercel-minimax-ai-provider` (v0.0.2)
- Used for streaming AI responses
- Part of AI chat interface for model assistant

### AI SDK
- Framework: `ai` (v6.0.159) + `@ai-sdk/react`
- Streaming UI components via ai-elements
- Tools for model operations

## File Storage

### Local File System
- Logo uploads stored locally
- Path: configurable via env

### Sharp (v0.34.5)
- Image processing for uploads
- Resize, format conversion

## Communication

### Email Service
- `src/server/services/email.ts`
- Transactional emails

### WhatsApp Integration
- Configured via `TenantConfig.whatsappNumber`
- Floating button in catalog/quotes when enabled

### Geocoding Service
- `src/server/services/geocoding.service.ts`
- Used for address/location features

## Export/Generation

### Excel Export
- Library: `exceljs` (v4.4.0)
- Quote Excel workbooks: `src/lib/export/excel/quote-excel-workbook.ts`
- Styles: `src/lib/export/excel/excel-styles.ts`

### PDF Generation
- Library: `@react-pdf/renderer` (v4.3.3)
- Quote PDF documents: `src/lib/export/pdf/quote-pdf-document.tsx`
- Styles: `src/lib/export/pdf/pdf-styles.ts`

## External APIs

### Geocoding
- Location services for address handling
- Haversine distance calculation

### Transportation/Logistics
- `src/server/services/transportation.service.ts`
- Transport rate calculation based on `TenantConfig.transportBaseRate` and `transportPerKmRate`

## Analytics/Dashboard

### Dashboard Metrics
- `src/server/services/dashboard-metrics.ts`
- Quote statistics
- Price history tracking

### Glass/Model Price History
- `src/server/services/glass-price-history.service.ts`
- `src/server/services/model-price-history.service.ts`
- Tracks price changes over time

## Webhooks/WebSockets

### WebSocket Server
- Library: `ws` (v8.20.0)
- Real-time features in the application

## Social Media

### TenantConfig Branding
- `facebookUrl`
- `instagramUrl`
- `linkedinUrl`
- Displayed in quotes/branding

## Search & Filtering

### Table Parameters Parser
- `src/lib/utils/table-params-parser.ts`
- Cursor-based pagination: `src/lib/utils/cursor-pagination.ts`

### Table Query Builder
- `src/lib/utils/table-query-builder.ts`
- Dynamic query construction

## AI Agent System

### Model Assistant
- `src/server/ai/agents/model-assistant.agents.ts`
- `src/server/ai/agents/model-assistant.executor.ts`
- `src/server/services/model-assistant.service.ts`
- Session management: `src/server/services/model-assistant-message.service.ts`
- Tools: `src/server/ai/tools/model-tools.ts`, `src/server/ai/tools/catalog-tools.ts`
- MiniMax provider: `src/server/ai/providers/minimax.ts`

## Known Integration Notes

1. **compatibleGlassTypeIds** is stored as JSON string (not array) in SQLite. When reading: `JSON.parse(model.compatibleGlassTypeIds)`. 30+ files still assume it's an array — architectural debt.

2. **better-sqlite3 won't compile** on Node 25. Use `@libsql/client` + `@prisma/adapter-libsql` instead.

3. Prisma generated client is at `prisma/generated/client` — NOT `@prisma/client`.