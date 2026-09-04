import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Tarea 07 - Tests reto: evidencias avanzadas', () => {

  
  test('Reto 1 - Login con pasos nombrados (test.step)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await test.step('Navegar al sitio', async () => {
      await loginPage.navigate();
    });

    await test.step('Iniciar sesión con usuario válido', async () => {
      await loginPage.login('standard_user', 'secret_sauce');
    });

    await test.step('Verificar que llegamos al inventario', async () => {
      await inventoryPage.expectToBeOnInventoryPage();
    });
  });


  test('Reto 2 - Adjuntar datos capturados al reporte (testInfo.attach)', async ({ page }, testInfo) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    const cantidadProductos = await inventoryPage.getProductCount();
    const url = page.url();
    const fecha = new Date().toISOString();

    const contenido =
      `Cantidad de productos: ${cantidadProductos}\n` +
      `URL: ${url}\n` +
      `Fecha: ${fecha}\n`;

    await testInfo.attach('datos-capturados-inventario.txt', {
      body: contenido,
      contentType: 'text/plain',
    });

    console.log('Datos adjuntados al reporte HTML');
  });

  test('Reto 3 - Comparación visual del inventario (toHaveScreenshot)', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

   
    await page.route('**/*.{woff,woff2,ttf,otf}', route => route.abort());

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('.inventory_item_img img'))
        .every((img) => (img as HTMLImageElement).complete && (img as HTMLImageElement).naturalWidth > 0)
    );

    await expect(page).toHaveScreenshot('inventario-baseline.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

});