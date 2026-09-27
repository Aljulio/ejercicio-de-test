import { test, expect } from '../fixtures';
import { test as baseTest } from '@playwright/test';
import * as fs from 'fs';

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase09')) {
    fs.mkdirSync('./evidencias/clase09', { recursive: true });
  }
});

// ================== PASO 2 - Usando los fixtures ==================
test.describe('Clase 09 - Fixtures y datos de prueba', () => {

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/clase09/fallo-${nombreSeguro}.png`,
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

  test('Usando fixture de login: verificar inventario',
    async ({ inventoryPage, page }) => {

    // El fixture ya hizo el login - verificamos el inventario
    const count = await inventoryPage.getProductCount();

    expect(count).toBe(6);

    // Evidencia del inventario via fixture
    await page.screenshot({
      path: './evidencias/clase09/01-fixture-inventario.png',
      fullPage: true
    });

    console.log(`Inventario tiene ${count} productos (via fixture)`);
  });

  test('Usando fixture de carrito: verificar que hay 1 item',
    async ({ cartPage, page }) => {

    const count = await cartPage.getItemCount();

    expect(count).toBe(1);

    // Evidencia del carrito via fixture
    await page.screenshot({
      path: './evidencias/clase09/02-fixture-carrito.png',
      fullPage: true
    });

    console.log(`Carrito tiene ${count} item (via fixture)`);
  });

  test('Usando fixture de loginPage: login manual en el test',
    async ({ loginPage, page }) => {

    await loginPage.login('standard_user', 'secret_sauce');

    await expect(page).toHaveURL(/inventory/);

    // Evidencia del login manual
    await page.screenshot({
      path: './evidencias/clase09/03-fixture-loginpage.png',
      fullPage: true
    });

    console.log('Login manual con fixture loginPage verificado');
  });

});

// ================== PASO 3 - Tests parametrizados de login ==================
// Datos de prueba para diferentes usuarios
const usuariosDeLogin = [
  {
    username: 'standard_user',
    password: 'secret_sauce',
    esperadoURL: /inventory/,
    descripcion: 'usuario estándar puede ingresar'
  },
  {
    username: 'locked_out_user',
    password: 'secret_sauce',
    esperadoURL: null,
    descripcion: 'usuario bloqueado no puede ingresar'
  },
  {
    username: '',
    password: '',
    esperadoURL: null,
    descripcion: 'campos vacíos muestran error'
  },
];

baseTest.describe('Clase 09 - Tests parametrizados de login', () => {

  baseTest.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/clase09/fallo-${nombreSeguro}.png`,
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

  for (const datos of usuariosDeLogin) {

    baseTest(`Login: ${datos.descripcion}`, async ({ page }) => {

      await page.goto('https://www.saucedemo.com');
      await page.locator('#user-name').fill(datos.username);
      await page.locator('#password').fill(datos.password);
      await page.locator('#login-button').click();

      if (datos.esperadoURL) {

        await expect(page).toHaveURL(datos.esperadoURL);

        console.log(`${datos.descripcion}: acceso correcto`);

      } else {

        // Debe mostrar error
        const error = page.locator('[data-test="error"]');

        await expect(error).toBeVisible();

        console.log(`${datos.descripcion}: error mostrado correctamente`);
      }

      // Evidencia del login parametrizado
      await page.screenshot({
        path: `./evidencias/clase09/04-login-${datos.username || 'campos_vacios'}.png`,
        fullPage: true
      });
    });
  }

});

// ================== PASO 3 - Productos del carrito parametrizados ==================
const productosAVerificar = [
  'Sauce Labs Backpack',
  'Sauce Labs Bike Light',
  'Sauce Labs Bolt T-Shirt',
];

baseTest.describe('Clase 09 - Agregar productos al carrito (parametrizado)', () => {

  baseTest.beforeEach(async ({ page }) => {

    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);
  });

  baseTest.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/clase09/fallo-${nombreSeguro}.png`,
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

  for (const nombreProducto of productosAVerificar) {

    baseTest(`Agregar "${nombreProducto}" al carrito`, async ({ page }) => {

      // Encontrar el producto por nombre y agregarlo
      const producto = page.locator('.inventory_item', { hasText: nombreProducto });

      await producto.locator('.btn_inventory').click();

      // Verificar badge del carrito
      await expect(page.locator('.shopping_cart_badge')).toBeVisible();

      // Ir al carrito y verificar que el producto está ahí
      await page.locator('.shopping_cart_link').click();

      await expect(page.locator('.inventory_item_name',
        { hasText: nombreProducto })).toBeVisible();

      // Evidencia del producto en el carrito
      const nombreSeguro = nombreProducto
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      await page.screenshot({
        path: `./evidencias/clase09/05-carrito-${nombreSeguro}.png`,
        fullPage: true
      });

      console.log(`"${nombreProducto}" verificado en carrito`);
    });
  }

});