# Suggested Commands for Glasify Lite

## Development Commands
```bash
pnpm dev                    # Start Next.js development server (with Turbo)
pnpm build                  # Build for production (includes Prisma generate)
pnpm start                  # Start production server
pnpm preview               # Build and start production server
```

## Code Quality & Linting
```bash
pnpm ultra                 # Check for issues without fixing
pnpm ultra:fix             # Format and fix code automatically with Ultracite
pnpm ultra:unsafe          # Apply unsafe fixes
pnpm ultra:doc             # Run Ultracite doctor
pnpm format                # Format code with Biome
pnpm typecheck             # Check TypeScript types
```

## Database Commands
```bash
pnpm db:generate           # Run Prisma migrations in development
pnpm db:migrate            # Deploy Prisma migrations to production
pnpm db:push               # Push schema changes to database
pnpm db:studio             # Open Prisma Studio for database management
```

## Testing Commands
```bash
pnpm test                  # Run unit and contract tests with Vitest
pnpm test:watch            # Run tests in watch mode
pnpm test:ui               # Run tests with Vitest UI
pnpm test:e2e              # Run E2E tests with Playwright
pnpm test:e2e:ui           # Run E2E tests with Playwright UI

# Authentication-specific tests
pnpm test:auth             # Run all auth tests (unit + integration + e2e)
pnpm test:auth:unit        # Run unit auth tests
pnpm test:auth:integration # Run integration auth tests
pnpm test:auth:e2e         # Run E2E auth tests
```

## Utility Commands
```bash
pnpm postinstall           # Generate Prisma client (runs automatically after install)

# Git hooks are managed by Lefthook
# Pre-commit: Runs ultracite fix on staged files
# Commit-msg: Validates commit messages with commitlint
```

## Development Workflow
1. `pnpm dev` - Start development server
2. Make changes following conventions
3. `pnpm ultra:fix` - Fix code style issues
4. `pnpm typecheck` - Verify TypeScript
5. `pnpm test` - Run tests
6. Commit with conventional commit message
7. Pre-commit hook will run ultracite fix automatically