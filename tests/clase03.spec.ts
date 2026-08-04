import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias de esta clase si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase03')) {
    fs.mkdirSync('./evidencias/clase03', { recursive: true });
  }
});

test.describe('Clase 03 - Locators en DemoBlaze', () => {

  test('Locator por texto: verificar elementos del menú', async ({ page }) => {
    await page.goto('/');

    // getByText encuentra cualquier elemento que contenga el texto.
    // Por eso limitamos la búsqueda al navbar.
    const nav = page.locator('#navbarExample');

    await expect(nav.getByText('Home')).toBeVisible();
    await expect(nav.getByText('Contact')).toBeVisible();
    await expect(nav.getByText('About us')).toBeVisible();

    // Para buscar un texto exacto usamos { exact: true }
    await expect(
      nav.getByText('Cart', { exact: true })
    ).toBeVisible();

    // Evidencia: navbar con todos los elementos del menú verificados
    await nav.screenshot({
      path: './evidencias/clase03/01-menu-navbar.png'
    });
  });

  test('Locator por CSS: productos en la página principal', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.card-title');

    const tarjetas = page.locator('.card');
    const cantidad = await tarjetas.count();

    expect(cantidad).toBeGreaterThan(0);

    const primerProducto = page.locator('.card-title a').first();
    const nombreProducto = await primerProducto.textContent();

    expect(nombreProducto).not.toBeNull();

    // Evidencia: catálogo de productos en la página principal
    await page.screenshot({
      path: './evidencias/clase03/02-productos-pagina-principal.png',
      fullPage: true
    });
  });

  test('Locator por ID: campos del modal de login', async ({ page }) => {
    await page.goto('/');

    // "Log in" también aparece en el título y botón del modal.
    // Limitamos la búsqueda al navbar y seleccionamos el enlace.
    await page
      .locator('#navbarExample')
      .getByRole('link', { name: 'Log in', exact: true })
      .click();

    await page.waitForSelector('#logInModal', {
      state: 'visible'
    });

    await expect(page.locator('#loginusername')).toBeVisible();
    await expect(page.locator('#loginpassword')).toBeVisible();

    // Evidencia: modal de login con los campos visibles
    await page.locator('#logInModal').screenshot({
      path: './evidencias/clase03/03-modal-login-campos.png'
    });
  });

  test('Locator por atributo: imagen del primer producto', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    await page.locator('.card-title a').first().click();
    await page.waitForLoadState('domcontentloaded');

    const imagenProducto = page.locator('.product-image img');
    await expect(imagenProducto).toBeVisible();

    const srcImagen = await imagenProducto.getAttribute('src');
    expect(srcImagen).not.toBeNull();

    // Evidencia: página de detalle con la imagen del producto
    await page.screenshot({
      path: './evidencias/clase03/04-imagen-producto.png',
      fullPage: true
    });
  });

  test('Locators encadenados: precio dentro de una tarjeta', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    // .locator() sobre otro locator = buscar SOLO dentro de él
    const primeraTarjeta = page.locator('.card').first();
    const precio = primeraTarjeta.locator('h5');
    await expect(precio).toBeVisible();

    // Evidencia: la primera tarjeta con su precio visible
    await primeraTarjeta.screenshot({
      path: './evidencias/clase03/05-tarjeta-precio.png'
    });
  });

  test('Verificar que NO existe un elemento (negación)', async ({ page }) => {
    await page.goto('/');
    const mensajeVacio = page.getByText('No products found');
    await expect(mensajeVacio).not.toBeVisible();

    // Evidencia: página principal donde NO aparece el mensaje "No products found"
    await page.screenshot({
      path: './evidencias/clase03/06-sin-mensaje-vacio.png',
      fullPage: true
    });
  });

  test('Reto 1 - Locator por rol: botón Place Order', async ({ page }) => {
    // Se abre directamente /cart.html sin agregar productos, como indica la pista
    await page.goto('/cart.html');

    // getByRole busca por el rol semántico del elemento (button) y su nombre accesible
    const botonPlaceOrder = page.getByRole('button', { name: 'Place Order' });

    await expect(botonPlaceOrder).toBeVisible();

    // Evidencia: carrito con el botón "Place Order" visible
    await page.screenshot({
      path: './evidencias/clase03/reto1-place-order.png',
      fullPage: true
    });
  });

  test('Reto 2 - Locator con filter(): buscar producto específico y leer su precio', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.card-title');

    // .filter({ hasText }) permite quedarnos solo con la tarjeta
    // cuyo contenido incluya el texto indicado, entre varias .card
    const tarjetaProducto = page.locator('.card').filter({ hasText: 'Samsung galaxy s6' });

    await expect(tarjetaProducto).toBeVisible();

    const precio = tarjetaProducto.locator('h5');
    const textoPrecio = await precio.textContent();

    expect(textoPrecio).not.toBeNull();
    expect(textoPrecio).toContain('$');

    // Evidencia: tarjeta del producto encontrado con filter()
    await tarjetaProducto.screenshot({
      path: './evidencias/clase03/reto2-producto-filtrado.png'
    });
  });

  test('Reto 3 - Locator por atributo parcial: categorías del sidebar', async ({ page }) => {
    await page.goto('/');

    // Los tres enlaces de categoría comparten el atributo onclick="byCat(...)"
    // [onclick*="byCat"] busca elementos cuyo atributo onclick CONTENGA ese texto
    const categorias = page.locator('[onclick*="byCat"]');

    await expect(categorias).toHaveCount(3);

    await expect(categorias.filter({ hasText: 'Phones' })).toBeVisible();
    await expect(categorias.filter({ hasText: 'Laptops' })).toBeVisible();
    await expect(categorias.filter({ hasText: 'Monitors' })).toBeVisible();

    // Evidencia: sidebar con las 3 categorías verificadas
    await page.screenshot({
      path: './evidencias/clase03/reto3-categorias-sidebar.png',
      fullPage: true
    });
  });

});