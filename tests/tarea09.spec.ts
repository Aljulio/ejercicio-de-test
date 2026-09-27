import { test as base, expect } from '../fixtures';
import * as fs from 'fs';

type TareaFixtures = {
  cronometro: void;
};

type WorkerFixtures = {
  contador: { valor: number };
};

const test = base.extend<TareaFixtures, WorkerFixtures>({

  // Reto 1: fixture con teardown (código DESPUÉS de use)
  cronometro: async ({}, use, testInfo) => {

    // Setup: arranca el cronómetro
    const inicio = Date.now();

    console.log(`[cronómetro] Inicia: "${testInfo.title}"`);

    await use();

    // Teardown: corre al terminar el test, incluso si falla
    const duracion = Date.now() - inicio;

    console.log(
      `[cronómetro] "${testInfo.title}" tardó ${duracion} ms (estado: ${testInfo.status})`
    );
  },

  // Reto 2: fixture de alcance worker (se crea una sola vez por worker)
  contador: [
    async ({}, use, workerInfo) => {

      const contador = { valor: 0 };

      console.log(`[worker ${workerInfo.workerIndex}] contador creado en 0`);

      await use(contador);

      console.log(`[worker ${workerInfo.workerIndex}] contador final: ${contador.valor}`);
    },
    { scope: 'worker' },
  ],
});

test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/tarea09')) {
    fs.mkdirSync('./evidencias/tarea09', { recursive: true });
  }
});

test.describe('Reto 1 - Fixture con teardown real', () => {

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/tarea09/fallo-${nombreSeguro}.png`,
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

  test('Cronómetro mide un login exitoso', async ({ cronometro, page }) => {

    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    await expect(page).toHaveURL(/inventory/);

    // Evidencia del login cronometrado
    await page.screenshot({
      path: './evidencias/tarea09/01-reto1-login-cronometrado.png',
      fullPage: true
    });

    console.log('Evidencia guardada: login cronometrado');
  });

  test('Cronómetro corre aunque el test falle', async ({ cronometro, page }) => {

    // Se marca como "fallo esperado" para demostrar que el teardown se ejecuta igual
    test.fail();

    await page.goto('https://www.saucedemo.com');

    // Evidencia antes del fallo intencional
    await page.screenshot({
      path: './evidencias/tarea09/02-reto1-antes-del-fallo.png',
      fullPage: true
    });

    console.log('Evidencia guardada: antes del fallo intencional');

    await expect(page.locator('.elemento-que-no-existe')).toBeVisible({ timeout: 2000 });
  });

});

test.describe('Reto 2 - Fixture de alcance worker', () => {

  // Serial: garantiza que ambos tests corran en el mismo worker y en orden
  test.describe.configure({ mode: 'serial' });

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/tarea09/fallo-${nombreSeguro}.png`,
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

  test('Contador sube a 1', async ({ contador, page }) => {

    contador.valor++;

    console.log(`Contador = ${contador.valor}`);

    expect(contador.valor).toBe(1);

    await page.goto('https://www.saucedemo.com');

    // Evidencia del contador en 1
    await page.screenshot({
      path: './evidencias/tarea09/03-reto2-contador-1.png',
      fullPage: true
    });

    console.log('Evidencia guardada: contador en 1');
  });

  test('Contador sube a 2 (estado persistido)', async ({ contador, page }) => {

    contador.valor++;

    console.log(`Contador = ${contador.valor}`);

    expect(contador.valor).toBe(2);

    await page.goto('https://www.saucedemo.com');

    // Evidencia del contador en 2
    await page.screenshot({
      path: './evidencias/tarea09/04-reto2-contador-2.png',
      fullPage: true
    });

    console.log('Evidencia guardada: contador en 2');
  });

});

const viewports = [
  { nombre: 'móvil', viewport: { width: 375, height: 667 } },
  { nombre: 'escritorio', viewport: { width: 1280, height: 720 } },
];

test.describe('Reto 3 - test.use() + parametrización', () => {

  test.afterEach(async ({ page }, testInfo) => {

    if (testInfo.status !== testInfo.expectedStatus) {

      const nombreSeguro = testInfo.title
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();

      try {

        await page.screenshot({
          path: `./evidencias/tarea09/fallo-${nombreSeguro}.png`,
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

  for (const { nombre, viewport } of viewports) {

    test.describe(`Viewport ${nombre}`, () => {

      test.use({ viewport });

      test(`Inventario muestra 6 productos en ${nombre}`, async ({ inventoryPage, page }) => {

        expect(page.viewportSize()).toEqual(viewport);

        const count = await inventoryPage.getProductCount();

        expect(count).toBe(6);

        // Evidencia del inventario en este viewport
        await page.screenshot({
          path: `./evidencias/tarea09/05-reto3-viewport-${viewport.width}x${viewport.height}.png`,
          fullPage: true
        });

        console.log(`[${nombre}] ${viewport.width}x${viewport.height}: ${count} productos`);
      });
    });
  }

});