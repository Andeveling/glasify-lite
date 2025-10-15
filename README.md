# Glasify Lite - Glass Quotation Management System

**Project Type**: Full-stack glass quotation management application  
**Tech Stack**: Next.js 15 (App Router) + tRPC + Prisma + PostgreSQL  
**Status**: MVP with RBAC implementation in progress  
**Last Updated**: 15 de octubre de 2025

---

## Overview

Glasify Lite is a pre-sale on-demand quotation tool designed for glass and window manufacturers. It accelerates the quotation process from 15 days to 5 minutes, providing instant pricing for custom glass solutions while generating qualified leads for sales teams.

### What Glasify IS
- ✅ A quotation accelerator for custom glass manufacturing
- ✅ A lead qualifier with automatic briefs for sales teams
- ✅ An admin catalog manager for models, glass types, and pricing
- ✅ A benefit-based glass solution explorer (thermal, acoustic, security)

### What Glasify IS NOT
- ❌ An e-commerce store with inventory
- ❌ A shopping cart system with online purchases
- ❌ A complete ERP or manufacturing management system

---

## Key Features

### 🔐 Role-Based Access Control (RBAC)
- **Three User Roles**: Admin, Seller, Client
- **Multi-Layer Authorization**: Database → Middleware → tRPC → UI
- **Route Protection**: Middleware guards for `/dashboard/*`, `/my-quotes/*`
- **Data Filtering**: Users see only their own quotes, admins see all
- **Type-Safe Sessions**: NextAuth v5 with role information in session token

### 📊 Admin Dashboard (In Progress)
- Complete catalog management (models, glass types, services)
- Price history tracking with audit trail
- Tenant configuration (currency, locale, quote validity)
- View all quotes across all users

### 💰 Instant Quotation System
- Real-time pricing calculation (<200ms SLA)
- Multi-dimensional glass classification (thermal, acoustic, security, energy)
- Performance ratings for each glass solution (1-5 stars)
- Custom dimensions and service selections

### 🏢 Multi-Tenant Ready
- Singleton tenant configuration (current: single tenant per deployment)
- Currency support (COP, USD, EUR via ISO 4217)
- Locale customization (es-CO, en-US via BCP 47)
- Timezone configuration (IANA identifiers)

---

## Tech Stack

### Core Framework
- **Next.js 15.2.3** - App Router with React Server Components 19.0.0
- **TypeScript 5.8.2** - Strict mode with ES2022 target
- **Node.js** - Runtime with ES Modules

### Backend
- **tRPC 11.0.0** - Type-safe API layer with kebab-case procedures
- **Prisma 6.16.2** - PostgreSQL ORM with migrations
- **NextAuth.js 5.0.0-beta.25** - Authentication with Google OAuth + RBAC
- **Zod 4.1.1** - End-to-end schema validation

### Frontend
- **React 19.0.0** - Server Components first architecture
- **TanStack Query 5.69.0** - Data fetching and caching
- **Shadcn/ui + Radix UI** - Accessible component library
- **TailwindCSS 4.0.15** - Utility-first styling
- **React Hook Form 7.63.0** - Form state management

### Development Tools
- **Ultracite 5.4.4 + Biome 2.2.4** - Linting and formatting
- **Vitest 3.2.4** - Unit and integration tests (jsdom)
- **Playwright 1.55.1** - End-to-end tests
- **Winston 3.17.0** - Server-side logging (middleware, tRPC only)
- **Lefthook 1.13.4** - Git hooks for code quality

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- pnpm 8.x or higher

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd glasify-lite
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```bash
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/glasify"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   ADMIN_EMAIL="admin@example.com"  # Initial admin user
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # Tenant Configuration
   TENANT_BUSINESS_NAME="Your Business Name"
   TENANT_CURRENCY="COP"
   TENANT_LOCALE="es-CO"
   TENANT_TIMEZONE="America/Bogota"
   TENANT_QUOTE_VALIDITY_DAYS="15"
   ```

