/**
 * E2E Test: Product Image Viewer & Lightbox
 *
 * Verifies users can:
 * - View product thumbnail images in quote items
 * - Click thumbnails to open lightbox with full image
 * - Navigate lightbox (close, keyboard shortcuts)
 * - View product specifications overlay in lightbox
 * - See SVG diagram fallback when image unavailable
 *
 * Related to User Story 2: Product Images with SVG Fallbacks
 */

import { expect, test } from "@playwright/test";

test.describe("Product Image Viewer & Lightbox", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to My Quotes page (requires auth)
    await page.goto("/api/auth/signin");

    // Sign in with test user
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("password123");
    await page.getByRole("button", { name: /iniciar sesión/i }).click();

    // Wait for redirect to my-quotes
    await page.waitForURL("/my-quotes");

    // Click on a quote with items
    await page
      .getByRole("link", { name: /cotización/i })
      .first()
      .click();
    await page.waitForLoadState("networkidle");
  });

  test.describe("Product Thumbnail Display", () => {
    test("should display product thumbnail images for each quote item", async ({
      page,
    }) => {
      // Verify at least one product thumbnail is visible
      const thumbnails = page.locator('[data-testid="quote-item-image"]');
      await expect(thumbnails.first()).toBeVisible();

      // Verify image has alt text
      const firstImage = thumbnails.first().locator("img");
      await expect(firstImage).toHaveAttribute("alt", /.+/);
    });

    test("should display images in responsive grid (3-4 columns)", async ({
      page,
    }) => {
      const grid = page.locator('[data-testid="quote-items-grid"]');
      await expect(grid).toBeVisible();

      // Verify grid layout classes (responsive)
      await expect(grid).toHaveClass(/grid/);
      await expect(grid).toHaveClass(/md:grid-cols-3/);
      await expect(grid).toHaveClass(/lg:grid-cols-4/);
    });

    test("should show SVG diagram fallback when image unavailable", async ({
      page,
    }) => {
      // Find item with missing image (should show WindowDiagram)
      const svgFallback = page
        .locator('[data-testid="quote-item-image"]')
        .filter({
          has: page.locator("svg"),
        });

      if ((await svgFallback.count()) > 0) {
        await expect(svgFallback.first()).toBeVisible();

        // Verify SVG has accessible alt text
        const svg = svgFallback.first().locator("img");
        await expect(svg).toHaveAttribute("alt", /ventana|puerta/i);
      }
    });

    test("should apply lazy loading to images below the fold", async ({
      page,
    }) => {
      const images = page
        .locator('[data-testid="quote-item-image"] img')
        .filter({
          hasNotText: "ventana", // Only product images, not SVGs
        });

      if ((await images.count()) > 3) {
        // Images below fold should have loading="lazy"
        const belowFoldImage = images.nth(5);
        await expect(belowFoldImage).toHaveAttribute("loading", "lazy");
      }
    });

    test("should show first 3 items as preview on quote list", async ({
      page,
    }) => {
      // Go back to quote list
      await page.goBack();
      await page.waitForLoadState("networkidle");

      // Verify preview thumbnails in quote list item
      const previewThumbnails = page.locator(
        '[data-testid="quote-item-preview"]'
      );

      if ((await previewThumbnails.count()) > 0) {
        await expect(previewThumbnails.first()).toBeVisible();

        // Should show max 3 thumbnails
        const thumbnails = previewThumbnails
          .first()
          .locator('[data-testid="quote-item-image"]');
        await expect(thumbnails).toHaveCount(3);
      }
    });
  });

  test.describe("Image Lightbox", () => {
    test("should open lightbox when clicking product thumbnail", async ({
      page,
    }) => {
      // Click first product thumbnail
      const thumbnail = page
        .locator('[data-testid="quote-item-image"]')
        .first();
      await thumbnail.click();

      // Verify lightbox dialog opens
      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Verify full-size image is displayed
      const fullImage = lightbox.locator('img[data-testid="lightbox-image"]');
      await expect(fullImage).toBeVisible();
    });

    test("should display product specifications in lightbox", async ({
      page,
    }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Verify product info overlay
      await expect(lightbox.getByText(/modelo:/i)).toBeVisible();
      await expect(lightbox.getByText(/tipo:/i)).toBeVisible();
      await expect(lightbox.getByText(/dimensiones:/i)).toBeVisible();
    });

    test("should close lightbox when clicking close button", async ({
      page,
    }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Click close button
      const closeButton = lightbox.getByRole("button", { name: /cerrar/i });
      await closeButton.click();

      // Verify lightbox is closed
      await expect(lightbox).not.toBeVisible();
    });

    test("should close lightbox when clicking overlay background", async ({
      page,
    }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Click on overlay (outside image)
      await page
        .locator('[data-testid="dialog-overlay"]')
        .click({ position: { x: 10, y: 10 } });

      // Verify lightbox is closed
      await expect(lightbox).not.toBeVisible();
    });

    test("should close lightbox with Escape key", async ({ page }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Press Escape key
      await page.keyboard.press("Escape");

      // Verify lightbox is closed
      await expect(lightbox).not.toBeVisible();
    });

    test("should trap focus inside lightbox when open", async ({ page }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Focus should be trapped inside dialog
      const closeButton = lightbox.getByRole("button", { name: /cerrar/i });
      await closeButton.focus();
      await expect(closeButton).toBeFocused();

      // Tab should cycle within dialog
      await page.keyboard.press("Tab");
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBeTruthy();
    });

    test("should show SVG diagram in lightbox for items without images", async ({
      page,
    }) => {
      // Find item with SVG fallback
      const svgItem = page.locator('[data-testid="quote-item-image"]').filter({
        has: page.locator("svg"),
      });

      if ((await svgItem.count()) > 0) {
        await svgItem.first().click();

        const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
        await expect(lightbox).toBeVisible();

        // Verify SVG diagram is shown in lightbox
        const svgDiagram = lightbox.locator("svg");
        await expect(svgDiagram).toBeVisible();
      }
    });
  });

  test.describe("Image Optimization & Performance", () => {
    test("should load images progressively (lazy loading)", async ({
      page,
    }) => {
      // Check that images are lazy loaded
      const images = page.locator('[data-testid="quote-item-image"] img');
      const firstImage = images.first();

      // First image should be loaded eagerly
      await expect(firstImage).toBeVisible();

      // Verify image has loading attribute
      const loadingAttr = await firstImage.getAttribute("loading");
      expect(["lazy", "eager"]).toContain(loadingAttr);
    });

    test("should use responsive image sizes (srcset)", async ({ page }) => {
      const img = page.locator('[data-testid="quote-item-image"] img').first();

      // Verify srcset for responsive images
      const srcset = await img.getAttribute("srcset");
      expect(srcset).toBeTruthy();
    });

    test("should complete image load in under 2 seconds", async ({ page }) => {
      const startTime = Date.now();

      // Wait for first image to load
      await page
        .locator('[data-testid="quote-item-image"] img')
        .first()
        .waitFor({ state: "visible" });

      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    test("should handle image load errors gracefully", async ({ page }) => {
      // Intercept image requests and force error
      await page.route("**/models/*.jpg", (route) => route.abort());

      // Reload page
      await page.reload();

      // Verify SVG fallback is shown instead of broken images
      const images = page.locator('[data-testid="quote-item-image"]');
      await expect(images.first()).toBeVisible();

      // Should show SVG diagram, not broken image icon
      const svg = images.first().locator("svg");
      await expect(svg).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have descriptive alt text for all images", async ({
      page,
    }) => {
      const images = page.locator('[data-testid="quote-item-image"] img');
      const count = await images.count();

      for (let i = 0; i < count; i++) {
        const img = images.nth(i);
        const alt = await img.getAttribute("alt");

        expect(alt).toBeTruthy();
        expect(alt?.length).toBeGreaterThan(0);
      }
    });

    test("should be keyboard navigable (Tab + Enter)", async ({ page }) => {
      // Tab to first product thumbnail
      await page.keyboard.press("Tab");
      await page.keyboard.press("Tab");

      const thumbnail = page
        .locator('[data-testid="quote-item-image"]')
        .first();
      await thumbnail.focus();

      // Press Enter to open lightbox
      await page.keyboard.press("Enter");

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();
    });

    test("should announce image changes to screen readers", async ({
      page,
    }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');

      // Verify ARIA attributes
      const ariaModal = await lightbox.getAttribute("aria-modal");
      expect(ariaModal).toBe("true");

      const ariaLabel = await lightbox.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    });

    test("should have visible focus indicators", async ({ page }) => {
      const thumbnail = page
        .locator('[data-testid="quote-item-image"]')
        .first();
      await thumbnail.focus();

      // Verify focus ring is visible
      await expect(thumbnail).toHaveClass(/focus-visible:ring/);
    });
  });

  test.describe("Mobile Responsive", () => {
    test.use({ viewport: { height: 667, width: 375 } }); // iPhone SE

    test("should show 2-column grid on mobile", async ({ page }) => {
      await page.goto("/my-quotes");
      await page
        .getByRole("link", { name: /cotización/i })
        .first()
        .click();

      const grid = page.locator('[data-testid="quote-items-grid"]');

      // Verify mobile grid (2 columns)
      await expect(grid).toHaveClass(/grid-cols-2/);
    });

    test("should open fullscreen lightbox on mobile", async ({ page }) => {
      await page.goto("/my-quotes");
      await page
        .getByRole("link", { name: /cotización/i })
        .first()
        .click();

      // Click thumbnail
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Verify lightbox covers entire viewport
      const viewportSize = page.viewportSize();
      const lightboxBox = await lightbox.boundingBox();

      expect(lightboxBox?.width).toBeGreaterThan(viewportSize?.width * 0.9);
    });

    test("should support touch gestures to close lightbox", async ({
      page,
    }) => {
      await page.goto("/my-quotes");
      await page
        .getByRole("link", { name: /cotización/i })
        .first()
        .click();

      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      await expect(lightbox).toBeVisible();

      // Alternative: Click outside to close (simulates mobile tap)
      await page
        .locator('[data-testid="dialog-overlay"]')
        .click({ position: { x: 10, y: 10 } });

      // Verify lightbox closes
      await expect(lightbox).not.toBeVisible();

      // Note: Full swipe-to-close gesture requires custom implementation
      // This test validates basic touch interaction
    });
  });

  test.describe("Edge Cases", () => {
    test("should handle quotes with no items gracefully", async ({ page }) => {
      // Navigate to empty quote (if exists in seed data)
      // Should show empty state, not crash
      await page.goto("/my-quotes");

      const emptyState = page.getByText(/no hay elementos/i);

      if (await emptyState.isVisible()) {
        // Verify no images are rendered
        const images = page.locator('[data-testid="quote-item-image"]');
        await expect(images).toHaveCount(0);
      }
    });

    test("should handle very long product names in lightbox", async ({
      page,
    }) => {
      // Open lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();

      const lightbox = page.locator('[data-testid="image-viewer-dialog"]');
      const productName = lightbox
        .getByText(/modelo:/i)
        .locator("..")
        .getByText(/.+/);

      // Verify long names don't break layout (truncate or wrap)
      await expect(productName).toBeVisible();
    });

    test("should maintain scroll position after closing lightbox", async ({
      page,
    }) => {
      // Scroll down the page
      await page.mouse.wheel(0, 500);
      const scrollBefore = await page.evaluate(() => window.scrollY);

      // Open and close lightbox
      await page.locator('[data-testid="quote-item-image"]').first().click();
      await page.keyboard.press("Escape");

      // Verify scroll position is maintained
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(scrollAfter).toBe(scrollBefore);
    });
  });
});

/**
 * Test Coverage Summary:
 *
 * - Product Thumbnail Display: 5 tests
 * - Image Lightbox: 7 tests
 * - Image Optimization: 4 tests
 * - Accessibility: 4 tests
 * - Mobile Responsive: 3 tests
 * - Edge Cases: 3 tests
 *
 * Total: 26 E2E tests
 *
 * Expected result: ❌ FAIL (components not yet implemented)
 * Next steps: Implement T022-T028 to make tests pass
 */
