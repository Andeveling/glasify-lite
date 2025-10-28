import { expect, test } from "@playwright/test";

// Constants
const PRICE_CALCULATION_WAIT = 500;
const SCROLL_ANIMATION_WAIT = 300;
const ADD_TO_CART_BUTTON_REGEX = /agregar al carrito/i;
const CONFIGURE_ANOTHER_BUTTON_REGEX = /configurar otro/i;
const CATALOG_BUTTON_REGEX = /catálogo/i;
const CART_BUTTON_REGEX = /carrito/i;

test.describe("Catalog Model Form - Add to Cart UX", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a model detail page (using a known model from seed data)
    await page.goto("/catalog");
    await page.waitForLoadState("networkidle");

    // Click on first model card
    const firstModelCard = page.locator('[data-testid="model-card"]').first();
    await firstModelCard.click();
    await page.waitForLoadState("networkidle");
  });

  test("should show success actions after adding to cart", async ({ page }) => {
    // Fill form with valid data
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1000");
    await heightInput.fill("1500");

    // Wait for price calculation
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Scroll down to bottom to test auto-scroll to top
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Submit form
    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Wait a bit for scroll animation
    await page.waitForTimeout(SCROLL_ANIMATION_WAIT);

    // Verify success actions component is shown
    const successCard = page.locator("text=¡Agregado exitosamente!");
    await expect(successCard).toBeVisible();

    // Verify that page scrolled to top (success card should be in viewport)
    const isInViewport = await successCard.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return rect.top >= 0 && rect.top <= window.innerHeight;
    });
    expect(isInViewport).toBe(true);

    // Verify action buttons are present
    await expect(
      page.getByRole("button", { name: CONFIGURE_ANOTHER_BUTTON_REGEX })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: CATALOG_BUTTON_REGEX })
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: CART_BUTTON_REGEX })
    ).toBeVisible();
  });

  test("should reset form when configuring another item", async ({ page }) => {
    // Fill form with custom dimensions
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1200");
    await heightInput.fill("1800");

    // Wait for price calculation
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Submit form
    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Wait for success card
    await expect(page.locator("text=¡Agregado exitosamente!")).toBeVisible();

    // Click "Configure Another"
    const configureAnotherButton = page.getByRole("button", {
      name: CONFIGURE_ANOTHER_BUTTON_REGEX,
    });
    await configureAnotherButton.click();

    // Verify form is reset to default values (minimum dimensions)
    // Note: We can't test exact values without knowing model min dimensions
    // but we can verify the form is visible again and success card is hidden
    await expect(
      page.locator("text=¡Agregado exitosamente!")
    ).not.toBeVisible();
    await expect(widthInput).toBeVisible();
    await expect(heightInput).toBeVisible();

    // Verify submit button is available again
    await expect(submitButton).toBeVisible();
  });

  test("should navigate to catalog when clicking catalog button", async ({
    page,
  }) => {
    // Fill and submit form
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1000");
    await heightInput.fill("1500");
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Wait for success card
    await expect(page.locator("text=¡Agregado exitosamente!")).toBeVisible();

    // Click "Catalog" button
    const catalogButton = page.getByRole("button", {
      name: CATALOG_BUTTON_REGEX,
    });
    await catalogButton.click();

    // Verify navigation to catalog page
    await page.waitForURL("/catalog");
    await expect(page).toHaveURL("/catalog");
  });

  test("should navigate to cart when clicking cart button", async ({
    page,
  }) => {
    // Fill and submit form
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1000");
    await heightInput.fill("1500");
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Wait for success card
    await expect(page.locator("text=¡Agregado exitosamente!")).toBeVisible();

    // Click "Cart" button
    const cartButton = page.getByRole("button", { name: CART_BUTTON_REGEX });
    await cartButton.click();

    // Verify navigation to cart page
    await page.waitForURL("/cart");
    await expect(page).toHaveURL("/cart");
  });

  test("should allow adding multiple items by using configure another", async ({
    page,
  }) => {
    // Add first item
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1000");
    await heightInput.fill("1500");
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Wait for success card
    await expect(page.locator("text=¡Agregado exitosamente!")).toBeVisible();

    // Click "Configure Another"
    const configureAnotherButton = page.getByRole("button", {
      name: CONFIGURE_ANOTHER_BUTTON_REGEX,
    });
    await configureAnotherButton.click();

    // Add second item with different dimensions
    await widthInput.fill("800");
    await heightInput.fill("1200");
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    await submitButton.click();

    // Verify success card shows again
    await expect(page.locator("text=¡Agregado exitosamente!")).toBeVisible();

    // Navigate to cart to verify both items are there
    const cartButton = page.getByRole("button", { name: CART_BUTTON_REGEX });
    await cartButton.click();

    // Wait for cart page
    await page.waitForURL("/cart");

    // Verify cart has items (at least 2)
    const cartItems = page.locator('[data-testid="cart-item"]');
    await expect(cartItems).toHaveCount(2, { timeout: 5000 });
  });

  test("should show toast notification when adding to cart", async ({
    page,
  }) => {
    // Fill form
    const widthInput = page.locator('input[name="width"]');
    const heightInput = page.locator('input[name="height"]');

    await widthInput.fill("1000");
    await heightInput.fill("1500");
    await page.waitForTimeout(PRICE_CALCULATION_WAIT);

    // Submit form
    const submitButton = page.getByRole("button", {
      name: ADD_TO_CART_BUTTON_REGEX,
    });
    await submitButton.click();

    // Verify toast notification appears
    const toast = page.locator("text=Item agregado al carrito");
    await expect(toast).toBeVisible({ timeout: 3000 });
  });
});
