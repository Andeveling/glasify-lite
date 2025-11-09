# Glasify Lite Constitution
**Version**: 2.3.0  
**Ratified**: 2025-10-09  
**Last Amended**: 2025-11-09

---

## About This Document

This constitution defines **non-negotiable principles** that guide all engineering decisions. It uses plain language accessible to all team members.

For technical implementation details, see `.github/copilot-instructions.md`.

---

## Core Values

### 1. Clarity Over Complexity

Write simple, understandable code. Use descriptive names, small functions with single purposes, and avoid unnecessary cleverness. Every team member should understand the code without extensive documentation.


### 2. Server-First Performance

Process data on the server, not the client. Cache appropriately and refresh views after mutations. Server-side processing is faster, more secure, and provides better user experience.

---

### 3. One Job, One Place (SOLID)

Each code module has one responsibility. Separate concerns: UI orchestration, business logic, validation, data access, and configuration belong in different files. Apply SOLID principles for maintainable, testable code.

**File Organization**: Mandatory separation for forms:
- `_components/` - UI orchestration only
- `_hooks/` - State management and API calls
- `_schemas/` - Validation schemas
- `_utils/` - Pure functions and type transformations
- `_constants/` - Configuration values

❌ **Must refactor**: 200+ line files mixing multiple responsibilities, inline schemas, hardcoded magic numbers, or business logic in UI components.

---

### 4. Flexible Testing

Tests are mandatory before merge, but timing is flexible. Write tests before, during, or after coding as suits your workflow. Focus on critical user journeys and edge cases.

---

### 5. Extend, Don't Modify

Add features through new code, not by changing existing working code. Keep interfaces stable. When changes are unavoidable, provide clear migration paths.

---

### 6. Security First

Validate all inputs and check permissions server-side at every entry point. Never trust client-side data. Log security events. Server-side validation is mandatory; client-side is only UX enhancement.

---

### 7. Observability

Log significant events and errors with sufficient context for diagnosis. Never log sensitive data (passwords, tokens, personal information). Use structured logging with correlation IDs for related events.


## Language & Communication

- **Code/Comments/Commits**: English only (universal developer language)
- **User Interface**: Spanish (es-LA) only (target audience)
- **Commit Format**: Conventional commits (e.g., `feat:`, `fix:`)

---

## Technology Governance

Technology choices must prioritize:
1. Team expertise and consistency
2. Long-term maintainability
3. Community support and ecosystem maturity

**Framework changes** require architectural review and migration plan approval. See `.github/copilot-instructions.md` for current technology stack.

---

## Quality Gates

### Automated (Must Pass)
- Type checking without errors
- Code formatting compliance
- All tests passing (unit, integration, E2E where applicable)

### Human Review (Must Pass)
- At least one reviewer approval
- Two approvals for large/risky changes
- Security review for sensitive changes

### Documentation (Must Include)
- Changelog entry for user-facing changes
- Migration notes for breaking changes
- Examples for new public APIs


## Governance

### Authority

This constitution is the ultimate authority for engineering decisions. When in doubt, refer to these principles.

### Amendment Process

1. Create PR against `.specify/memory/constitution.md`
2. Explain rationale and impact
3. Provide migration plan if breaking patterns
4. Get approval: MAJOR changes need 2 maintainers, MINOR/PATCH need 1

### Versioning

- **MAJOR (3.0.0)**: Remove or significantly change core principle
- **MINOR (2.1.0)**: Add new principle or materially expand guidance
- **PATCH (2.0.1)**: Clarify wording, fix typos, non-semantic refinements

### Compliance

Pull requests touching principles must reference constitution. Violations of MUST rules block merge. Team notified of constitution changes.

---

## Principle Priority

When principles conflict:

1. Security First
2. One Job, One Place (SOLID)
3. Clarity Over Complexity
4. Server-First Performance
5. Flexible Testing
6. Extend, Don't Modify
7. Observability

---

## Success Metrics

- **User Experience**: Page load <2s
- **Code Quality**: >80% test coverage for critical paths
- **Development Velocity**: Features deployed within sprint goals
- **Stability**: <5% error rate in production
- **Onboarding**: New developers productive within 1 week

---

## Questions?

1. Check `.github/copilot-instructions.md` for technical details
2. Ask in team communication channel
3. Propose constitution amendment if unclear


---

<!--
Sync Impact Report

- Version change: 2.2.1 → 2.3.0 (MINOR)
- Modified principles:
  * All 7 core principles compacted and made framework-agnostic
  * Removed Next.js, tRPC, Drizzle-specific examples from principles
  * Generalized "Track Everything Important" (was Winston-specific)
  * Simplified "Server-First Performance" (removed Next.js caching details)
- Removed sections:
  * "Technology Constraints" section (moved to copilot-instructions.md)
  * "Cache Components Best Practices" section (moved to copilot-instructions.md)
  * Framework-specific stack requirements (moved to copilot-instructions.md)
- Added sections:
  * "Technology Governance" (framework-agnostic technology change policy)
- Templates requiring updates:
  * .github/copilot-instructions.md ⚠ MUST ADD: Technology stack details, Cache Components rules, Winston usage patterns, Next.js SSR patterns
  * .specify/templates/plan-template.md ✅ no changes needed (already references constitution)
  * .specify/templates/spec-template.md ✅ no changes needed (feature-focused)
  * .specify/templates/tasks-template.md ✅ no changes needed (task-focused)
- Follow-up TODOs:
  * Move "Technology Constraints" section to .github/copilot-instructions.md
  * Move "Cache Components Best Practices" to .github/copilot-instructions.md
  * Ensure copilot-instructions.md has all framework-specific patterns
  * Verify no constitution references to specific frameworks remain
- Changes summary:
  * MINOR version bump: Material simplification aligns with SpecKit guidance
  * Constitution now framework-agnostic and principle-focused
  * Reduced from ~490 to ~150 lines (70% reduction)
  * Technical details delegated to copilot-instructions.md
  * Plain language accessible to non-technical team members
  * Principles remain testable and actionable
- Rationale:
  * SpecKit recommends constitution focus on principles, not implementation
  * Technical details (Next.js, tRPC, Cache Components) belong in copilot-instructions.md
  * Framework-agnostic principles survive technology migrations
  * Easier for non-technical stakeholders to understand governance
  * Reduces duplication between constitution and copilot-instructions
  * Aligns with industry best practices for engineering constitutions
  * Maintains all 7 core principles with clearer, more concise language
-->

