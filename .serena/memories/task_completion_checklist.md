# Task Completion Checklist

When completing any development task in Glasify Lite, follow this checklist:

## Code Quality Checks
1. **Ultracite Fix**: Run `pnpm ultra:fix` to format and fix code issues
2. **Type Check**: Run `pnpm typecheck` to verify TypeScript compilation  
3. **Linting**: Ensure `pnpm ultra` passes without errors
4. **Code Review**: Verify code follows project conventions:
   - Naming conventions (kebab-case files, camelCase variables, etc.)
   - English code/comments, Spanish UI text
   - No `any` types or unsafe patterns

## Testing Requirements
1. **Unit Tests**: Run `pnpm test` to ensure all tests pass
2. **Integration Tests**: Verify integration tests for modified APIs
3. **E2E Tests**: Run `pnpm test:e2e` for critical user flows
4. **Test Coverage**: Ensure new code has appropriate test coverage

## Database Changes
If database schema changed:
1. **Generate Migration**: Run `pnpm db:generate` 
2. **Test Migration**: Verify migration works correctly
3. **Update Seed Data**: Update `prisma/seed.ts` if needed
4. **Regenerate Client**: Ensure Prisma client is updated

## Authentication Changes
If auth-related changes were made:
1. **Auth Tests**: Run `pnpm test:auth` to verify all auth flows
2. **Security Review**: Verify no security vulnerabilities introduced
3. **Session Handling**: Ensure proper session management

## API Changes (tRPC)
If API endpoints were modified:
1. **Contract Tests**: Verify contract tests pass
2. **Type Safety**: Ensure end-to-end type safety maintained
3. **Error Handling**: Verify proper error messages in Spanish
4. **Documentation**: Update API documentation if needed

## UI/UX Changes
If UI components were modified:
1. **Accessibility**: Verify a11y compliance (ARIA labels, keyboard navigation)
2. **Responsive Design**: Test on different screen sizes
3. **Spanish Localization**: Ensure all user-facing text is in Spanish
4. **Design System**: Verify Shadcn/ui components used correctly

## Performance Checks
1. **Build Success**: Verify `pnpm build` completes successfully
2. **Bundle Analysis**: Check for unexpected bundle size increases
3. **Load Testing**: For critical paths, verify performance impact

## Version Control
1. **Conventional Commits**: Use proper commit message format (English)
2. **Branch Strategy**: Follow project branching conventions
3. **Pre-commit Hooks**: Ensure Lefthook pre-commit passes
4. **Clean History**: Squash commits if necessary before merging

## Final Verification
1. **Development Server**: Test changes with `pnpm dev`
2. **Production Build**: Test with `pnpm preview` 
3. **Cross-browser Testing**: Verify in different browsers
4. **Mobile Testing**: Test responsive behavior on mobile devices

This checklist ensures code quality, functionality, and adherence to project standards.