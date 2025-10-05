# Authentication Testing Suite

This directory contains comprehensive tests for the authentication functionality of Glasify Lite.

## 🏗️ Test Structure

```
tests/
├── unit/auth/                 # Unit tests for components
│   ├── signin-form.spec.tsx   # SignInForm component tests
│   └── auth-card.spec.tsx     # AuthCard component tests
├── integration/auth/          # Integration tests for flows
│   └── signin-flow.spec.tsx   # Complete authentication flow tests
├── manual/                    # Manual testing documentation
│   └── auth-ui-checklist.md   # Visual/UI testing checklist
└── helpers/                   # Test utilities and mocks
    └── auth-test-helpers.ts    # Authentication testing helpers

e2e/auth/                      # End-to-end tests
└── signin.spec.ts             # Playwright E2E authentication tests

scripts/
└── test-auth.sh               # Automated test runner
```

## 🧪 Test Types

### Unit Tests
- **SignInForm Component**: Form validation, submission, error handling, accessibility
- **AuthCard Component**: Layout, props handling, styling, accessibility

### Integration Tests  
- **Authentication Flow**: Complete signin process with mocked NextAuth
- **Form Validation**: End-to-end validation with error states
- **Loading States**: UI behavior during authentication
- **Error Handling**: Network errors, invalid credentials, recovery

### E2E Tests (Playwright)
- **Visual Testing**: Layout, responsiveness, cross-browser compatibility
- **User Interactions**: Keyboard navigation, form submission, button clicks
- **Authentication Flow**: Real browser testing of signin process
- **Performance**: Page load times, interaction responsiveness
- **Accessibility**: Screen reader compatibility, focus management

### Manual Tests
- **UI/UX Verification**: Visual consistency, design system compliance
- **Cross-browser Testing**: Chrome, Firefox, Safari, Edge compatibility
- **Device Testing**: Mobile, tablet, desktop responsiveness
- **Accessibility Audit**: WCAG 2.1 AA compliance verification

## 🚀 Running Tests

### Quick Start - Run All Auth Tests
```bash
npm run test:auth
```

### Individual Test Types
```bash
# Unit tests only
npm run test:auth:unit

# Integration tests only  
npm run test:auth:integration

# E2E tests only
npm run test:auth:e2e

# Watch mode for development
npm run test:watch -- tests/unit/auth
```

### Manual Testing
```bash
# Start development server
npm run dev

# Open manual testing checklist
open tests/manual/auth-ui-checklist.md

# Navigate to signin page
open http://localhost:3000/signin
```

## 📋 Test Coverage

### SignInForm Component ✅
- ✅ Renders all form elements correctly
- ✅ Validates email format and required fields
- ✅ Validates password length requirements
- ✅ Handles form submission with NextAuth
- ✅ Shows loading states during submission
- ✅ Displays error messages appropriately
- ✅ Handles Google OAuth integration
- ✅ Maintains accessibility standards
- ✅ Manages focus and keyboard navigation
- ✅ Clears errors when correcting input

### AuthCard Component ✅  
- ✅ Renders title and description correctly
- ✅ Applies custom className and styling
- ✅ Handles children components properly
- ✅ Maintains responsive layout
- ✅ Provides proper heading structure
- ✅ Supports flexible content types

### Authentication Flow ✅
- ✅ Redirects authenticated users from signin
- ✅ Handles successful credential authentication
- ✅ Manages failed authentication attempts
- ✅ Processes Google OAuth flow
- ✅ Shows appropriate loading states
- ✅ Handles network errors gracefully
- ✅ Maintains security best practices

### UI/UX Testing ✅
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Cross-browser compatibility 
- ✅ Accessibility compliance
- ✅ Form validation user experience
- ✅ Loading state feedback
- ✅ Error message clarity
- ✅ Keyboard navigation flow
- ✅ Focus management

## 🛠️ Test Utilities

### Mock Helpers (`tests/helpers/auth-test-helpers.ts`)
```typescript
import { authMocks, testCredentials, testHelpers } from '@/tests/helpers/auth-test-helpers';

// Mock authenticated session
authMocks.mockAuthenticatedSession();

// Mock failed signin
authMocks.mockFailedSignIn('CredentialsSignin');

// Fill form with test data
await testHelpers.fillSignInForm(screen, testCredentials.valid);

// Check accessibility
testHelpers.checkFormAccessibility(screen);
```

### Playwright Helpers
```typescript
import { playwrightHelpers } from '@/tests/helpers/auth-test-helpers';

// Fill signin form
await playwrightHelpers.fillSignInForm(page);

// Check form accessibility
await playwrightHelpers.checkFormAccessibility(page);
```

## 🎯 Test Data

### Valid Test Credentials
```typescript
{
  email: 'admin@glasify.com',
  password: 'admin123'
}
```

### Validation Test Cases
- **Email**: Empty, invalid format, valid format
- **Password**: Empty, too short, valid length
- **Form**: Combined validation scenarios

### Mock User Data
```typescript
{
  id: '1',
  email: 'admin@glasify.com', 
  name: 'Admin User',
  image: null
}
```

## 🔍 Debugging Tests

### Common Issues

1. **Tests fail with "signIn is not a function"**
   ```bash
   # Ensure mocks are properly imported
   vi.mock('next-auth/react', () => ({ signIn: vi.fn() }));
   ```

2. **E2E tests can't find elements**
   ```bash
   # Check if development server is running
   npm run dev
   # Verify page is accessible at http://localhost:3000/signin
   ```

3. **Form validation tests intermittent failures**
   ```bash
   # Use waitFor for async validation
   await waitFor(() => {
     expect(screen.getByText(/error message/i)).toBeInTheDocument();
   });
   ```

### Debug Commands
```bash
# Run specific test file
npm run test -- tests/unit/auth/signin-form.spec.tsx

# Run with debug output
npm run test -- --reporter=verbose tests/unit/auth/

# Run Playwright in headed mode
npm run test:e2e -- --headed e2e/auth/signin.spec.ts

# Open Playwright UI
npm run test:e2e:ui
```

## 📊 Performance Benchmarks

### Expected Performance
- **Page Load**: < 3 seconds on average connection
- **Form Interaction**: < 100ms response time
- **Form Validation**: Immediate feedback (< 50ms)
- **Authentication Request**: < 2 seconds under normal conditions

### Performance Tests
```bash
# Run performance tests
npm run test -- tests/unit/auth/ --grep="performance"

# E2E performance tests
npm run test:e2e -- --grep="Performance" e2e/auth/signin.spec.ts
```

## ✅ Pre-deployment Checklist

Before deploying authentication changes:

- [ ] All unit tests pass
- [ ] All integration tests pass  
- [ ] All E2E tests pass
- [ ] Manual UI testing completed
- [ ] Cross-browser testing verified
- [ ] Mobile responsiveness confirmed
- [ ] Accessibility audit passed
- [ ] Security review completed
- [ ] Performance benchmarks met

## 🔐 Security Testing

### Automated Security Checks
- Password field masking
- Form submission over HTTPS
- No sensitive data in DOM
- Proper autocomplete attributes
- CSRF protection (via NextAuth)

### Manual Security Review
- Authentication state management
- Session handling
- OAuth flow security
- Input sanitization
- Error message information disclosure

## 📖 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [React Hook Form Testing](https://react-hook-form.com/advanced-usage#Testing)
- [Playwright Testing Guide](https://playwright.dev/docs/writing-tests)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Note**: This testing suite ensures the authentication system meets production quality standards for security, accessibility, and user experience.