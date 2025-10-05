# Glasify Lite - Project Overview

## Purpose
Glasify Lite es una aplicación web para cotización inteligente de productos de vidrio. Permite a los usuarios crear presupuestos y cotizaciones para diferentes tipos de vidrios y servicios relacionados.

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5.8+ with strict mode  
- **Database**: PostgreSQL with Prisma ORM
- **API**: tRPC for type-safe APIs
- **Authentication**: NextAuth.js v5
- **Styling**: TailwindCSS v4 with Shadcn/ui components
- **State Management**: TanStack Query (React Query) v5
- **Forms**: React Hook Form with Shadcn integration and ZodResolver validation
- **Testing**: Vitest (unit/integration), Playwright (E2E)
- **Code Quality**: Ultracite (linting/formatting), Biome
- **Package Manager**: pnpm@10.17.1

## Domain Focus
The application deals with glass products quotation with these key entities:
- **Manufacturers**: Glass manufacturers (VEKA, Guardian, etc.)
- **Models**: Specific glass models with pricing data
- **GlassTypes**: Categories (tempered, laminated, etc.)
- **Services**: Additional services (cutting, polishing, etc.)
- **Quotes**: Customer quotation requests
- **QuoteItems**: Individual items within a quote
- **Adjustments**: Price modifications (discounts, surcharges)

## Key Features
- Intelligent glass product quotation system
- Multi-language support (code in English, UI in Spanish es-LA)
- Type-safe API with tRPC
- Modern UI with Shadcn/ui components
- Comprehensive testing strategy (unit, integration, E2E)