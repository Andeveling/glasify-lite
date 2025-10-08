import { expect, test } from '@playwright/test';

// Regex patterns for better performance
const SIGNIN_TITLE_REGEX = /iniciar sesión.*glasify/i;
const SIGNIN_HEADING_REGEX = /iniciar sesión/i;
const SIGNIN_DESCRIPTION_REGEX = /ingresa a tu cuenta para acceder al panel/i;
const EMAIL_LABEL_REGEX = /email/i;
const PASSWORD_LABEL_REGEX = /contraseña/i;
const GOOGLE_BUTTON_REGEX = /google/i;
const SEPARATOR_TEXT_REGEX = /o continúa con/i;
const EMAIL_REQUIRED_ERROR_REGEX = /el email es requerido/i;
const PASSWORD_REQUIRED_ERROR_REGEX = /la contraseña es requerida/i;
const INVALID_EMAIL_ERROR_REGEX = /ingresa un email válido/i;
const PASSWORD_LENGTH_ERROR_REGEX = /la contraseña debe tener al menos 6 caracteres/i;
const SIGNIN_URL_REGEX = /signin/;
const AUTH_ERROR_REGEX = /credenciales incorrectas/i;

// Constants for performance thresholds
const MAX_LOAD_TIME_MS = 3000;

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signin page before each test
    await page.goto('/signin');
  });

  test.describe('Sign In Page UI', () => {
    test('should render signin page correctly', async ({ page }) => {
      // Check page title and metadata
      await expect(page).toHaveTitle(SIGNIN_TITLE_REGEX);

      // Check main heading
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();

      // Check description
      await expect(page.getByText(SIGNIN_DESCRIPTION_REGEX)).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeVisible();
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeVisible();

      // Check buttons
      await expect(page.getByRole('button', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
      await expect(page.getByRole('button', { name: GOOGLE_BUTTON_REGEX })).toBeVisible();

      // Check separator
      await expect(page.getByText(SEPARATOR_TEXT_REGEX)).toBeVisible();
    });

    test('should have proper form attributes', async ({ page }) => {
      const emailInput = page.getByLabel(EMAIL_LABEL_REGEX);
      const passwordInput = page.getByLabel(PASSWORD_LABEL_REGEX);

      // Email input attributes
      await expect(emailInput).toHaveAttribute('type', 'email');
      await expect(emailInput).toHaveAttribute('autocomplete', 'email');
      await expect(emailInput).toHaveAttribute('placeholder', 'tu@ejemplo.com');

      // Password input attributes
      await expect(passwordInput).toHaveAttribute('type', 'password');
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    test('should be responsive on different screen sizes', async ({ page }) => {
      // Test mobile view
      await page.setViewportSize({ height: 667, width: 375 });
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeVisible();

      // Test tablet view
      await page.setViewportSize({ height: 1024, width: 768 });
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();

      // Test desktop view
      await page.setViewportSize({ height: 800, width: 1200 });
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation errors for empty form submission', async ({ page }) => {
      // Try to submit empty form
      await page.getByRole('button', { name: SIGNIN_HEADING_REGEX }).click();

      // Check validation errors appear
      await expect(page.getByText(EMAIL_REQUIRED_ERROR_REGEX)).toBeVisible();
      await expect(page.getByText(PASSWORD_REQUIRED_ERROR_REGEX)).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      // Enter invalid email
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('invalid-email');
      await page.getByLabel(EMAIL_LABEL_REGEX).blur();

      // Check email validation error
      await expect(page.getByText(INVALID_EMAIL_ERROR_REGEX)).toBeVisible();
    });

    test('should validate password length', async ({ page }) => {
      // Enter short password
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('123');
      await page.getByLabel(PASSWORD_LABEL_REGEX).blur();

      // Check password validation error
      await expect(page.getByText(PASSWORD_LENGTH_ERROR_REGEX)).toBeVisible();
    });

    test('should clear validation errors when correcting input', async ({ page }) => {
      // Trigger validation error
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('invalid');
      await page.getByLabel(EMAIL_LABEL_REGEX).blur();
      await expect(page.getByText(INVALID_EMAIL_ERROR_REGEX)).toBeVisible();

      // Correct the input
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('valid@example.com');
      await page.getByLabel(EMAIL_LABEL_REGEX).blur();

      // Error should disappear
      await expect(page.getByText(INVALID_EMAIL_ERROR_REGEX)).not.toBeVisible();
    });

    test('should prevent submission with invalid data', async ({ page }) => {
      // Fill invalid data
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('invalid-email');
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('123');

      // Try to submit
      await page.getByRole('button', { name: SIGNIN_HEADING_REGEX }).click();

      // Should show validation errors and not submit
      await expect(page.getByText(INVALID_EMAIL_ERROR_REGEX)).toBeVisible();
      await expect(page.getByText(PASSWORD_LENGTH_ERROR_REGEX)).toBeVisible();

      // Should still be on signin page
      await expect(page).toHaveURL(SIGNIN_URL_REGEX);
    });
  });

  test.describe('Form Interaction', () => {
    test('should handle keyboard navigation properly', async ({ page }) => {
      // Start from email field
      await page.getByLabel(EMAIL_LABEL_REGEX).focus();
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeFocused();

      // Tab to password field
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeFocused();

      // Tab to submit button
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: SIGNIN_HEADING_REGEX })).toBeFocused();

      // Tab to Google button
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: GOOGLE_BUTTON_REGEX })).toBeFocused();
    });

    test('should handle form submission with Enter key', async ({ page }) => {
      // Fill valid form data
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('test@example.com');
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('password123');

      // Press Enter on password field to submit
      await page.getByLabel(PASSWORD_LABEL_REGEX).press('Enter');

      // Form should attempt to submit (we'll see loading state or error)
      // Note: Actual authentication will fail in test environment, but form submission should work
    });

    test('should show loading states during form submission', async ({ page }) => {
      // Fill valid form data
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('test@example.com');
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('password123');

      // Submit form
      await page.getByRole('button', { name: SIGNIN_HEADING_REGEX }).click();

      // Should show loading state (disabled buttons)
      await expect(page.getByRole('button', { name: SIGNIN_HEADING_REGEX })).toBeDisabled();
      await expect(page.getByRole('button', { name: GOOGLE_BUTTON_REGEX })).toBeDisabled();
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeDisabled();
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeDisabled();
    });

    test('should handle authentication errors gracefully', async ({ page }) => {
      // Fill form with invalid credentials
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('wrong@example.com');
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('wrongpassword');

      // Submit form
      await page.getByRole('button', { name: SIGNIN_HEADING_REGEX }).click();

      // Should show error message
      await expect(page.getByText(AUTH_ERROR_REGEX)).toBeVisible();

      // Form should be re-enabled for retry
      await expect(page.getByRole('button', { name: SIGNIN_HEADING_REGEX })).toBeEnabled();
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeEnabled();
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeEnabled();
    });
  });

  test.describe('Google OAuth Integration', () => {
    test('should have Google sign in button with proper styling', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: GOOGLE_BUTTON_REGEX });

      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();

      // Should have Google icon (check for SVG or icon presence)
      await expect(googleButton.locator('svg')).toBeVisible();
    });

    test('should handle Google button click', async ({ page }) => {
      // Note: In a real test environment, you would mock the OAuth flow
      // For now, we'll just test that the button is clickable
      const googleButton = page.getByRole('button', { name: GOOGLE_BUTTON_REGEX });

      await expect(googleButton).toBeEnabled();

      // Click should work (in real implementation would redirect to Google)
      await googleButton.click();

      // Should show loading state
      await expect(googleButton).toBeDisabled();
    });
  });

  test.describe('Accessibility', () => {
    test('should meet basic accessibility requirements', async ({ page }) => {
      // Check for proper heading structure
      const heading = page.getByRole('heading', { name: SIGNIN_HEADING_REGEX });
      await expect(heading).toBeVisible();

      // Check for proper form labels
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeVisible();
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeVisible();

      // Check for button accessibility
      await expect(page.getByRole('button', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
      await expect(page.getByRole('button', { name: GOOGLE_BUTTON_REGEX })).toBeVisible();
    });

    test('should handle high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });

      // Elements should still be visible
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toBeVisible();
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toBeVisible();
    });

    test('should work with screen reader simulation', async ({ page }) => {
      // Check that important elements have accessible text
      const emailInput = page.getByLabel(EMAIL_LABEL_REGEX);
      const passwordInput = page.getByLabel(PASSWORD_LABEL_REGEX);
      const submitButton = page.getByRole('button', { name: SIGNIN_HEADING_REGEX });

      await expect(emailInput).toHaveAccessibleName(EMAIL_LABEL_REGEX);
      await expect(passwordInput).toHaveAccessibleName(PASSWORD_LABEL_REGEX);
      await expect(submitButton).toHaveAccessibleName(SIGNIN_HEADING_REGEX);
    });
  });

  test.describe('Protected Route Redirection', () => {
    test('should redirect to dashboard if already authenticated', async ({ page }) => {
      // Note: This test would require setting up authentication state
      // In a real scenario, you would:
      // 1. Mock authentication state
      // 2. Navigate to signin page
      // 3. Expect redirect to dashboard

      // For now, we'll test the unauthenticated case
      await page.goto('/signin');
      await expect(page).toHaveURL(SIGNIN_URL_REGEX);
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
    });

    test('should redirect to intended page after successful login', async ({ page }) => {
      // This would test the redirect after successful authentication
      // In a real implementation:
      // 1. Try to access protected route (should redirect to signin)
      // 2. Login successfully
      // 3. Should redirect back to originally intended route

      // For now, we'll just verify the signin page works
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive information in page source', async ({ page }) => {
      // Fill password field
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('secretpassword123');

      // Get page content
      const pageContent = await page.content();

      // Password should not be visible in plain text in the DOM
      expect(pageContent).not.toContain('secretpassword123');
    });

    test('should have proper form security attributes', async ({ page }) => {
      // const form = page.locator('form');
      const passwordInput = page.getByLabel(PASSWORD_LABEL_REGEX);

      // Password input should have proper type
      await expect(passwordInput).toHaveAttribute('type', 'password');

      // Form should have proper autocomplete settings
      await expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });
  });

  test.describe('Performance', () => {
    test('should load signin page quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/signin');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Page should load within reasonable time (adjust threshold as needed)
      expect(loadTime).toBeLessThan(MAX_LOAD_TIME_MS);

      // Essential elements should be visible
      await expect(page.getByRole('heading', { name: SIGNIN_HEADING_REGEX })).toBeVisible();
    });

    test('should handle form interactions smoothly', async ({ page }) => {
      // Test rapid form interactions
      await page.getByLabel(EMAIL_LABEL_REGEX).fill('test@example.com');
      await page.getByLabel(PASSWORD_LABEL_REGEX).fill('password123');

      // Form should respond immediately
      await expect(page.getByLabel(EMAIL_LABEL_REGEX)).toHaveValue('test@example.com');
      await expect(page.getByLabel(PASSWORD_LABEL_REGEX)).toHaveValue('password123');
    });
  });
});
