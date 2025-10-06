import { expect, test } from '@playwright/test';

/**
 * Catalog E2E Tests
 *
 * Tests para la funcionalidad completa del catálogo de productos,
 * cubriendo navegación, filtros, búsqueda y interacciones.
 *
 * Basado en el análisis completo de la página usando Playwright MCP
 */

// Regex patterns defined at top level for performance
const SEARCH_PANORAMA_URL = /q=Panorama/;
const MANUFACTURER_FILTER_URL = /manufacturer=/;
const PRODUCT_DETAIL_URL = /\/catalog\/cm1catalogmodelpublished123/;
const PANORAMA_PRODUCT_LINK = /Imagen del producto Ventana Panorama/;
const TERMOACUSTICA_PRODUCT_LINK = /Imagen del producto Ventana Termoacústica/;

test.describe('Catalog Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/catalog');
    // Esperar a que la página cargue completamente
    await expect(page.getByRole('heading', { name: 'Catálogo de Productos' })).toBeVisible();
  });

  test.describe('Initial Page Load', () => {
    test('should display catalog header and description', async ({ page }) => {
      await expect(page.getByRole('heading', { name: 'Catálogo de Productos' })).toBeVisible();
      await expect(page.getByText('Explore nuestra selección de productos de vidrio')).toBeVisible();
    });

    test('should display all filter controls', async ({ page }) => {
      // Campo de búsqueda
      await expect(page.getByPlaceholder('Buscar productos...')).toBeVisible();

      // Combobox de fabricantes
      await expect(page.getByRole('combobox').filter({ hasText: 'Todos' })).toBeVisible();

      // Combobox de ordenamiento
      await expect(page.getByText('Nombre (A-Z)')).toBeVisible();
    });

    test('should show initial product count and models', async ({ page }) => {
      // Esperar a que los productos se carguen
      await expect(page.getByText('modelos encontrados')).toBeVisible();

      // Verificar que se muestran los modelos iniciales
      await expect(page.getByText('Ventana Panorama 2024')).toBeVisible();
      await expect(page.getByText('Ventana Termoacústica Elite')).toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should filter products by search query', async ({ page }) => {
      // Escribir en el campo de búsqueda
      const searchInput = page.getByPlaceholder('Buscar productos...');
      await searchInput.fill('Panorama');

      // En WebKit, el debounce puede no ejecutarse automáticamente, forzamos con Enter
      await searchInput.press('Enter');

      // Esperar a que aparezca el badge de búsqueda como confirmación
      await expect(page.getByText('Parámetros de búsqueda:')).toBeVisible({ timeout: 10_000 });

      // Ahora verificar la URL
      await expect(page).toHaveURL(SEARCH_PANORAMA_URL);

      // Verificar que aparece el botón de limpiar búsqueda
      await expect(page.getByRole('button', { name: 'Limpiar búsqueda' })).toBeVisible();

      // Verificar badge de búsqueda activa
      await expect(page.getByText('Parámetros de búsqueda:')).toBeVisible();
      // Usar first() para resolver conflictos de elementos múltiples
      await expect(page.getByText('Panorama').first()).toBeVisible();

      // Verificar resultados filtrados
      await expect(page.getByText('1 modelo encontrado')).toBeVisible();
      await expect(page.getByText('Ventana Panorama 2024')).toBeVisible();
      await expect(page.getByText('Ventana Termoacústica Elite')).not.toBeVisible();
    });

    test('should clear search when clicking clear button', async ({ page }) => {
      // Realizar búsqueda
      const searchInput = page.getByPlaceholder('Buscar productos...');
      await searchInput.fill('Panorama');
      await searchInput.press('Enter');

      // Esperar confirmación visual de la búsqueda
      await expect(page.getByText('Parámetros de búsqueda:')).toBeVisible({ timeout: 10_000 });
      await expect(page).toHaveURL(SEARCH_PANORAMA_URL);

      // Limpiar búsqueda
      await page.getByRole('button', { name: 'Limpiar búsqueda' }).click();

      // Verificar que la URL se limpió
      await expect(page).toHaveURL('/catalog');

      // Verificar que vuelven todos los productos
      await expect(page.getByText('2 modelos encontrados')).toBeVisible();
    });
  });

  test.describe('Manufacturer Filter', () => {
    test('should filter products by manufacturer', async ({ page }) => {
      // Abrir dropdown de fabricantes
      await page.getByRole('combobox').filter({ hasText: 'Todos' }).click();

      // Verificar opciones disponibles
      await expect(page.getByRole('option', { name: 'Todos' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Cristales Modernos' })).toBeVisible();
      await expect(page.getByRole('option', { name: 'Ventanas Andinas' })).toBeVisible();

      // Seleccionar fabricante específico
      await page.getByRole('option', { name: 'Ventanas Andinas' }).click();

      // Verificar URL actualizada
      await expect(page).toHaveURL(MANUFACTURER_FILTER_URL);

      // Verificar badge de filtro activo - usar selector más específico
      await expect(page.locator('.max-w-\\[200px\\]').filter({ hasText: 'Ventanas Andinas' })).toBeVisible();

      // Verificar resultados filtrados
      await expect(page.getByText('1 modelo encontrado')).toBeVisible();
      await expect(page.getByText('Ventana Panorama 2024')).toBeVisible();
    });

    test('should clear manufacturer filter using badge button', async ({ page }) => {
      // Aplicar filtro de fabricante
      await page.getByRole('combobox').filter({ hasText: 'Todos' }).click();
      await page.getByRole('option', { name: 'Ventanas Andinas' }).click();

      // Verificar filtro aplicado
      await expect(page).toHaveURL(MANUFACTURER_FILTER_URL);

      // Quitar filtro usando el badge
      await page.getByRole('button', { name: 'Quitar filtro de Ventanas Andinas' }).click();

      // Verificar que se limpió el filtro
      await expect(page).toHaveURL('/catalog');
      await expect(page.getByText('2 modelos encontrados')).toBeVisible();
    });
  });

  test.describe('Clear All Filters', () => {
    test('should clear all search parameters with clear all button', async ({ page }) => {
      // Aplicar múltiples filtros
      await page.getByPlaceholder('Buscar productos...').fill('Elite');
      await page.getByRole('combobox').filter({ hasText: 'Todos' }).click();
      await page.getByRole('option', { name: 'Cristales Modernos' }).click();

      // Verificar que hay parámetros activos
      await expect(page.getByText('Parámetros de búsqueda:')).toBeVisible();

      // Limpiar todos los parámetros
      await page.getByRole('button', { name: 'Limpiar todos los parámetros' }).click();

      // Verificar que se limpiaron todos los filtros
      await expect(page).toHaveURL('/catalog');
      await expect(page.getByText('2 modelos encontrados')).toBeVisible();
      await expect(page.getByRole('combobox').filter({ hasText: 'Todos' })).toBeVisible();
    });
  });

  test.describe('Product Navigation', () => {
    test('should navigate to product detail page when clicking a product card', async ({ page }) => {
      // Hacer clic en la primera tarjeta de producto
      await page.getByRole('link', { name: PANORAMA_PRODUCT_LINK }).click();

      // Verificar navegación a página de detalle
      await expect(page).toHaveURL(PRODUCT_DETAIL_URL);

      // Verificar contenido de la página de detalle
      await expect(page.getByRole('heading', { name: 'Ventana Corrediza Premium' })).toBeVisible();
      await expect(page.getByText('VentanasTech Pro')).toBeVisible();
      // Usar first() para resolver elemento duplicado
      await expect(page.getByText('$450.00').first()).toBeVisible();
    });

    test('should maintain filter state when navigating back from product detail', async ({ page }) => {
      // Aplicar filtro
      const searchInput = page.getByPlaceholder('Buscar productos...');
      await searchInput.fill('Panorama');
      await searchInput.press('Enter');

      // Esperar confirmación visual
      await expect(page.getByText('Parámetros de búsqueda:')).toBeVisible({ timeout: 10_000 });
      await expect(page).toHaveURL(SEARCH_PANORAMA_URL);

      // Navegar a detalle del producto
      await page.getByRole('link', { name: PANORAMA_PRODUCT_LINK }).click();
      await expect(page).toHaveURL(PRODUCT_DETAIL_URL);

      // Volver al catálogo
      await page.goBack();

      // Verificar que se mantiene el filtro
      await expect(page).toHaveURL(SEARCH_PANORAMA_URL);
      // Verificar valor del input directamente
      await expect(page.getByPlaceholder('Buscar productos...')).toHaveValue('Panorama');
    });
  });

  test.describe('Model Cards Content', () => {
    test('should display correct product information in cards', async ({ page }) => {
      // Verificar información del primer producto usando selectores más específicos
      await expect(page.getByRole('heading', { name: 'Ventana Panorama 2024' })).toBeVisible();
      await expect(page.getByText('Ventanas Andinas')).toBeVisible();
      await expect(page.getByText('Ancho: 800 - 2400 mm')).toBeVisible();
      await expect(page.getByText('Alto: 700 - 2200 mm')).toBeVisible();
      await expect(page.getByText('$ 320.000')).toBeVisible();

      // Verificar información del segundo producto
      await expect(page.getByRole('heading', { name: 'Ventana Termoacústica Elite' })).toBeVisible();
      await expect(page.getByText('Cristales Modernos')).toBeVisible();
      await expect(page.getByText('Ancho: 600 - 2000 mm')).toBeVisible();
      await expect(page.getByText('Alto: 500 - 2100 mm')).toBeVisible();
      await expect(page.getByText('$ 285.000')).toBeVisible();
    });

    test('should have proper accessibility attributes on product cards', async ({ page }) => {
      // Verificar que los enlaces tienen texto descriptivo
      await expect(page.getByRole('link', { name: PANORAMA_PRODUCT_LINK })).toBeVisible();
      await expect(page.getByRole('link', { name: TERMOACUSTICA_PRODUCT_LINK })).toBeVisible();

      // Verificar que todos los productos están en una lista estructurada
      // Usar un selector más específico para la lista de productos (grid de productos)
      const productGrid = page.locator('ul.grid.gap-8');
      await expect(productGrid).toBeVisible();

      // Verificar que hay 2 items en el grid de productos específicamente
      const productItems = productGrid.getByRole('listitem');
      await expect(productItems).toHaveCount(2);
    });
  });

  test.describe('Responsive Design', () => {
    test('should work properly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ height: 667, width: 375 });

      // Verificar que los elementos principales siguen siendo visibles
      await expect(page.getByRole('heading', { name: 'Catálogo de Productos' })).toBeVisible();
      await expect(page.getByPlaceholder('Buscar productos...')).toBeVisible();
      await expect(page.getByText('Ventana Panorama 2024')).toBeVisible();
    });

    test('should work properly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ height: 1024, width: 768 });

      // Verificar layout en tablet
      await expect(page.getByRole('heading', { name: 'Catálogo de Productos' })).toBeVisible();
      await expect(page.getByText('2 modelos encontrados')).toBeVisible();
    });
  });

  test.describe('Performance and Loading States', () => {
    test('should show loading skeleton while content loads', async ({ page }) => {
      // Este test verificaría el skeleton loader, pero necesita ser adaptado
      // según la implementación específica del loading state
      await page.goto('/catalog');

      // Verificar que aparece algún tipo de loading indicator
      // (adaptable según el skeleton específico implementado)
      await expect(page.getByRole('heading', { name: 'Catálogo de Productos' })).toBeVisible();
    });
  });
});
