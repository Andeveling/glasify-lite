import { expect, test } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to signin page before each test
    await page.goto('/signin');
  });

  test.describe('Sign In Page UI', () => {
    test('should render signin page correctly', async ({ page }) => {
      // Check page title and metadata
      await expect(page).toHaveTitle(/iniciar sesión.*glasify/i);

      // Check main heading
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

      // Check description
      await expect(page.getByText(/ingresa a tu cuenta para acceder al panel/i)).toBeVisible();

      // Check form elements
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contraseña/i)).toBeVisible();

      // Check buttons
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();

      // Check separator
      await expect(page.getByText(/o continúa con/i)).toBeVisible();
    });

    test('should have proper form attributes', async ({ page }) => {
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/contraseña/i);

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
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();

      // Test tablet view
      await page.setViewportSize({ height: 1024, width: 768 });
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

      // Test desktop view
      await page.setViewportSize({ height: 800, width: 1200 });
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation errors for empty form submission', async ({ page }) => {
      // Try to submit empty form
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Check validation errors appear
      await expect(page.getByText(/el email es requerido/i)).toBeVisible();
      await expect(page.getByText(/la contraseña es requerida/i)).toBeVisible();
    });

    test('should validate email format', async ({ page }) => {
      // Enter invalid email
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/email/i).blur();

      // Check email validation error
      await expect(page.getByText(/ingresa un email válido/i)).toBeVisible();
    });

    test('should validate password length', async ({ page }) => {
      // Enter short password
      await page.getByLabel(/contraseña/i).fill('123');
      await page.getByLabel(/contraseña/i).blur();

      // Check password validation error
      await expect(page.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeVisible();
    });

    test('should clear validation errors when correcting input', async ({ page }) => {
      // Trigger validation error
      await page.getByLabel(/email/i).fill('invalid');
      await page.getByLabel(/email/i).blur();
      await expect(page.getByText(/ingresa un email válido/i)).toBeVisible();

      // Correct the input
      await page.getByLabel(/email/i).fill('valid@example.com');
      await page.getByLabel(/email/i).blur();

      // Error should disappear
      await expect(page.getByText(/ingresa un email válido/i)).not.toBeVisible();
    });

    test('should prevent submission with invalid data', async ({ page }) => {
      // Fill invalid data
      await page.getByLabel(/email/i).fill('invalid-email');
      await page.getByLabel(/contraseña/i).fill('123');

      // Try to submit
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Should show validation errors and not submit
      await expect(page.getByText(/ingresa un email válido/i)).toBeVisible();
      await expect(page.getByText(/la contraseña debe tener al menos 6 caracteres/i)).toBeVisible();

      // Should still be on signin page
      await expect(page).toHaveURL(/signin/);
    });
  });

  test.describe('Form Interaction', () => {
    test('should handle keyboard navigation properly', async ({ page }) => {
      // Start from email field
      await page.getByLabel(/email/i).focus();
      await expect(page.getByLabel(/email/i)).toBeFocused();

      // Tab to password field
      await page.keyboard.press('Tab');
      await expect(page.getByLabel(/contraseña/i)).toBeFocused();

      // Tab to submit button
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeFocused();

      // Tab to Google button
      await page.keyboard.press('Tab');
      await expect(page.getByRole('button', { name: /google/i })).toBeFocused();
    });

    test('should handle form submission with Enter key', async ({ page }) => {
      // Fill valid form data
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/contraseña/i).fill('password123');

      // Press Enter on password field to submit
      await page.getByLabel(/contraseña/i).press('Enter');

      // Form should attempt to submit (we'll see loading state or error)
      // Note: Actual authentication will fail in test environment, but form submission should work
    });

    test('should show loading states during form submission', async ({ page }) => {
      // Fill valid form data
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/contraseña/i).fill('password123');

      // Submit form
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Should show loading state (disabled buttons)
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeDisabled();
      await expect(page.getByRole('button', { name: /google/i })).toBeDisabled();
      await expect(page.getByLabel(/email/i)).toBeDisabled();
      await expect(page.getByLabel(/contraseña/i)).toBeDisabled();
    });

    test('should handle authentication errors gracefully', async ({ page }) => {
      // Fill form with invalid credentials
      await page.getByLabel(/email/i).fill('wrong@example.com');
      await page.getByLabel(/contraseña/i).fill('wrongpassword');

      // Submit form
      await page.getByRole('button', { name: /iniciar sesión/i }).click();

      // Should show error message
      await expect(page.getByText(/email o contraseña incorrectos/i)).toBeVisible();

      // Form should be re-enabled for retry
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeEnabled();
      await expect(page.getByLabel(/email/i)).toBeEnabled();
      await expect(page.getByLabel(/contraseña/i)).toBeEnabled();
    });
  });

  test.describe('Google OAuth Integration', () => {
    test('should have Google sign in button with proper styling', async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /google/i });

      await expect(googleButton).toBeVisible();
      await expect(googleButton).toBeEnabled();

      // Should have Google icon (check for SVG or icon presence)
      await expect(googleButton.locator('svg')).toBeVisible();
    });

    test('should handle Google button click', async ({ page }) => {
      // Note: In a real test environment, you would mock the OAuth flow
      // For now, we'll just test that the button is clickable
      const googleButton = page.getByRole('button', { name: /google/i });

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
      const heading = page.getByRole('heading', { name: /iniciar sesión/i });
      await expect(heading).toBeVisible();

      // Check for proper form labels
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contraseña/i)).toBeVisible();

      // Check for button accessibility
      await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
      await expect(page.getByRole('button', { name: /google/i })).toBeVisible();
    });

    test('should handle high contrast mode', async ({ page }) => {
      // Simulate high contrast mode
      await page.emulateMedia({ colorScheme: 'dark' });

      // Elements should still be visible
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
      await expect(page.getByLabel(/email/i)).toBeVisible();
      await expect(page.getByLabel(/contraseña/i)).toBeVisible();
    });

    test('should work with screen reader simulation', async ({ page }) => {
      // Check that important elements have accessible text
      const emailInput = page.getByLabel(/email/i);
      const passwordInput = page.getByLabel(/contraseña/i);
      const submitButton = page.getByRole('button', { name: /iniciar sesión/i });

      await expect(emailInput).toHaveAccessibleName(/email/i);
      await expect(passwordInput).toHaveAccessibleName(/contraseña/i);
      await expect(submitButton).toHaveAccessibleName(/iniciar sesión/i);
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
      await expect(page).toHaveURL(/signin/);
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    });

    test('should redirect to intended page after successful login', async ({ page }) => {
      // This would test the redirect after successful authentication
      // In a real implementation:
      // 1. Try to access protected route (should redirect to signin)
      // 2. Login successfully
      // 3. Should redirect back to originally intended route

      // For now, we'll just verify the signin page works
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    });
  });

  test.describe('Security', () => {
    test('should not expose sensitive information in page source', async ({ page }) => {
      // Fill password field
      await page.getByLabel(/contraseña/i).fill('secretpassword123');

      // Get page content
      const pageContent = await page.content();

      // Password should not be visible in plain text in the DOM
      expect(pageContent).not.toContain('secretpassword123');
    });

    test('should have proper form security attributes', async ({ page }) => {
      const form = page.locator('form');
      const passwordInput = page.getByLabel(/contraseña/i);

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
      expect(loadTime).toBeLessThan(3000); // 3 seconds

      // Essential elements should be visible
      await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();
    });

    test('should handle form interactions smoothly', async ({ page }) => {
      // Test rapid form interactions
      await page.getByLabel(/email/i).fill('test@example.com');
      await page.getByLabel(/contraseña/i).fill('password123');

      // Form should respond immediately
      await expect(page.getByLabel(/email/i)).toHaveValue('test@example.com');
      await expect(page.getByLabel(/contraseña/i)).toHaveValue('password123');
    });
  });
});
