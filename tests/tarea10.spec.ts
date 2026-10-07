import { test, expect } from '@playwright/test';
import { loginAs } from '../helpers/auth';
import * as fs from 'fs';

test.beforeAll(() => {

  if (!fs.existsSync('./evidencias/tarea10')) {
    fs.mkdirSync('./evidencias/tarea10', { recursive: true });
  }

});

test.describe('Tarea 10 - Sauce Demo', () => {

  test.beforeEach(async ({ page }) => {

    await loginAs(page, 'standard_user');

    await expect(page).toHaveURL(/inventory/);

  });

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      const proyectoSeguro = testInfo.project.name
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/tarea10/fallo-${proyectoSeguro}-${nombreSeguro}.png`,
          fullPage: true,
        });

        console.log(
          `Test fallido: ${testInfo.title} - Screenshot guardado`
        );

      } catch (e) {

        console.log(
          'No se pudo capturar screenshot:',
          e
        );

      }

    }

  });

  test(
    'Reto 1a: El logo y el titulo del inventario se muestran',
    { tag: ['@regression', '@ui'] },
    async ({ page, }, testInfo) => {

      await expect(
        page.locator('.app_logo')
      ).toHaveText('Swag Labs');

      await expect(
        page.locator('[data-test="title"]')
      ).toHaveText('Products');


      // Evidencia del Reto 1a
      await page.screenshot({
        path: `./evidencias/tarea10/01-reto1a-tags-ui-${testInfo.project.name}.png`,
        fullPage: true
      });

      console.log(
        `[${testInfo.project.name}] Evidencia guardada: Reto 1a - Tags UI`
      );

    }
  );

  test(
    'Reto 1b: El contador del carrito sube al agregar 2 productos',
    { tag: ['@regression', '@cart'] },
    async ({ page }, testInfo) => {

      const botones = page.locator('.btn_inventory');

      await botones.nth(0).click();

      await botones.nth(1).click();

      await expect(
        page.locator('.shopping_cart_badge')
      ).toHaveText('2');


      // Evidencia del Reto 1b
      await page.screenshot({
        path: `./evidencias/tarea10/02-reto1b-tags-cart-${testInfo.project.name}.png`,
        fullPage: true
      });

      console.log(
        `[${testInfo.project.name}] Evidencia guardada: Reto 1b - Tags Cart`
      );

    }
  );

  test(
    'Reto 2: Atributos del primer producto con soft assertions',
    { tag: ['@regression', '@soft'] },
    async ({ page }, testInfo) => {

      const producto = page
        .locator('.inventory_item')
        .first();


      // Verificación mediante soft assertions
      await expect.soft(
        producto.locator('.inventory_item_name')
      ).toHaveText('Sauce Labs Backpack');

      await expect.soft(
        producto.locator('.inventory_item_desc')
      ).toContainText('carry.allTheThings()');

      await expect.soft(
        producto.locator('.inventory_item_price')
      ).toHaveText('$29.99');

      await expect.soft(
        producto.locator('img.inventory_item_img')
      ).toBeVisible();

      await expect.soft(
        producto.locator('.btn_inventory')
      ).toHaveText('Add to cart');


      // Reporte de errores acumulados
      if (testInfo.errors.length > 0) {

        console.log(
          `[${testInfo.project.name}] Fallaron ${testInfo.errors.length} verificaciones soft:`
        );

        testInfo.errors.forEach((e, i) => {

          console.log(
            `  ${i + 1}. ${e.message?.split('\n')[0]}`
          );

        });

      } else {

        console.log(
          `[${testInfo.project.name}] Todas las soft assertions fueron correctas`
        );

      }


      // Evidencia del Reto 2
      await page.screenshot({
        path: `./evidencias/tarea10/03-reto2-soft-assertions-${testInfo.project.name}.png`,
        fullPage: true
      });

      console.log(
        `[${testInfo.project.name}] Evidencia guardada: Reto 2 - Soft Assertions`
      );


      // Verificación final
      expect(
        testInfo.errors,
        'No deberia haber fallos en las soft assertions'
      ).toHaveLength(0);

    }
  );

  test(
    'Reto 3: El user agent corresponde al motor real del navegador',
    { tag: ['@regression', '@cross-browser'] },
    async ({ page, browserName }, testInfo) => {

      const userAgent = await page.evaluate(
        () => navigator.userAgent
      );

      console.log(
        `[${browserName}] userAgent: ${userAgent}`
      );


      // Ajustar la aserción según el motor real
      if (browserName === 'chromium') {

        expect(userAgent).toContain('Chrome');

      } else if (browserName === 'firefox') {

        expect(userAgent).toContain('Firefox');

      } else if (browserName === 'webkit') {

        expect(userAgent).toContain('AppleWebKit');
        expect(userAgent).not.toContain('Chrome');

      }


      // La parte funcional se valida igual en todos los motores
      await page
        .locator('[data-test="product-sort-container"]')
        .selectOption('hilo');


      const precios = await page
        .locator('.inventory_item_price')
        .allTextContents();


      const numericos = precios.map(
        p => parseFloat(p.replace('$', ''))
      );


      expect(numericos).toEqual(
        [...numericos].sort((a, b) => b - a)
      );


      // Evidencia del Reto 3
      await page.screenshot({
        path: `./evidencias/tarea10/04-reto3-cross-browser-${browserName}-${testInfo.project.name}.png`,
        fullPage: true
      });

      console.log(
        `[${testInfo.project.name}] Evidencia guardada: Reto 3 - Cross-Browser`
      );

    }
  );

});