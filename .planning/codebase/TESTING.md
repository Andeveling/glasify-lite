# Testing — Framework, Structure & Practices

## Test Stack

| Tool | Version | Purpose |
|------|---------|---------|
| Vitest | 4.0.4 | Unit testing |
| @playwright/test | 1.56.0 | E2E testing |
| @testing-library/react | 16.3.0 | React component testing |
| @testing-library/jest-dom | 6.9.1 | DOM assertion matchers |
| @testing-library/user-event | 14.6.1 | User interaction simulation |
| jsdom | 27.0.0 | DOM environment |
| fast-check | 4.6.0 | Property-based testing |

## Test Commands

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# UI mode
pnpm test:ui

# Auth tests
pnpm test:auth
pnpm test:auth:unit
pnpm test:auth:integration
pnpm test:auth:e2e

# E2E tests
pnpm test:e2e
pnpm test:e2e:ui
```

## Directory Structure

```
tests/
├── unit/                       # Unit tests
│   └── auth/                  # Auth unit tests
├── integration/              # Integration tests
│   └── auth/                 # Auth integration tests
└── e2e/                      # E2E tests
    └── auth/                 # Auth E2E tests
```

## Test File Naming

- Same name as file being tested with `.test.ts` or `.test.tsx` suffix
- Example: `utils.test.ts` for `utils.ts`
- Example: `Component.test.tsx` for `Component.tsx`

## Unit Tests

### Basic Example
```typescript
import { describe, it, expect } from "vitest"

describe("utility function", () => {
  it("does something", () => {
    const result = someFunction(input)
    expect(result).toBe(expected)
  })
})
```

### With Mocking
```typescript
import { vi } from "vitest"

it("calls API", async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: "test" })
  global.fetch = mockFetch
  
  const result = await fetchData()
  
  expect(mockFetch).toHaveBeenCalledWith(expectedUrl)
})
```

## Component Testing

### React Testing Library
```typescript
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

it("renders form", async () => {
  const user = userEvent.setup()
  
  render(<MyForm />)
  
  await user.type(screen.getByLabelText("Name"), "John")
  await user.click(screen.getByRole("button", { name: "Submit" }))
  
  expect(screen.getByText("Success")).toBeInTheDocument()
})
```

### With React Hook Form
```typescript
import { render } from "@testing-library/react"
import { FormProvider, useForm } from "react-hook-form"

const FormWrapper = ({ children }: { children: React.ReactNode }) => {
  const methods = useForm()
  return <FormProvider {...methods}>{children}</FormProvider>
}

it("validates form", async () => {
  render(
    <FormWrapper>
      <MyForm />
    </FormWrapper>
  )
  // ...
})
```

## E2E Tests (Playwright)

### Configuration (`playwright.config.ts`)
```typescript
import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
})
```

### Basic E2E Test
```typescript
import { test, expect } from "@playwright/test"

test("user can login", async ({ page }) => {
  await page.goto("/login")
  await page.fill('[name="email"]', "test@example.com")
  await page.fill('[name="password"]', "password")
  await page.click('[type="submit"]')
  
  await expect(page).toHaveURL("/dashboard")
})
```

### Authenticated E2E
```typescript
test("authenticated action", async ({ page }) => {
  // Login first
  await page.goto("/login")
  // ... login flow
  
  // Then test protected route
  await page.goto("/protected")
  await expect(page.locator("h1")).toContainText("Protected Content")
})
```

## Test Utilities

### Cleanup
```typescript
import { afterEach } from "vitest"

afterEach(() => {
  cleanup()
})
```

### Global Setup
```typescript
// vitest.setup.ts
import "@testing-library/jest-dom"
```

## Mock Patterns

### Prisma Mock
```typescript
const mockPrismaClient = {
  model: {
    findMany: vi.fn().mockResolvedValue([]),
    findUnique: vi.fn(),
  },
}
```

### tRPC Mock
```typescript
const mockTrpc = {
  model: {
    useQuery: vi.fn(() => ({ data: null, isLoading: false })),
    useMutation: vi.fn(() => ({ mutate: vi.fn() })),
  },
}
```

## Coverage

- Run with `--coverage` flag
- Threshold configured in vitest config
- Istanbul reporter for HTML output

## Property-Based Testing (fast-check)

```typescript
import { fc } from "fast-check"

it("handles various inputs", () => {
  fc.assert(
    fc.property(fc.string(), (input) => {
      const result = processInput(input)
      return result !== undefined
    })
  )
})
```

## CI Integration

- Tests run on CI with retries
- E2E tests require dev server running
- Auth E2E tests need seeded database

## Testing Specific Features

### Auth Testing
```bash
pnpm test:auth          # Run all auth tests
pnpm test:auth:unit      # Unit only
pnpm test:auth:integration  # Integration only
pnpm test:auth:e2e       # E2E only
```

### Form Testing
- Use `userEvent` for realistic user interaction
- Test validation errors
- Test loading states

### API Testing
- Mock tRPC procedures
- Test error cases
- Test with invalid input

## Test Data

### Factories (`prisma/factories/`)
- Generate test data programmatically
- Follow seed patterns
- Reset database between tests

### Seeding for Tests
```bash
DATABASE_URL="file:./prisma/dev.db" pnpm seed:minimal
```

## Best Practices

1. **Test behavior, not implementation** — Don't test internal details
2. **Descriptive test names** — `it("submits form with valid data")`
3. **Arrange-Act-Assert** — Clear test structure
4. **One assertion per test** — Easier to debug failures
5. **Mock external dependencies** — API calls, database
6. **Keep tests fast** — Avoid unnecessary waits
7. **Use data-testid for critical elements** — Not always necessary but helpful for complex UI

## Debugging Tests

```bash
# Run specific test file
pnpm test src/lib/utils.test.ts

# Run with verbose output
pnpm test --reporter=verbose

# Update snapshots
pnpm test --update

# Open UI
pnpm test:ui
```