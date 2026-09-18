import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import { loginAs } from '../helpers/auth';


test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/tarea08')) {
    fs.mkdirSync('./evidencias/tarea08', { recursive: true });
  }
});


test.describe('Reto 1 - Suite serial con página compartida', () => {

  // Los tests de esta suite se ejecutan en orden
  test.describe.configure({ mode: 'serial' });

  // Página compartida entre los tests
  let sharedPage: Page;

  // Crear una sola página antes de ejecutar la suite
  test.beforeAll(async ({ browser }) => {

    sharedPage = await browser.newPage();

    // Login utilizando el helper
    await loginAs(sharedPage, 'standard_user');

    // Verificar que el login fue correcto
    await expect(sharedPage).toHaveURL(/inventory/);

    // Evidencia: página después del login
    await sharedPage.screenshot({
      path: './evidencias/tarea08/01-reto1-login.png',
      fullPage: true
    });

    console.log('Reto 1: página compartida creada y login realizado');
  });

  // Cerrar la página al terminar la suite
  test.afterAll(async () => {
    await sharedPage.close();
  });

  test('Reto 1.1 - La página compartida muestra el inventario', async () => {

    await expect(sharedPage).toHaveURL(/inventory/);

    const productos = sharedPage.locator('.inventory_item');

    await expect(productos).toHaveCount(6);

    // Evidencia del inventario
    await sharedPage.screenshot({
      path: './evidencias/tarea08/02-reto1-inventario.png',
      fullPage: true
    });

    console.log('Reto 1.1: 6 productos verificados');
  });


  test('Reto 1.2 - La misma página compartida permite abrir el menú', async () => {

    // Abrir menú
    await sharedPage.locator('#react-burger-menu-btn').click();

    // Verificar opciones
    await expect(
      sharedPage.locator('#inventory_sidebar_link')
    ).toBeVisible();

    await expect(
      sharedPage.locator('#logout_sidebar_link')
    ).toBeVisible();

    // Evidencia del menú abierto
    await sharedPage.screenshot({
      path: './evidencias/tarea08/03-reto1-menu.png',
      fullPage: true
    });

    console.log('Reto 1.2: menú verificado correctamente');

    // Cerrar menú
    await sharedPage.locator('#react-burger-cross-btn').click();
  });

});


test('Reto 2 - Usuario con lentitud artificial', async ({ page }) => {

  // Este test tiene un timeout 3 veces mayor
  test.slow();

  const inicio = Date.now();

  // Login con usuario que presenta lentitud artificial
  await loginAs(page, 'performance_glitch_user');

  const tiempoLogin = Date.now() - inicio;

  console.log(`Tiempo de login: ${tiempoLogin} ms`);

  // Verificar que llegó al inventario
  await expect(page).toHaveURL(/inventory/);

  // Verificar productos
  await expect(page.locator('.inventory_item')).toHaveCount(6);

  // Evidencia después del login
  await page.screenshot({
    path: './evidencias/tarea08/04-reto2-performance-glitch.png',
    fullPage: true
  });

  console.log('Reto 2: usuario performance_glitch_user documentado');
});


test('Reto 3 - Test omitido dinámicamente según condición', async ({ page }) => {

  // La condición se evalúa durante la ejecución
  const omitirTest = process.env.SKIP_RETO_3 === 'true';

  // Omitir dinámicamente si la variable está configurada
  test.skip(
    omitirTest,
    'Test omitido dinámicamente porque SKIP_RETO_3 está configurado como true.'
  );

  // Si no se omite, realizar login
  await loginAs(page, 'standard_user');

  // Verificar inventario
  await expect(page).toHaveURL(/inventory/);
  await expect(page.locator('.inventory_item')).toHaveCount(6);

  // Evidencia del test ejecutado
  await page.screenshot({
    path: './evidencias/tarea08/05-reto3-ejecutado.png',
    fullPage: true
  });

  console.log('Reto 3: test ejecutado y documentado');
});