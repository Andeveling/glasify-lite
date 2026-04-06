# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| When writing React components - no useMemo/useCallback needed | react-19 | /home/andres/.claude/skills/react-19/SKILL.md |
| When writing TypeScript code - types, interfaces, generics | typescript | /home/andres/.claude/skills/typescript/SKILL.md |
| When styling with Tailwind - cn(), theme variables, no var() in className | tailwind-4 | /home/andres/.claude/skills/tailwind-4/SKILL.md |
| When using Zod for validation - breaking changes from v3 | zod-4 | /home/andres/.claude/skills/zod-4/SKILL.md |
| When working with Next.js - routing, Server Actions, data fetching | nextjs-15 | /home/andres/.claude/skills/nextjs-15/SKILL.md |
| When writing E2E tests - Page Objects, selectors, MCP workflow | playwright | /home/andres/.claude/skills/playwright/SKILL.md |
| When managing React state with Zustand | zustand-5 | /home/andres/.claude/skills/zustand-5/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### react-19
- No useMemo/useCallback — React Compiler handles memoization automatically
- use() hook for promises/context, replaces useEffect for data fetching
- Server Components by default, add 'use client' only for interactivity/hooks
- ref is a regular prop — no forwardRef needed
- Actions: use useActionState for form mutations, useOptimistic for optimistic UI
- Metadata: export metadata object from page/layout, no <Head> component
- Named imports from react — never default import React

### typescript
- Const types pattern: `const STATUS = { ... } as const; type Status = (typeof STATUS)[keyof typeof STATUS]`
- Flat interfaces: one level depth, nested objects → dedicated interface
- Never use `any` — use `unknown` for truly unknown types
- Utility types: Pick, Omit, Partial, Required, Readonly

### tailwind-4
- Never use var() in className — use Tailwind semantic classes
- Never use hex colors in className — use Tailwind color classes
- Static classes don't need cn() — use className directly
- cn() for conditional classes and merging with potential conflicts
- Dynamic values → style prop

### zod-4
- Top-level validators (Zod 4): z.email(), z.uuid(), z.url() — NOT z.string().email()
- z.string().min(1) instead of z.string().nonempty()
- z.object() second parameter: { error: "message" } instead of required_error()
- Safe parse returns { success, data/error } — use this pattern

### nextjs-15
- App Router: async by default, no directive needed for Server Components
- Route groups: (auth) in folder name doesn't affect URL
- Server Actions: "use server" directive at top of file
- Data fetching: Promise.all for parallel, Suspense for streaming
- API routes: export named handlers (GET, POST, etc.)

### playwright
- MCP workflow mandatory if available — navigate, snapshot, interact, screenshot, verify, THEN create test
- Selector priority: getByRole > getByLabel > getByText > getByTestId
- All tests for a page in ONE spec file — no separate files per scenario
- Page Object Model: page.ts file + .spec.ts file + .md documentation

### zustand-5
- Select specific fields in selector to prevent unnecessary re-renders
- Use persist middleware for localStorage persistence
- Store interface defines shape, create() receives the implementation

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/andres/Proyectos/glasify-project/glasify-lite/AGENTS.md | Stack, commands, architecture, Don't list |
| cli-tools | /home/andres/Proyectos/glasify-project/glasify-lite/.github/skills/cli-tools/SKILL.md | Project-level skill |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.