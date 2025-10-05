# Development Guidelines for Glasify Lite

## TDD Approach
Follow this test-driven development process:
1. Write contract tests first (`tests/contract/`)
2. Implement tRPC procedures
3. Add integration tests (`tests/integration/`)
4. Create unit tests for complex logic (`tests/unit/`)
5. Add E2E tests for user workflows (`e2e/`)

## API Design Principles
- **tRPC Procedures**: Use kebab-case (`quote.calculate-item`)
- **Input/Output Schemas**: Use Spanish field names for user-facing data
- **Validation**: Comprehensive Zod validation on all inputs
- **Error Messages**: Always in Spanish for user-facing errors
- **Type Safety**: Maintain end-to-end TypeScript type safety

## Component Development
- **Shadcn/ui**: Use existing components from the design system
- **Custom Components**: Place in `src/components/` with PascalCase naming
- **Form Components**: Use React Hook Form with Zod validation
- **Accessibility**: Follow a11y guidelines (ARIA labels, keyboard navigation)
- **Responsive**: Design mobile-first with Tailwind CSS

## State Management
- **Server State**: Use TanStack Query (React Query) with tRPC
- **Client State**: React hooks and context for local state
- **Form State**: React Hook Form for form management
- **Global State**: Minimize use, prefer server state when possible

## Database Development
- **Schema Changes**: Always create migrations with `pnpm db:generate`
- **Seeding**: Update `prisma/seed.ts` for development data
- **Queries**: Use Prisma client with proper error handling
- **Performance**: Consider query optimization and indexing

## Error Handling Strategy
- **API Errors**: Log in English, display in Spanish
- **User Feedback**: Provide clear Spanish error messages
- **Logging**: Use Winston logger with appropriate levels
- **Monitoring**: Log errors with context for debugging

## Security Best Practices
- **Authentication**: Use NextAuth.js v5 properly
- **Authorization**: Implement proper role-based access
- **Input Validation**: Validate all inputs with Zod
- **Headers**: Security headers configured in next.config.js
- **Environment**: Never commit secrets, use .env files

## Performance Optimization
- **Next.js Features**: Use App Router, Server Components, streaming
- **Database**: Optimize queries, use proper indexing
- **Caching**: Leverage tRPC and React Query caching
- **Images**: Use Next.js Image component with optimization
- **Bundle**: Monitor bundle size and split chunks appropriately

## Deployment Considerations
- **Environment Variables**: Configure for different environments
- **Database Migrations**: Automate with `pnpm db:migrate`
- **Build Process**: Ensure `pnpm build` succeeds
- **Health Checks**: Implement proper health check endpoints
- **Monitoring**: Set up error tracking and performance monitoring

## Code Review Guidelines
- **Functionality**: Verify feature works as expected
- **Code Quality**: Check conventions and best practices
- **Testing**: Ensure adequate test coverage
- **Performance**: Review for potential performance issues
- **Security**: Check for security vulnerabilities
- **Documentation**: Verify code is self-documenting or commented

## Common Patterns
- **Error Boundaries**: Use for graceful error handling
- **Loading States**: Implement proper loading UX
- **Form Validation**: Real-time validation with helpful messages
- **Data Fetching**: Use tRPC queries with proper loading/error states
- **Component Composition**: Build composable, reusable components