4. **Database setup**
   ```bash
   # Run migrations
   pnpm db:generate
   
   # Seed database with sample data
   pnpm db:seed
   
   # Open Prisma Studio (optional)
   pnpm db:studio
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
glasify-lite/
├── src/
│   ├── app/                      # Next.js 15 App Router
│   │   ├── (auth)/               # Authentication routes
│   │   ├── (dashboard)/          # Admin-only routes
│   │   ├── (public)/             # Public catalog and quote routes
│   │   ├── _components/          # Shared app components
│   │   │   ├── admin-only.tsx    # Admin guard component
│   │   │   └── seller-only.tsx   # Seller guard component
│   │   └── api/trpc/[trpc]/     # tRPC API routes
│   │
│   ├── components/ui/            # Shadcn/ui atoms (no business logic)
│   ├── hooks/                    # Global custom hooks
│   ├── lib/                      # Utilities and configurations
│   │   ├── logger.ts             # Winston singleton (SERVER-SIDE ONLY)
│   │   └── utils.ts              # Helper functions
│   │
│   ├── server/                   # Backend logic
│   │   ├── api/routers/          # tRPC routers (kebab-case)
│   │   ├── auth/                 # NextAuth config with RBAC
│   │   ├── services/             # Business logic services
│   │   └── db.ts                 # Prisma singleton client
│   │
│   ├── trpc/                     # tRPC client configuration
│   ├── middleware.ts             # Next.js middleware (route protection)
│   └── env.js                    # Environment validation
│
├── prisma/
│   ├── schema.prisma             # Database schema with UserRole enum
│   ├── migrations/               # Database migrations
│   │   └── 20251015003329_add_user_role/  # RBAC migration
│   └── seeders/                  # Database seeders
│
├── tests/                        # Unit and integration tests
├── e2e/                          # Playwright E2E tests
├── docs/                         # Project documentation
│   ├── architecture.md           # Architecture with RBAC section
│   └── prd.md                    # Product Requirements Document
│
└── specs/                        # Feature specifications
    └── 009-role-based-access/    # RBAC implementation spec
```

---

## Available Scripts

### Development
- `pnpm dev` - Start Next.js development server (with Turbo)
- `pnpm build` - Build production bundle
- `pnpm start` - Start production server

### Database
- `pnpm db:generate` - Run Prisma migrations
- `pnpm db:studio` - Open Prisma Studio GUI
- `pnpm db:seed` - Seed database with sample data

### Code Quality
- `pnpm lint` - Check for linting issues
- `pnpm lint:fix` - Fix linting issues automatically
- `pnpm typecheck` - Check TypeScript types

### Testing
- `pnpm test` - Run unit and integration tests (Vitest)
- `pnpm test:e2e` - Run end-to-end tests (Playwright)
- `pnpm test:watch` - Run tests in watch mode

---

## Role-Based Access Control

### User Roles

| Role     | Description                          | Access Level                              |
|----------|--------------------------------------|-------------------------------------------|
| `admin`  | System administrator                 | Full access (dashboard, all quotes, config) |
| `seller` | Sales representative                 | Own quotes, catalog browsing              |
| `user`   | End client                           | Own quotes, catalog browsing              |

### Authorization Layers

1. **Database Layer**: UserRole enum in Prisma schema
2. **Middleware Layer**: Route protection in `src/middleware.ts`
3. **tRPC Layer**: Procedure helpers (`adminProcedure`, `sellerProcedure`)
4. **UI Layer**: Server Component guards (`<AdminOnly>`, `<SellerOnly>`)

### Protected Routes

- `/dashboard/*` - Admin only
- `/my-quotes/*` - Authenticated users
- `/quotes/*` - Authenticated users
- `/catalog/*` - Public access

See `docs/architecture.md` for complete RBAC documentation.

---

## Development Guidelines

### Code Standards
- **Language**: English (code, comments, commits) | Spanish (UI text only)
- **Naming**: kebab-case (files), PascalCase (components), camelCase (functions)
- **Server Components**: Default pattern, Client Components only when necessary
- **Winston Logger**: Server-side ONLY (never in Client Components)

### Architecture Principles
- **SOLID**: Single Responsibility, Open/Closed, Dependency Inversion
- **Atomic Design**: atoms (ui/) → molecules → organisms (_components/) → pages
- **Server-First**: Leverage RSC, minimize client-side JavaScript
- **Type Safety**: End-to-end TypeScript with Zod validation

### Commit Convention
Follow Conventional Commits format:
```bash
feat: add role-based navigation
fix: correct pricing formula for glass discount
docs: update RBAC architecture diagram
```

---

## Documentation

- **[Architecture](./docs/architecture.md)** - Complete system architecture with RBAC
- **[PRD](./docs/prd.md)** - Product Requirements Document v1.6
- **[CHANGELOG](./CHANGELOG.md)** - Version history and changes
- **[Copilot Instructions](./.github/copilot-instructions.md)** - Development guidelines

---

## Contributing

This is a private project. For internal contributors:

1. Create a feature branch from `main`
2. Follow naming convention: `NNN-feature-name` (e.g., `009-role-based-access`)
3. Commit using Conventional Commits format
4. Run `pnpm lint:fix` and `pnpm typecheck` before pushing
5. Create a pull request with detailed description

---

## License

Private - All Rights Reserved

---

## Contact

For questions or support, contact the development team.

---

**Built with** ❤️ **using the T3 Stack**

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Prisma Documentation](https://www.prisma.io/docs)
- [tRPC Documentation](https://trpc.io)
- [TailwindCSS Documentation](https://tailwindcss.com)
