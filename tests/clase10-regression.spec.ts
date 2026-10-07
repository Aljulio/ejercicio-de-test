import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase10')) {
    fs.mkdirSync('./evidencias/clase10', { recursive: true });
  }
});

test.describe('Clase 10 - Regression Tests - Sauce Demo', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(page, 'standard_user');

    await expect(page).toHaveURL(/inventory/);
  });


  test.afterEach(async ({ page }, testInfo) => {

    const nombreSeguro = testInfo.title
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    const proyectoSeguro = testInfo.project.name
      .replace(/[^a-z0-9]/gi, '_')
      .toLowerCase();

    try {

      if (testInfo.status !== testInfo.expectedStatus) {

        await page.screenshot({
          path: `./evidencias/clase10/fallo-${proyectoSeguro}-${nombreSeguro}.png`,
          fullPage: true,
        });

        console.log(
          `Test fallido: ${testInfo.title} - Screenshot guardado`
        );

      }

    } catch (e) {

      console.log('No se pudo capturar screenshot:', e);
    }
  });


  test('Ordenamiento A-Z funciona',
    { tag: '@regression' }, async ({ page }) => {

    await page.locator(
      '[data-test="product-sort-container"]'
    ).selectOption('az');

    const textos = await page.locator(
      '.inventory_item_name'
    ).allTextContents();

    expect(textos).toEqual(
      [...textos].sort((a, b) => a.localeCompare(b))
    );

    // Evidencia A-Z
    await page.screenshot({
      path: `./evidencias/clase10/06-regression-az-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Ordenamiento A-Z verificado');
  });


  test('Ordenamiento Z-A funciona',
    { tag: '@regression' }, async ({ page }) => {

    await page.locator(
      '[data-test="product-sort-container"]'
    ).selectOption('za');

    const textos = await page.locator(
      '.inventory_item_name'
    ).allTextContents();

    const esperado = [...textos]
      .sort((a, b) => a.localeCompare(b))
      .reverse();

    expect(textos).toEqual(esperado);

    // Evidencia Z-A
    await page.screenshot({
      path: `./evidencias/clase10/07-regression-za-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Ordenamiento Z-A verificado');
  });


  test('Precio de menor a mayor funciona',
    { tag: '@regression' }, async ({ page }) => {

    await page.locator(
      '[data-test="product-sort-container"]'
    ).selectOption('lohi');

    const precios = await page.locator(
      '.inventory_item_price'
    ).allTextContents();

    const numericos = precios.map(
      p => parseFloat(p.replace('$', ''))
    );

    for (let i = 0; i < numericos.length - 1; i++) {

      expect(numericos[i])
        .toBeLessThanOrEqual(numericos[i + 1]);

    }

    // Evidencia precios
    await page.screenshot({
      path: `./evidencias/clase10/08-regression-precio-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Ordenamiento de precio menor a mayor verificado');
  });


  test('El boton "Remove" aparece despues de agregar al carrito',
    { tag: '@regression' }, async ({ page }) => {

    const primerBoton = page.locator('.btn_inventory').first();

    await expect(primerBoton).toHaveText('Add to cart');

    await primerBoton.click();

    await expect(primerBoton).toHaveText('Remove');

    await primerBoton.click();

    await expect(primerBoton).toHaveText('Add to cart');

    // Evidencia agregar/quitar producto
    await page.screenshot({
      path: `./evidencias/clase10/09-regression-remove-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Agregar y quitar producto verificado');
  });


  test('Navegar al detalle del producto y regresar',
    { tag: '@regression' }, async ({ page }) => {

    const primerNombre = await page.locator(
      '.inventory_item_name'
    ).first().textContent();

    await page.locator(
      '.inventory_item_name'
    ).first().click();

    await expect(page).toHaveURL(/inventory-item/);

    await expect(
      page.locator('.inventory_details_name')
    ).toContainText(primerNombre!);

    await page.locator(
      '[data-test="back-to-products"]'
    ).click();

    await expect(page).toHaveURL(/inventory/);

    // Evidencia navegación
    await page.screenshot({
      path: `./evidencias/clase10/10-regression-detalle-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Navegación al detalle y regreso verificada');
  });

});