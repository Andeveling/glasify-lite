/**
 * E2E Test: Admin Dashboard Flow
 *
 * Tests complete admin user flow including:
 * - Login and redirect to /dashboard
 * - Access to admin-only routes (models, quotes, settings, users)
 * - Admin-only actions (create model, view all quotes)
 * - Blocked access for non-admin users
 *
 * Reference: T045 [P] Create E2E test: admin dashboard flow
 * @module e2e/rbac/admin-dashboard
 */

import { expect, test } from "@playwright/test";

// Test user credentials (assuming these exist in test database)
const ADMIN_USER = {
  email: process.env.TEST_ADMIN_EMAIL || "admin@glasify.test",
  password: process.env.TEST_ADMIN_PASSWORD || "Admin123!",
};

const NON_ADMIN_USER = {
  email: process.env.TEST_USER_EMAIL || "user@glasify.test",
  password: process.env.TEST_USER_PASSWORD || "User123!",
};

test.describe("Admin Dashboard Flow", () => {
  test.describe("Admin User Access", () => {
    test("should redirect admin to /dashboard after login", async ({
      page,
    }) => {
      // Navigate to signin page
      await page.goto("/signin");

      // Fill in admin credentials
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);

      // Submit form
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      // Wait for redirect and verify URL
      await page.waitForURL(/\/dashboard/);
      expect(page.url()).toContain("/dashboard");
    });

    test("should display admin navigation menu", async ({ page }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Verify admin navigation items are visible
      await expect(
        page.getByRole("link", { name: /dashboard/i })
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /modelos/i })).toBeVisible();
      await expect(
        page.getByRole("link", { name: /cotizaciones/i })
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /usuarios/i })).toBeVisible();
    });

    test("should access /dashboard/models route", async ({ page }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Navigate to models page
      await page.goto("/dashboard/models");

      // Verify page loaded successfully
      await expect(page).toHaveURL(/\/dashboard\/models/);
      await expect(
        page.getByRole("heading", { name: /modelos/i })
      ).toBeVisible();
    });

    test("should access /dashboard/quotes route", async ({ page }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Navigate to quotes page
      await page.goto("/dashboard/quotes");

      // Verify page loaded successfully
      await expect(page).toHaveURL(/\/dashboard\/quotes/);
      await expect(
        page.getByRole("heading", { name: /cotizaciones/i })
      ).toBeVisible();
    });

    test("should access /dashboard/users route", async ({ page }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Navigate to users page
      await page.goto("/dashboard/users");

      // Verify page loaded successfully
      await expect(page).toHaveURL(/\/dashboard\/users/);
      // Note: This is a placeholder page, so just verify URL
    });

    test('should display "Create Model" button (admin-only action)', async ({
      page,
    }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Navigate to models page
      await page.goto("/dashboard/models");

      // Verify admin-only "Create" button is visible
      await expect(
        page.getByRole("button", { name: /crear modelo/i })
      ).toBeVisible();
    });

    test("should view all quotes as admin", async ({ page }) => {
      // Login as admin
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/dashboard/);

      // Navigate to quotes page
      await page.goto("/dashboard/quotes");

      // Verify quotes list is visible (admin sees all quotes)
      await expect(page.getByRole("table")).toBeVisible();
      // Note: Admin should see quotes from all users, not just their own
    });
  });

  test.describe("Non-Admin User Restrictions", () => {
    test("should redirect non-admin from /dashboard to /my-quotes", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(NON_ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(NON_ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      // Wait for redirect (should go to /my-quotes, not /dashboard)
      await page.waitForURL(/\/my-quotes/);
      expect(page.url()).toContain("/my-quotes");
      expect(page.url()).not.toContain("/dashboard");
    });

    test("should block direct access to /dashboard for non-admin", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(NON_ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(NON_ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/my-quotes/);

      // Try to access dashboard directly
      await page.goto("/dashboard");

      // Should be redirected to /my-quotes
      await page.waitForURL(/\/my-quotes/);
      expect(page.url()).toContain("/my-quotes");
      expect(page.url()).not.toContain("/dashboard");
    });

    test("should block access to /dashboard/models for non-admin", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(NON_ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(NON_ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/my-quotes/);

      // Try to access models page directly
      await page.goto("/dashboard/models");

      // Should be redirected to /my-quotes
      await page.waitForURL(/\/my-quotes/);
      expect(page.url()).toContain("/my-quotes");
    });

    test("should block access to /dashboard/quotes for non-admin", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(NON_ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(NON_ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/my-quotes/);

      // Try to access quotes page directly
      await page.goto("/dashboard/quotes");

      // Should be redirected to /my-quotes
      await page.waitForURL(/\/my-quotes/);
      expect(page.url()).toContain("/my-quotes");
    });

    test("should not display admin navigation for non-admin", async ({
      page,
    }) => {
      // Login as regular user
      await page.goto("/signin");
      await page.getByLabel(/email/i).fill(NON_ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(NON_ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();
      await page.waitForURL(/\/my-quotes/);

      // Verify admin navigation items are NOT visible
      await expect(
        page.getByRole("link", { name: /^dashboard$/i })
      ).not.toBeVisible();
      await expect(
        page.getByRole("link", { name: /usuarios/i })
      ).not.toBeVisible();

      // Verify user sees their own navigation
      await expect(
        page.getByRole("link", { name: /mis cotizaciones/i })
      ).toBeVisible();
      await expect(page.getByRole("link", { name: /catálogo/i })).toBeVisible();
    });
  });

  test.describe("Unauthenticated Access", () => {
    test("should redirect unauthenticated user to /signin with callbackUrl", async ({
      page,
    }) => {
      // Try to access dashboard without login
      await page.goto("/dashboard");

      // Should be redirected to signin with callbackUrl
      await page.waitForURL(/\/signin/);
      expect(page.url()).toContain("/signin");
      expect(page.url()).toContain("callbackUrl=%2Fdashboard");
    });

    test("should redirect to dashboard after signin with callbackUrl", async ({
      page,
    }) => {
      // Try to access dashboard (will redirect to signin)
      await page.goto("/dashboard");
      await page.waitForURL(/\/signin/);

      // Login
      await page.getByLabel(/email/i).fill(ADMIN_USER.email);
      await page.getByLabel(/contraseña/i).fill(ADMIN_USER.password);
      await page.getByRole("button", { name: /iniciar sesión/i }).click();

      // Should redirect back to dashboard
      await page.waitForURL(/\/dashboard/);
      expect(page.url()).toContain("/dashboard");
    });
  });
});
