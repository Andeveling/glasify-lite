# Project Structure

## Root Level
```
glasify-lite/
├── src/                    # Source code
├── tests/                  # Test files (unit, integration, contract, perf)
├── e2e/                    # Playwright E2E tests
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
├── docs/                   # Documentation
├── scripts/                # Utility scripts
├── .github/                # GitHub workflows and configurations
├── node_modules/           # Dependencies
└── .next/                  # Next.js build output
```

## Source Structure (src/)
```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes group
│   ├── (dashboard)/       # Dashboard routes group  
│   ├── (public)/          # Public routes group
│   ├── api/               # API routes
│   ├── _components/       # App-specific components
│   ├── _utils/            # App-specific utilities
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── not-found.tsx      # 404 page
│   └── global-error.tsx   # Global error boundary
├── components/             # Reusable UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
├── providers/              # React context providers
├── server/                 # Backend logic
│   ├── api/               # tRPC routers
│   ├── auth/              # Authentication configuration
│   ├── price/             # Price calculation services
│   ├── services/          # Business logic services
│   └── db.ts              # Database connection
├── styles/                 # Global CSS styles
├── trpc/                   # tRPC client configuration
├── env.js                  # Environment validation
└── middleware.ts           # Next.js middleware
```

## Test Structure
```
tests/
├── unit/                   # Unit tests
├── integration/            # Integration tests
├── contract/               # API contract tests
├── perf/                   # Performance benchmarks
├── auth/                   # Authentication-specific tests
├── helpers/                # Test utilities
├── manual/                 # Manual testing scenarios
├── setup.ts                # Test setup configuration
└── integration-setup.ts    # Integration test setup

e2e/                        # End-to-end tests
└── auth/                   # E2E authentication tests
```

## Configuration Files
- `package.json` - Dependencies and scripts
- `next.config.js` - Next.js configuration with optimizations
- `tsconfig.json` - TypeScript configuration
- `biome.jsonc` - Biome linting/formatting (extends Ultracite)
- `components.json` - Shadcn/ui configuration  
- `lefthook.yml` - Git hooks configuration
- `playwright.config.ts` - E2E testing configuration
- `vitest.config.ts` - Unit/integration testing configuration
- `prisma/schema.prisma` - Database schema
- `.env.example` - Environment variables template