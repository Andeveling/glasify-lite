import { vi } from 'vitest';

// Mock user data for testing
export const mockUser = {
  email: 'admin@glasify.com',
  id: '1',
  image: null,
  name: 'Admin User',
};

export const mockSession = {
  expires: '2024-12-31T23:59:59.999Z',
  user: mockUser,
};

// Authentication mocks
export const authMocks = {
  // Mock NextAuth session
  mockAuthenticatedSession: () => {
    vi.mocked(require('@/server/auth').auth).mockResolvedValue(mockSession);
  },

  mockFailedSignIn: (error = 'CredentialsSignin') => {
    vi.mocked(require('next-auth/react').signIn).mockResolvedValue({
      error,
      ok: false,
      status: 401,
      url: null,
    });
  },

  mockGoogleSignIn: () => {
    vi.mocked(require('next-auth/react').signIn).mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: '/dashboard',
    });
  },

  mockSignInError: (errorMessage = 'Network error') => {
    vi.mocked(require('next-auth/react').signIn).mockRejectedValue(new Error(errorMessage));
  },

  // Mock NextAuth client functions
  mockSuccessfulSignIn: () => {
    vi.mocked(require('next-auth/react').signIn).mockResolvedValue({
      error: null,
      ok: true,
      status: 200,
      url: '/dashboard',
    });
  },

  mockUnauthenticatedSession: () => {
    vi.mocked(require('@/server/auth').auth).mockResolvedValue(null);
  },

  // Reset all mocks
  resetMocks: () => {
    vi.clearAllMocks();
  },
};

// Test credentials
export const testCredentials = {
  invalid: {
    email: 'wrong@example.com',
    password: 'wrongpassword',
  },
  malformed: {
    email: 'invalid-email',
    password: '123', // Too short
  },
  valid: {
    email: 'admin@glasify.com',
    password: 'admin123',
  },
};

// Form validation test cases
export const validationTestCases = {
  email: {
    empty: { error: /el email es requerido/i, value: '' },
    invalid: { error: /ingresa un email válido/i, value: 'invalid-email' },
    valid: { error: null, value: 'test@example.com' },
  },
  password: {
    empty: { error: /la contraseña es requerida/i, value: '' },
    tooShort: { error: /la contraseña debe tener al menos 6 caracteres/i, value: '123' },
    valid: { error: null, value: 'password123' },
  },
};

// Helper functions for tests
export const testHelpers = {
  // Check enabled state
  checkEnabledState: (screen: any) => {
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeEnabled();
    expect(screen.getByRole('button', { name: /google/i })).toBeEnabled();
    expect(screen.getByLabelText(/email/i)).toBeEnabled();
    expect(screen.getByLabelText(/contraseña/i)).toBeEnabled();
  },

  // Check form accessibility
  checkFormAccessibility: (screen: any) => {
    // Check for proper labels
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();

    // Check for proper buttons
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();

    // Check for heading
    expect(screen.getByRole('heading', { name: /iniciar sesión/i })).toBeInTheDocument();
  },

  // Check loading state
  checkLoadingState: (screen: any) => {
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /google/i })).toBeDisabled();
    expect(screen.getByLabelText(/email/i)).toBeDisabled();
    expect(screen.getByLabelText(/contraseña/i)).toBeDisabled();
  },
  // Fill signin form with test data
  fillSignInForm: async (screen: any, credentials = testCredentials.valid) => {
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: credentials.email },
    });
    fireEvent.change(screen.getByLabelText(/contraseña/i), {
      target: { value: credentials.password },
    });
  },

  // Submit signin form
  submitSignInForm: async (screen: any) => {
    const { fireEvent } = await import('@testing-library/react');

    fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));
  },

  // Wait for element to appear
  waitForElement: async (screen: any, matcher: any) => {
    const { waitFor } = await import('@testing-library/react');

    return waitFor(() => {
      expect(screen.getByText(matcher)).toBeInTheDocument();
    });
  },

  // Wait for element to disappear
  waitForElementToDisappear: async (screen: any, matcher: any) => {
    const { waitFor } = await import('@testing-library/react');

    return waitFor(() => {
      expect(screen.queryByText(matcher)).not.toBeInTheDocument();
    });
  },
};

// Playwright test helpers
export const playwrightHelpers = {
  // Check form accessibility in Playwright
  checkFormAccessibility: async (page: any) => {
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
  },

  // Check loading state in Playwright
  checkLoadingState: async (page: any) => {
    await page.getByRole('button', { name: /iniciar sesión/i }).isDisabled();
    await page.getByRole('button', { name: /google/i }).isDisabled();
    await page.getByLabel(/email/i).isDisabled();
    await page.getByLabel(/contraseña/i).isDisabled();
  },
  // Fill signin form in Playwright
  fillSignInForm: async (page: any, credentials = testCredentials.valid) => {
    await page.getByLabel(/email/i).fill(credentials.email);
    await page.getByLabel(/contraseña/i).fill(credentials.password);
  },

  // Submit form in Playwright
  submitSignInForm: async (page: any) => {
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
  },
};

// Custom test data factories
export const createTestUser = (overrides = {}) => ({
  ...mockUser,
  ...overrides,
});

export const createTestSession = (userOverrides = {}) => ({
  expires: '2024-12-31T23:59:59.999Z',
  user: createTestUser(userOverrides),
});

// Performance test helpers
export const performanceHelpers = {
  measureFormInteraction: async (screen: any) => {
    const start = performance.now();

    await testHelpers.fillSignInForm(screen);
    await testHelpers.submitSignInForm(screen);

    const end = performance.now();
    return end - start;
  },

  measurePageLoad: async (page: any, url: string) => {
    const start = Date.now();

    await page.goto(url);
    await page.waitForLoadState('networkidle');

    const end = Date.now();
    return end - start;
  },
};

// Error simulation helpers
export const errorSimulation = {
  authError: (type = 'CredentialsSignin') => ({ error: type, ok: false, status: 401, url: null }),
  networkError: () => new Error('Network request failed'),
  serverError: () => new Error('Internal server error'),
  timeoutError: () => new Error('Request timeout'),
};

export default {
  authMocks,
  errorSimulation,
  mockSession,
  mockUser,
  performanceHelpers,
  playwrightHelpers,
  testCredentials,
  testHelpers,
  validationTestCases,
};
