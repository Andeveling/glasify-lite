import { expect, test } from '@playwright/test';

/**
 * E2E tests for Model Detail Sidebar enhancements
 * Tests ProfileSupplierCard rendering with/without supplier data
 */
test.describe('Catalog Model Detail - Sidebar Components', () => {
  test.describe('ProfileSupplierCard - With Supplier', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to catalog and select a model with profileSupplier
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      // Click on first model card (seed data should have supplier)
      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');
    });

    test('should display profile supplier card with name and material badge', async ({ page }) => {
      // Verify card heading
      const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');
      await expect(supplierCard).toBeVisible();

      // Verify supplier name is displayed (any non-empty text)
      const supplierName = supplierCard.locator('h4, p').filter({ hasNotText: 'Proveedor de Perfiles' }).first();
      await expect(supplierName).toBeVisible();
      const nameText = await supplierName.textContent();
      expect(nameText).toBeTruthy();
      expect(nameText?.trim().length).toBeGreaterThan(0);

      // Verify material type badge is present
      const materialBadge = supplierCard.locator('[role="badge"], .badge, [class*="badge"]').first();
      await expect(materialBadge).toBeVisible();

      // Material type should be one of the valid enum values
      const badgeText = await materialBadge.textContent();
      expect(['PVC', 'ALUMINUM', 'ALUMINIO', 'WOOD', 'MADERA', 'MIXED', 'MIXTO']).toContainEqual(
        badgeText?.trim().toUpperCase()
      );
    });

    test('should display material-specific benefits list', async ({ page }) => {
      const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');

      // Verify benefits section exists
      const benefitsList = supplierCard.locator('ul, ol, [role="list"]');
      await expect(benefitsList).toBeVisible();

      // Verify at least 3 benefits are shown
      const benefitItems = benefitsList.locator('li, [role="listitem"]');
      const count = await benefitItems.count();
      expect(count).toBeGreaterThanOrEqual(3);

      // Verify benefits have meaningful text (>10 chars)
      for (let i = 0; i < count; i++) {
        const benefitText = await benefitItems.nth(i).textContent();
        expect(benefitText?.trim().length).toBeGreaterThan(10);
      }
    });

    test('should show PVC-specific benefits for PVC models', async ({ page }) => {
      // Navigate to a specific PVC model (if seed data guarantees one)
      // For now, check if current model has PVC badge and verify benefits match

      const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');
      const materialBadge = supplierCard.locator('[role="badge"], .badge, [class*="badge"]').first();
      const badgeText = await materialBadge.textContent();

      if (badgeText?.toUpperCase().includes('PVC')) {
        // Verify PVC-specific benefits are present
        const benefitsList = supplierCard.locator('ul, ol, [role="list"]');
        const benefitsText = await benefitsList.textContent();

        // Check for PVC-specific keywords in Spanish
        const pvcKeywords = ['aislamiento térmico', 'mantenimiento', 'corrosión', 'ruido'];
        const hasKeyword = pvcKeywords.some((keyword) => benefitsText?.toLowerCase().includes(keyword));
        expect(hasKeyword).toBe(true);
      }
    });

    test('should show Aluminum-specific benefits for Aluminum models', async ({ page }) => {
      const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');
      const materialBadge = supplierCard.locator('[role="badge"], .badge, [class*="badge"]').first();
      const badgeText = await materialBadge.textContent();

      if (badgeText?.toUpperCase().includes('ALUM')) {
        // Verify Aluminum-specific benefits are present
        const benefitsList = supplierCard.locator('ul, ol, [role="list"]');
        const benefitsText = await benefitsList.textContent();

        // Check for Aluminum-specific keywords in Spanish
        const aluminumKeywords = ['resistencia estructural', 'perfiles delgados', 'estética moderna', 'durabilidad'];
        const hasKeyword = aluminumKeywords.some((keyword) => benefitsText?.toLowerCase().includes(keyword));
        expect(hasKeyword).toBe(true);
      }
    });
  });

  test.describe('ProfileSupplierCard - Without Supplier (NULL handling)', () => {
    // biome-ignore lint/suspicious/noSkippedTests: Placeholder test - requires NULL supplier model in seed data
    test.skip('should display "Proveedor no especificado" when supplier is NULL', async ({ page }) => {
      // This test requires a model WITHOUT profileSupplier in seed data
      // Skip for now, will implement when we have guaranteed NULL supplier model
      // Or we can create one via API in beforeEach

      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      // TODO: Navigate to model without supplier OR create one
      // const noSupplierModel = page.locator('[data-testid="model-card"]').filter({ hasText: 'Sin proveedor' });
      // await noSupplierModel.click();

      // const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');
      // await expect(supplierCard.locator('text=Proveedor no especificado')).toBeVisible();

      // Should NOT show material badge or benefits list when NULL
      // await expect(supplierCard.locator('[role="badge"]')).not.toBeVisible();
      // await expect(supplierCard.locator('ul, ol')).not.toBeVisible();
    });

    // biome-ignore lint/suspicious/noSkippedTests: Placeholder test - requires NULL supplier model in seed data
    test.skip('should NOT crash when supplier is NULL', async ({ page }) => {
      // Safety test - verify page renders without errors when supplier missing
      // TODO: Navigate to NULL supplier model
      // Verify no console errors
      // Verify sidebar still shows other cards (ModelInfo, ModelDimensions, etc.)
    });
  });

  test.describe('ModelSpecifications Card', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');
    });

    test('should display technical specifications with performance ratings', async ({ page }) => {
      const specsCard = page.locator('text=Especificaciones Técnicas').locator('..');
      await expect(specsCard).toBeVisible();

      // Verify material type is shown
      await expect(specsCard.locator('text=Material:')).toBeVisible();

      // Verify performance ratings are displayed with stars
      const thermalRating = specsCard.locator('text=Aislamiento Térmico').locator('..');
      await expect(thermalRating).toBeVisible();
      await expect(thermalRating.locator('text=★')).toBeVisible();

      const acousticRating = specsCard.locator('text=Aislamiento Acústico').locator('..');
      await expect(acousticRating).toBeVisible();

      const structuralRating = specsCard.locator('text=Resistencia Estructural').locator('..');
      await expect(structuralRating).toBeVisible();
    });

    test('should show dimensional constraints in specifications', async ({ page }) => {
      const specsCard = page.locator('text=Especificaciones Técnicas').locator('..');

      // Verify dimensions section exists
      await expect(specsCard.locator('text=Capacidades Dimensionales')).toBeVisible();

      // Verify width and height ranges are shown
      await expect(specsCard.locator('text=Ancho')).toBeVisible();
      await expect(specsCard.locator('text=Alto')).toBeVisible();

      // Verify values have "mm" unit
      const dimensionsSection = specsCard.locator('text=Capacidades Dimensionales').locator('..');
      const dimensionsText = await dimensionsSection.textContent();
      expect(dimensionsText).toContain('mm');

      // Verify ranges format: "XXX - YYY mm"
      expect(dimensionsText).toMatch(/\d+\s*-\s*\d+\s*mm/);
    });

    test('should display 1-5 stars for performance ratings', async ({ page }) => {
      const specsCard = page.locator('text=Especificaciones Técnicas').locator('..');

      // Get all star containers
      const starContainers = specsCard.locator('[role="img"][aria-label*="estrellas"]');
      const count = await starContainers.count();
      expect(count).toBeGreaterThanOrEqual(3); // thermal, acoustic, structural

      // Verify each has valid star count (1-5)
      for (let i = 0; i < count; i++) {
        const ariaLabel = await starContainers.nth(i).getAttribute('aria-label');
        const starsMatch = ariaLabel?.match(/(\d+)\s+de\s+5/);
        expect(starsMatch).toBeTruthy();

        const starsCount = Number.parseInt(starsMatch?.[1] ?? '0', 10);
        expect(starsCount).toBeGreaterThanOrEqual(1);
        expect(starsCount).toBeLessThanOrEqual(5);
      }
    });

    test('should NOT display specifications when supplier is NULL', async ({ page }) => {
      // TODO: Navigate to model without supplier
      // Specs card should be hidden entirely (component returns null)
      // await expect(page.locator('text=Especificaciones Técnicas')).not.toBeVisible();
    });
  });

  test.describe('ModelDimensions - Dimensional Guidelines (User Story 4)', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');
    });

    test('should display dimensional constraints card with clear min/max values', async ({ page }) => {
      // Verify card heading
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');
      await expect(dimensionsCard).toBeVisible();

      // Verify all four dimensional constraints are present
      await expect(dimensionsCard.locator('text=Ancho mínimo:')).toBeVisible();
      await expect(dimensionsCard.locator('text=Ancho máximo:')).toBeVisible();
      await expect(dimensionsCard.locator('text=Alto mínimo:')).toBeVisible();
      await expect(dimensionsCard.locator('text=Alto máximo:')).toBeVisible();
    });

    test('should display dimension values in millimeters with "mm" suffix', async ({ page }) => {
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');

      // Get all dimension value elements (font-medium class contains values)
      const dimensionValues = dimensionsCard.locator('.font-medium');
      const count = await dimensionValues.count();

      expect(count).toBe(4); // Should have exactly 4 values

      // Verify all values end with "mm"
      for (let i = 0; i < count; i++) {
        const valueText = await dimensionValues.nth(i).textContent();
        expect(valueText?.trim()).toMatch(/^\d+mm$/);
      }
    });

    test('should show valid dimensional ranges (min < max)', async ({ page }) => {
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');

      // Extract min/max width values
      const minWidthRow = dimensionsCard.locator('text=Ancho mínimo:').locator('..');
      const minWidthValue = await minWidthRow.locator('.font-medium').textContent();
      const minWidth = Number.parseInt(minWidthValue?.replace('mm', '') ?? '0', 10);

      const maxWidthRow = dimensionsCard.locator('text=Ancho máximo:').locator('..');
      const maxWidthValue = await maxWidthRow.locator('.font-medium').textContent();
      const maxWidth = Number.parseInt(maxWidthValue?.replace('mm', '') ?? '0', 10);

      // Extract min/max height values
      const minHeightRow = dimensionsCard.locator('text=Alto mínimo:').locator('..');
      const minHeightValue = await minHeightRow.locator('.font-medium').textContent();
      const minHeight = Number.parseInt(minHeightValue?.replace('mm', '') ?? '0', 10);

      const maxHeightRow = dimensionsCard.locator('text=Alto máximo:').locator('..');
      const maxHeightValue = await maxHeightRow.locator('.font-medium').textContent();
      const maxHeight = Number.parseInt(maxHeightValue?.replace('mm', '') ?? '0', 10);

      // Validate ranges
      expect(minWidth).toBeGreaterThan(0);
      expect(maxWidth).toBeGreaterThan(minWidth);
      expect(minHeight).toBeGreaterThan(0);
      expect(maxHeight).toBeGreaterThan(minHeight);
    });

    test('should display unusual capacities prominently (e.g., 6700mm sliding doors)', async ({ page }) => {
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');

      // Get max width value
      const maxWidthRow = dimensionsCard.locator('text=Ancho máximo:').locator('..');
      const maxWidthValue = await maxWidthRow.locator('.font-medium').textContent();
      const maxWidth = Number.parseInt(maxWidthValue?.replace('mm', '') ?? '0', 10);

      // If this model supports very large dimensions (>5000mm), it should be clearly visible
      if (maxWidth > 5000) {
        // Value should be in a prominent font-medium class
        await expect(maxWidthRow.locator('.font-medium')).toBeVisible();

        // Verify it's displayed as exact value (not rounded)
        expect(maxWidthValue).toContain(maxWidth.toString());
      }
    });

    test('should be easy to reference while filling quote form', async ({ page }) => {
      // Verify dimensions card is in sidebar (not hidden)
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');
      await expect(dimensionsCard).toBeVisible();

      // Verify card is sticky or always visible in viewport when scrolling form
      // (Check if card is positioned in sidebar area)
      const cardBox = await dimensionsCard.boundingBox();
      expect(cardBox?.y).toBeLessThan(1000); // Should be in upper portion of page

      // Verify dimensions info remains accessible (no overflow hidden)
      const dimensionLabels = dimensionsCard.locator('text=/mínimo|máximo/');
      const labelCount = await dimensionLabels.count();
      expect(labelCount).toBe(4); // All labels visible
    });

    test('should display dimensions card on mobile viewport for easy reference', async ({ page }) => {
      // Set mobile viewport (375px as per spec)
      await page.setViewportSize({ height: 667, width: 375 });

      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');

      // Verify dimensions card is visible on mobile
      const dimensionsCard = page.locator('text=Dimensiones Permitidas').locator('..');
      await expect(dimensionsCard).toBeVisible();

      // Verify constraints are readable (not truncated)
      await expect(dimensionsCard.locator('text=Ancho mínimo:')).toBeVisible();
      await expect(dimensionsCard.locator('text=Alto máximo:')).toBeVisible();

      // Verify values fit in mobile width
      const dimensionValues = dimensionsCard.locator('.font-medium');
      for (let i = 0; i < (await dimensionValues.count()); i++) {
        const box = await dimensionValues.nth(i).boundingBox();
        expect(box?.width).toBeLessThan(375); // Fits within viewport
      }
    });
  });

  test.describe('Responsive Layout', () => {
    test('should display cards vertically on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ height: 667, width: 375 });

      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');

      // Verify sidebar cards are visible (should reflow vertically)
      await expect(page.locator('text=Especificaciones Técnicas')).toBeVisible();
      await expect(page.locator('text=Proveedor de Perfiles')).toBeVisible();

      // Verify cards stack vertically (Y positions increase)
      const specsCard = page.locator('text=Especificaciones Técnicas').locator('..');
      const supplierCard = page.locator('text=Proveedor de Perfiles').locator('..');

      const specsBox = await specsCard.boundingBox();
      const supplierBox = await supplierCard.boundingBox();

      if (specsBox && supplierBox) {
        // Cards should be stacked (one below the other)
        expect(Math.abs((specsBox.y ?? 0) - (supplierBox.y ?? 0))).toBeGreaterThan(50);
      }
    });

    test('should maintain card readability on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ height: 1024, width: 768 });

      await page.goto('/catalog');
      await page.waitForLoadState('networkidle');

      const firstModelCard = page.locator('[data-testid="model-card"]').first();
      await firstModelCard.click();
      await page.waitForLoadState('networkidle');

      // Verify all cards are visible and readable
      const cards = [
        page.locator('text=Especificaciones Técnicas'),
        page.locator('text=Proveedor de Perfiles'),
        page.locator('text=Dimensiones'),
        page.locator('text=Características'),
      ];

      for (const card of cards) {
        await expect(card).toBeVisible();

        // Verify card is not cut off (has reasonable height)
        const cardContainer = card.locator('..');
        const box = await cardContainer.boundingBox();
        expect(box?.height).toBeGreaterThan(50);
      }
    });
  });
});
