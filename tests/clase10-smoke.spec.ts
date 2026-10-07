import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase10')) {
    fs.mkdirSync('./evidencias/clase10', { recursive: true });
  }
});

test.describe('Clase 10 - Smoke Tests - Sauce Demo', () => {

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


  test('La pagina de login carga',
    { tag: '@smoke' }, async ({ page }) => {

    await page.goto('https://www.saucedemo.com');

    await expect(page).toHaveTitle(/Swag Labs/);

    await expect(page.locator('#login-button')).toBeVisible();

    // Evidencia del login
    await page.screenshot({
      path: `./evidencias/clase10/01-login-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Página de login verificada correctamente');
  });


  test('Login con usuario estandar funciona',
    { tag: '@smoke' }, async ({ page }) => {

    await loginAs(page, 'standard_user');

    await expect(page).toHaveURL(/inventory/);

    // Evidencia del login exitoso
    await page.screenshot({
      path: `./evidencias/clase10/02-login-estandar-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Login con usuario estándar verificado');
  });


  test('El inventario muestra productos',
    { tag: '@smoke' }, async ({ page }) => {

    await loginAs(page, 'standard_user');

    const items = page.locator('.inventory_item');

    await expect(items).toHaveCount(6);

    // Evidencia del inventario
    await page.screenshot({
      path: `./evidencias/clase10/03-inventario-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Inventario tiene 6 productos');
  });


  test('El carrito es accesible',
    { tag: '@smoke' }, async ({ page }) => {

    await loginAs(page, 'standard_user');

    await page.locator('.shopping_cart_link').click();

    await expect(page).toHaveURL(/cart/);

    // Evidencia del carrito
    await page.screenshot({
      path: `./evidencias/clase10/04-carrito-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Carrito accesible correctamente');
  });


  test('El checkout inicia correctamente',
    { tag: '@smoke' }, async ({ page }) => {

    await loginAs(page, 'standard_user');

    await page.locator('.btn_inventory').first().click();

    await page.locator('.shopping_cart_link').click();

    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/checkout-step-one/);

    // Evidencia del checkout
    await page.screenshot({
      path: `./evidencias/clase10/05-checkout-${test.info().project.name}.png`,
      fullPage: true
    });

    console.log('Checkout iniciado correctamente');
  });

});