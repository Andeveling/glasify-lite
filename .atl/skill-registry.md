# Skill Registry

**Delegator use only.** Any agent that launches sub-agents reads this registry to resolve compact rules, then injects them directly into sub-agent prompts. Sub-agents do NOT read this registry or individual SKILL.md files.

See `_shared/skill-resolver.md` for the full resolution protocol.

## Project Skills

| Trigger | Skill | Path |
|---------|-------|------|
| tRPC, TanStack Query, Next.js App Router setup | trpc-tanstack-nextjs | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/trpc-tanstack-nextjs/SKILL.md |
| React performance, Next.js optimization | vercel-react-best-practices | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/vercel-react-best-practices/SKILL.md |
| Next.js file conventions, RSC, async patterns | next-best-practices | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/next-best-practices/SKILL.md |
| AI SDK, generateText, streamText, useChat, agents | ai-sdk | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/ai-sdk/SKILL.md |
| AI chat UI, chatbot, Message components | ai-elements | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/ai-elements/SKILL.md |

## User Skills

| Trigger | Skill | Path |
|---------|-------|------|
| commit planning, work-unit-commits, chained PRs | work-unit-commits | /home/andres/.config/opencode/skills/work-unit-commits/SKILL.md |
| comment, collaboration, PR feedback | comment-writer | /home/andres/.config/opencode/skills/comment-writer/SKILL.md |
| docs, guides, RFC, cognitive load reduction | cognitive-doc-design | /home/andres/.config/opencode/skills/cognitive-doc-design/SKILL.md |
| chained PRs, stacked PRs, split oversized changes | chained-pr | /home/andres/.config/opencode/skills/chained-pr/SKILL.md |
| skill registry, update skills | skill-registry | /home/andres/.config/opencode/skills/skill-registry/SKILL.md |
| GitHub issue, bug report, feature request | issue-creation | /home/andres/.config/opencode/skills/issue-creation/SKILL.md |
| PR, pull request, branch | branch-pr | /home/andres/.config/opencode/skills/branch-pr/SKILL.md |
| new skill, agent instructions | skill-creator | /home/andres/.config/opencode/skills/skill-creator/SKILL.md |
| Go tests, go test coverage, golden files | go-testing | /home/andres/.config/opencode/skills/go-testing/SKILL.md |
| judgment day, dual review, adversarial | judgment-day | /home/andres/.config/opencode/skills/judgment-day/SKILL.md |
| Jira epic, large feature | jira-epic | /home/andres/.config/opencode/skills/jira-epic/SKILL.md |
| Jira task, ticket | jira-task | /home/andres/.config/opencode/skills/jira-task/SKILL.md |
| technical review, candidate submission | technical-review | /home/andres/.config/opencode/skills/technical-review/SKILL.md |
| GitHub PR review, issues | pr-review | /home/andres/.config/opencode/skills/pr-review/SKILL.md |
| SSH, server connection, troubleshooting | ssh-server-troubleshooting | /home/andres/.config/opencode/skills/ssh-server-troubleshooting/SKILL.md |

## Compact Rules

Pre-digested rules per skill. Delegators copy matching blocks into sub-agent prompts as `## Project Standards (auto-resolved)`.

### trpc-tanstack-nextjs
- Import PrismaClient from `./generated/client`, NOT `@prisma/client`
- Use superjson transformer on both client and server
- Add `credentials: "include"` to httpBatchLink fetch for cookies
- Use `staleTime: 30` or higher (not 0, which causes refetch on every mount)
- Wrap `getCaller`/`getQueryClient` in React `cache()` for RSC reuse
- Prefetch with `HydrateClient`, not just server-side fetch

### vercel-react-best-practices
- **CRITICAL**: Eliminate waterfalls — use `Promise.all()` for independent operations
- **CRITICAL**: Avoid barrel file imports — import directly from source (lucide-react, radix-ui, etc.)
- Server Components by default — add `'use client'` only for interactivity/hooks
- Use `use()` hook for promises/context — replaces useEffect for data fetching
- Auth server actions like API routes — never trust middleware alone
- Use `React.cache()` for per-request deduplication of DB/expensive calls
- Avoid duplicate serialization at RSC boundaries — pass only fields client uses
- Hoist static I/O to module level — fonts, logos, config load once
- Use `after()` for non-blocking operations — logging, analytics

### next-best-practices
- Route segments: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `global-error.tsx`
- `params` and `searchParams` are async in Next.js 15+ — await them
- `cookies()` and `headers()` are async — await them
- Middleware renamed to `proxy.ts` in Next.js 16
- Use `redirect`, `notFound`, `forbidden`, `unauthorized` for error handling
- Generate metadata with `export function generateMetadata()` in page/layout
- Always use `next/image` over `<img>` — configure remote patterns
- Use `next/font` for font optimization with Tailwind CSS integration

### ai-sdk
- **Always fetch current model IDs** from `curl https://ai-gateway.vercel.sh/v1/models` — never use outdated IDs from memory
- Use Vercel AI Gateway provider by default unless user specifies otherwise
- `useChat` has changed significantly in recent versions — check `node_modules/ai/docs/` before writing
- Use `InferAgentUIMessage<typeof agent>` for type-safe tool results with useChat
- **Be minimal** — only specify options that differ from defaults
- Run typecheck after changes to verify correctness
- Check `node_modules/ai/docs/common-errors.md` for renamed parameters before searching source

