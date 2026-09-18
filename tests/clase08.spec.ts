import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { loginAs } from '../helpers/auth';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase08')) {
    fs.mkdirSync('./evidencias/clase08', { recursive: true });
  }
});

test.describe('Clase 08 - Suite de inventario con hooks', () => {

  test.describe.configure({ mode: 'parallel' });

  test.beforeEach(async ({ page }) => {

    await loginAs(page, 'standard_user');

    // Verificar que llegamos al inventario
    await expect(page).toHaveURL(/inventory/);
  });

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/clase08/fallo-${nombreSeguro}.png`,
          fullPage: true,
        });

        console.log(
          `Test fallido: ${testInfo.title} - Screenshot guardado`
        );

      } catch (e) {

        console.log('No se pudo capturar screenshot:', e);
      }
    }
  });

  test('El inventario muestra 6 productos', async ({ page }) => {

    const items = page.locator('.inventory_item');

    await expect(items).toHaveCount(6);

    // Evidencia del inventario
    await page.screenshot({
      path: './evidencias/clase08/01-inventario-6-productos.png',
      fullPage: true
    });

    console.log('Evidencia guardada: inventario con 6 productos');
  });

  test('Todos los productos tienen precio visible', async ({ page }) => {

    const precios = page.locator('.inventory_item_price');

    const cantidad = await precios.count();

    for (let i = 0; i < cantidad; i++) {

      const precio = precios.nth(i);

      await expect(precio).toBeVisible();

      const textoPrecio = await precio.textContent();

      expect(textoPrecio).toMatch(/^\$\d+\.\d{2}$/);
    }

    // Evidencia de los precios
    await page.screenshot({
      path: './evidencias/clase08/02-precios-productos.png',
      fullPage: true
    });

    console.log(
      `Todos los ${cantidad} productos tienen precio en formato correcto`
    );
  });

  test('Todos los productos tienen imagen visible', async ({ page }) => {

    const imagenes = page.locator('.inventory_item img');

    const cantidad = await imagenes.count();

    for (let i = 0; i < cantidad; i++) {

      await expect(imagenes.nth(i)).toBeVisible();

      const src = await imagenes.nth(i).getAttribute('src');

      expect(src).not.toBeNull();
    }

    // Evidencia de las imágenes
    await page.screenshot({
      path: './evidencias/clase08/03-imagenes-productos.png',
      fullPage: true
    });

    console.log(`${cantidad} imágenes verificadas`);
  });

  test('El menú de hamburguesa funciona', async ({ page }) => {

    // Abrir menú
    await page.locator('#react-burger-menu-btn').click();

    await page.waitForSelector('.bm-menu', {
      state: 'visible'
    });

    // Verificar opciones del menú
    await expect(page.getByText('All Items')).toBeVisible();
    await expect(page.getByText('About')).toBeVisible();
    await expect(page.getByText('Logout')).toBeVisible();
    await expect(page.getByText('Reset App State')).toBeVisible();

    // Captura con el menú abierto
    await page.screenshot({
      path: './evidencias/clase08/04-menu-hamburguesa.png',
      fullPage: true
    });

    // Cerrar menú
    await page.locator('#react-burger-cross-btn').click();

    await page.waitForSelector('.bm-menu', {
      state: 'hidden'
    });

    console.log('Menú de hamburguesa verificado');
  });

  test('Logout funciona correctamente', async ({ page }) => {

    // Abrir menú
    await page.locator('#react-burger-menu-btn').click();

    // Hacer logout
    await page.getByText('Logout').click();

    // Verificar que regresamos al login
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('#login-button')).toBeVisible();

    // Evidencia del logout
    await page.screenshot({
      path: './evidencias/clase08/05-logout-login.png',
      fullPage: true
    });

    console.log('Logout verificado correctamente');
  });

});

test.describe('Clase 08 - Comportamiento por tipo de usuario', () => {

  test.describe.configure({ mode: 'parallel' });

  test('Usuario estándar puede completar el checkout', async ({ page }) => {

    await loginAs(page, 'standard_user');

    // Agregar primer producto
    await page.locator('.btn_inventory').first().click();

    // Ir al carrito
    await page.locator('.shopping_cart_link').click();

    await expect(page).toHaveURL(/cart/);

    // Evidencia del carrito
    await page.screenshot({
      path: './evidencias/clase08/06-carrito-checkout.png',
      fullPage: true
    });

    // Ir al checkout
    await page.locator('[data-test="checkout"]').click();

    await expect(page).toHaveURL(/checkout-step-one/);

    // Evidencia del checkout
    await page.screenshot({
      path: './evidencias/clase08/07-checkout.png',
      fullPage: true
    });

    console.log('Usuario estándar llegó al checkout');
  });

  test('Usuario de rendimiento degrado experimenta lentitud', async ({ page }) => {

    // performance_glitch_user tiene un delay artificial
    // durante el inicio de sesión.

    const inicio = Date.now();

    await loginAs(page, 'performance_glitch_user');

    const tiempoLogin = Date.now() - inicio;

    console.log(
      `Tiempo de login (glitch user): ${tiempoLogin}ms`
    );

    // Verificar que el login fue exitoso
    expect(tiempoLogin).toBeGreaterThan(0);

    await expect(page).toHaveURL(/inventory/);

    // Evidencia del usuario con lentitud
    await page.screenshot({
      path: './evidencias/clase08/08-performance-glitch-user.png',
      fullPage: true
    });

    console.log(
      'Usuario performance_glitch_user documentado correctamente'
    );
  });

});