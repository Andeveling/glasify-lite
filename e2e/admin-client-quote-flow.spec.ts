/**
 * E2E Tests: Admin Client + Quote Creation E2E Flow
 *
 * Full admin workflow: login → create client → create quote for that client → verify quote in list.
 * Uses Better Auth test utils for session injection (no OAuth needed).
 * Requires BETTER_AUTH_TEST_UTILS="true" in .env.local
 *
 * @module e2e/admin-client-quote-flow
 */

import { expect, test } from "@playwright/test";
import {
  createAdminSession,
  injectAuthCookies,
} from "./helpers/test-auth-helper";

// ---------------------------------------------------------------------------
// Helper: generate unique test data
// ---------------------------------------------------------------------------
function uniqueEmail(): string {
  return `client-test-${Date.now()}@example.com`;
}

// ---------------------------------------------------------------------------
// Test Suite: Admin Client + Quote E2E Flow
// ---------------------------------------------------------------------------
test.describe("Admin Client → Quote E2E Flow", () => {
  let adminSession: Awaited<ReturnType<typeof createAdminSession>>;

  test.beforeEach(async ({ page }) => {
    adminSession = await createAdminSession();
    await injectAuthCookies(page, adminSession.user.cookies);
  });

  test.afterEach(async () => {
    if (adminSession) {
      await adminSession.cleanup();
    }
  });

  // -------------------------------------------------------------------------
  // Test: Full happy path — create client, create quote, verify in list
  // -------------------------------------------------------------------------
  test(
    "ADMIN-FLOW-001: admin creates a client and then a quote for that client",
    { tag: ["@critical", "@e2e", "@admin-flow"] },
    async ({ page }) => {
      const clientName = `Vidrios Panama ${Date.now()}`;
      const clientCompany = "Vidrios La Equidad";
      const clientEmail = uniqueEmail();
      const clientPhone = "+507 6000-0000";
      const projectName = `Obra Edificio Test ${Date.now()}`;
      const projectCity = "Panama City";

      // ── Step 1: Navigate to Clients ──────────────────────────────────────
      await page.goto("/admin/clients");
      await page.waitForLoadState("networkidle");

      // Verify we're on the clients page
      await expect(page.locator("h1:has-text('Clientes')")).toBeVisible();

      // ── Step 2: Create a new client ──────────────────────────────────────
      await page.click('button:has-text("Nuevo Cliente")');

      // Wait for the form to appear
      await page.waitForURL("**/admin/clients/new", { timeout: 10_000 });
      await expect(page.locator("h1:has-text('Crear Nuevo Cliente')")).toBeVisible();

      // Fill client form
      await page.fill('input[id="name"]', clientName);
      await page.fill('input[id="email"]', clientEmail);
      await page.fill('input[id="phone"]', clientPhone);
      await page.fill('input[id="company"]', clientCompany);

      // Submit
      await page.click('button:has-text("Crear Cliente")');

      // Wait for redirect back to clients list
      await page.waitForURL("**/admin/clients", { timeout: 10_000 });

      // Verify client appears in the list
      await expect(page.locator(`text=${clientName}`).first()).toBeVisible();
      await expect(page.locator(`text=${clientCompany}`).first()).toBeVisible();

      // ── Step 3: Navigate to New Quote ─────────────────────────────────────
      await page.goto("/admin/quotes/new");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Información del Proyecto")).toBeVisible();

      // ── Step 4: Select the client we just created ─────────────────────────
      // The client selector dropdown should contain our client
      const clientSelectTrigger = page.locator(
        '[data-slot="select-trigger"]:has-text("Sin asignar")'
      );
      await clientSelectTrigger.click();

      // Wait for dropdown options to load
      await page.waitForSelector('[role="option"]', { timeout: 5000 });

      // Select the client by name
      await page.click(`[role="option"]:has-text("${clientName}")`);

      // Verify client is now selected
      await expect(
        clientSelectTrigger.locator(`text=${clientName}`)
      ).toBeVisible();

      // ── Step 5: Fill project info ─────────────────────────────────────────
      await page.fill('input[id="projectName"]', projectName);
      await page.fill('input[id="projectStreet"]', "Av. Principal 123");
      await page.fill('input[id="projectCity"]', projectCity);
      await page.fill('input[id="projectState"]', "Panama");

      // ── Step 6: Add a quote item ───────────────────────────────────────────
      // Click "Agregar Ítem"
      await page.click('button:has-text("Agregar Ítem")');

      // Wait for the item row to appear
      await page.waitForSelector('[data-slot="select-trigger"]', { timeout: 5000 });

      // Select a model (first available option)
      const modelTrigger = page.locator(
        '[data-slot="select-trigger"]'
      ).first();
      await modelTrigger.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      const firstModel = page.locator("[role='option']").first();
      const modelName = await firstModel.textContent();
      await firstModel.click();

      // Select a glass type (second dropdown)
      const glassTrigger = page.locator('[data-slot="select-trigger"]').nth(1);
      await glassTrigger.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.locator("[role='option']").first().click();

      // Fill dimensions
      const widthInputs = page.locator('input[id^="items"][id$="widthMm"]');
      const heightInputs = page.locator('input[id^="items"][id$="heightMm"]');
      await widthInputs.first().fill("1000");
      await heightInputs.first().fill("2000");

      // ── Step 7: Submit the quote ──────────────────────────────────────────
      const submitButton = page.locator('button:has-text("Crear Cotización")');
      await expect(submitButton).toBeEnabled();
      await submitButton.click();

      // Wait for redirect to quote detail page
      await page.waitForURL(/\/admin\/quotes\/[a-z0-9]+/, { timeout: 15_000 });

      // Verify quote was created — check we're on a quote detail page
      await expect(page.locator("text=Información del Proyecto")).toBeVisible();

      // ── Step 8: Verify the quote appears in the quotes list ────────────────
      await page.goto("/admin/quotes");
      await page.waitForLoadState("networkidle");

      // The project name should appear in the quotes list
      await expect(page.locator(`text=${projectName}`).first()).toBeVisible();

      // The client name should appear
      await expect(page.locator(`text=${clientName}`).first()).toBeVisible();
    },
  );

  // -------------------------------------------------------------------------
  // Test: Client form validation — required fields
  // -------------------------------------------------------------------------
  test(
    "ADMIN-FLOW-002: client form requires name field",
    { tag: ["@high", "@e2e", "@validation"] },
    async ({ page }) => {
      // Navigate to new client page
      await page.goto("/admin/clients/new");
      await page.waitForLoadState("networkidle");

      // Try to submit without filling anything
      await page.click('button:has-text("Crear Cliente")');

      // Should show validation error for name (required field)
      await expect(page.locator("text=El nombre es requerido")).toBeVisible();
    },
  );

  // -------------------------------------------------------------------------
  // Test: Quote creation redirects to clients when no clientId
  // -------------------------------------------------------------------------
  test(
    "ADMIN-FLOW-003: new quote without clientId redirects to clients",
    { tag: ["@high", "@e2e", "@redirect"] },
    async ({ page }) => {
      // Navigate directly to /admin/quotes/new without clientId
      await page.goto("/admin/quotes/new");
      await page.waitForLoadState("networkidle");

      // Should redirect to clients list (because no client selected)
      await page.waitForURL("**/admin/clients", { timeout: 10_000 });
      await expect(page.locator("h1:has-text('Clientes')")).toBeVisible();
    },
  );

  // -------------------------------------------------------------------------
  // Test: Auth required — unauthenticated user redirected to signin
  // -------------------------------------------------------------------------
  test(
    "ADMIN-FLOW-004: unauthenticated user is redirected to signin",
    { tag: ["@critical", "@e2e", "@auth"] },
    async ({ page }) => {
      // Clear all cookies (sign out)
      await page.context().clearCookies();

      // Navigate to clients page
      await page.goto("/admin/clients");

      // Should redirect to signin
      await page.waitForURL(/\/signin/, { timeout: 10_000 });
      await expect(page.locator('input[id="signin-email"]')).toBeVisible();
    },
  );

  // -------------------------------------------------------------------------
  // Test: Create client, then create second quote for same client
  // -------------------------------------------------------------------------
  test(
    "ADMIN-FLOW-005: admin can create multiple quotes for same client",
    { tag: ["@medium", "@e2e", "@admin-flow"] },
    async ({ page }) => {
      const clientName = `Cliente Multi-Quote ${Date.now()}`;

      // Create a client
      await page.goto("/admin/clients/new");
      await page.waitForLoadState("networkidle");
      await page.fill('input[id="name"]', clientName);
      await page.fill('input[id="company"]', "Empresa Multi");
      await page.click('button:has-text("Crear Cliente")');
      await page.waitForURL("**/admin/clients", { timeout: 10_000 });

      // Create first quote
      await page.goto("/admin/quotes/new");
      await page.waitForLoadState("networkidle");

      // Select client
      const selectTrigger = page.locator('[data-slot="select-trigger"]:has-text("Sin asignar")');
      await selectTrigger.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.click(`[role="option"]:has-text("${clientName}")`);

      // Fill minimal quote data
      await page.fill('input[id="projectName"]', "Proyecto Uno");
      await page.fill('input[id="projectCity"]', "Ciudad Uno");

      // Add item
      await page.click('button:has-text("Agregar Ítem")');
      await page.waitForSelector('[data-slot="select-trigger"]', { timeout: 5000 });

      const modelTrigger = page.locator('[data-slot="select-trigger"]').first();
      await modelTrigger.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.locator("[role='option']").first().click();

      const glassTrigger = page.locator('[data-slot="select-trigger"]').nth(1);
      await glassTrigger.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.locator("[role='option']").first().click();

      // Submit first quote
      await page.click('button:has-text("Crear Cotización")');
      await page.waitForURL(/\/admin\/quotes\/[a-z0-9]+/, { timeout: 15_000 });

      // Create second quote for same client
      await page.goto("/admin/quotes/new");
      await page.waitForLoadState("networkidle");

      // Select same client again
      const selectTrigger2 = page.locator('[data-slot="select-trigger"]:has-text("Sin asignar")');
      await selectTrigger2.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.click(`[role="option"]:has-text("${clientName}")`);

      // Fill second quote
      await page.fill('input[id="projectName"]', "Proyecto Dos");
      await page.fill('input[id="projectCity"]', "Ciudad Dos");

      await page.click('button:has-text("Agregar Ítem")');
      await page.waitForSelector('[data-slot="select-trigger"]', { timeout: 5000 });

      const modelTrigger2 = page.locator('[data-slot="select-trigger"]').first();
      await modelTrigger2.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.locator("[role='option']").first().click();

      const glassTrigger2 = page.locator('[data-slot="select-trigger"]').nth(1);
      await glassTrigger2.click();
      await page.waitForSelector("[role='option']", { timeout: 5000 });
      await page.locator("[role='option']").first().click();

      await page.click('button:has-text("Crear Cotización")');
      await page.waitForURL(/\/admin\/quotes\/[a-z0-9]+/, { timeout: 15_000 });

      // Both quotes should appear in the list
      await page.goto("/admin/quotes");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Proyecto Uno")).toBeVisible();
      await expect(page.locator("text=Proyecto Dos")).toBeVisible();
    },
  );
});