### ai-elements
- Install via `npx ai-elements@latest` (use project package manager)
- Requires shadcn/ui and Tailwind 4 configured
- Components installed to `@/components/ai-elements/`
- Style or modify components after installation — code lives in your project
- Ensure `data-theme` attribute on `<html>` for theme switching to work

### work-unit-commits
- One logical change per commit — don't mix refactoring with feature work
- Commit message format: `<type>(<scope>): <description>` (conventional commits)
- Each commit must be independently testable
- Tests and docs travel with the code that needs them
- Use work-unit commits for PR slices in chained/stacked PRs

### comment-writer
- Be warm and direct — you care about their growth, not just code quality
- Validate the question makes sense before explaining why it's wrong
- Explain WHY with technical reasoning, then show the correct way with examples
- Use CAPS for emphasis on critical points
- After correction: always show the correct pattern, not just "don't do X"

### cognitive-doc-design
- Write for the reader who is in a problem-solving context, not leisurely reading
- Lead with what the reader needs to accomplish, not what the tool does
- Chunk information by task context — don't group by tool feature
- Use concrete examples with real code, not abstract descriptions
- Include "key learnings" or "gotchas" section for non-obvious findings

### chained-pr
- Use when: PR exceeds 400 lines, complex stacked features, review fatigue risk
- Stacked-to-main: each PR merges to main in order — fast iteration, fix on the go
- Feature-branch-chain: PR #1 targets tracker branch, later PRs target previous PR — focused diffs
- Each PR must have: clear start/finish boundary, verification steps, rollback plan
- Review workload guard: if forecast says "Chained PRs recommended: Yes", ask user before apply

### judgment-day
- Run blind dual review — two agents independently judge, then compare
- Fix confirmed issues before re-judging
- Re-judge after fixes to confirm resolution
- Judge: correct, incorrect, or needs-improvement with specific evidence

### technical-review
- Evaluate against stated requirements, not subjective style preferences
- Separate: correctness issues, security concerns, performance problems, maintainability
- Provide concrete fix suggestions, not just "this could be better"
- Include test coverage assessment for backend/core logic

### pr-review
- Analyze PR description and diff context before diving into code
- Check for: missing tests, incomplete error handling, security issues, architectural drift
- Comment with actionable feedback — point to specific lines, suggest alternatives
- Flag: blocking issues vs nitpicks vs suggestions

### ssh-server-troubleshooting
- Check service status first: `systemctl status ssh`
- Verify network connectivity: `ping`, `telnet`, `nc` tests
- Check logs: `/var/log/auth.log` for SSH auth failures
- Resource exhaustion: `df`, `free`, `top` for disk/memory issues
- Restart service only after identifying root cause

### go-testing
- Use `t.Run()` for table-driven tests with subtest names
- Golden files for complex expected output — update with `go test -update`
- Bubbletea tests: use `teatest` for UI testing
- Coverage: `go test -cover` — aim for meaningful coverage, not vanity numbers

### jira-epic
- Epic format: title (concise), description (user story format), acceptance criteria, tasks
- Link related stories and tasks
- Include non-functional requirements (performance, security, scale)
- Definition of Done clearly stated

### jira-task
- Task format: title, description, acceptance criteria, story points (if estimated)
- Priority and labels clearly stated
- Describe expected behavior vs current behavior for bugs
- Include steps to reproduce for bug reports

### issue-creation
- Issue format: title, description, acceptance criteria, labels
- For bugs: steps to reproduce, expected vs actual behavior, environment
- For features: user story format, success criteria, out of scope
- Use labels for priority, type (bug/feature/refactor), and area (backend/frontend/docs)

### skill-creator
- Required frontmatter: name, description (trigger text, max 250 chars), license, metadata
- Required sections: Activation Contract, Hard Rules, Decision Gates, Execution Steps, Output Contract, References
- Target 180-450 body tokens — move examples/edge cases to local `references/`
- Hard rules must be observable — no subjective "best practice" statements
- References must be local stable files relative to skill directory

### skill-registry
- Always write `.atl/skill-registry.md` regardless of SDD persistence mode
- Always save to engram if `mem_save` tool is available
- Skip `sdd-*`, `_shared`, and `skill-registry` directories when scanning
- Read SKILL.md files (up to 200 lines) for compact rules — 5-15 lines per skill
- Compact rules: constraints, key patterns, breaking changes, gotchas only
- Deduplicate by skill name — prefer project-level over user-level

### ssh-server-troubleshooting
- Diagnose: connection refused, timeout, auth failure, service down
- Check: `systemctl status ssh`, logs, resource exhaustion (disk/memory)
- Use `ping`, `telnet`, `nc` for network connectivity
- Restart services only after identifying root cause

## Project Conventions

| File | Path | Notes |
|------|------|-------|
| AGENTS.md | /home/andres/Proyectos/glasify-project/glasify-lite/AGENTS.md | Index — references Vitro Rojas Panama client data |
| .agents/skills/vercel-react-best-practices/AGENTS.md | /home/andres/Proyectos/glasify-project/glasify-lite/.agents/skills/vercel-react-best-practices/AGENTS.md | Full Vercel React best practices guide |

Read the convention files listed above for project-specific patterns and rules. All referenced paths have been extracted — no need to read index files to discover more.