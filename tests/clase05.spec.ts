import { test, expect } from '@playwright/test';
import * as fs from 'fs';

// Crear carpeta para evidencias de la clase 05 si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase05')) {
    fs.mkdirSync('./evidencias/clase05', { recursive: true });
  }
});

test.describe('Clase 05 - Flujo de login y assertions en Sauce Demo', () => {

  test('CE válida: login con credenciales correctas', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Assertion: debemos llegar al inventario
    await expect(page).toHaveURL(/inventory/);
    await expect(page.locator('.inventory_container')).toBeVisible();

    console.log('CE válida: login exitoso');

    // Evidencia: login exitoso en pantalla de inventario
    await page.screenshot({
      path: './evidencias/clase05/01-ce-valida-login-exitoso.png',
      fullPage: true
    });
  });

  test('CE inválida: usuario no existe', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('usuario_inexistente');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Assertion: debe aparecer mensaje de error
    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username and password do not match');

    // Assertion: NO debemos haber navegado al inventario
    await expect(page).not.toHaveURL(/inventory/);

    // Evidencia: mensaje de error de usuario inexistente
    await page.screenshot({
      path: './evidencias/clase05/02-ce-invalida-usuario-no-existe.png'
    });
  });

  test('CE inválida: usuario bloqueado', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    await page.locator('#user-name').fill('locked_out_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('locked out');

    console.log('CE usuario bloqueado: mensaje correcto mostrado');

    // Evidencia: mensaje de error para usuario bloqueado
    await page.screenshot({
      path: './evidencias/clase05/03-ce-invalida-usuario-bloqueado.png'
    });
  });

  test('Valor en frontera: campos vacíos (frontera de longitud mínima)', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    // No llenar nada y hacer clic
    await page.locator('#login-button').click();

    const errorMsg = page.locator('[data-test="error"]');
    await expect(errorMsg).toBeVisible();
    await expect(errorMsg).toContainText('Username is required');

    console.log('Valor frontera: campo vacío maneja error correctamente');

    // Evidencia: error de campos vacíos
    await page.screenshot({
      path: './evidencias/clase05/04-valor-frontera-campos-vacios.png'
    });
  });

  test('Verificar que el inventario tiene exactamente 6 productos', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);

    // Contar productos con assertion exacta
    const productos = page.locator('.inventory_item');
    await expect(productos).toHaveCount(6);

    console.log('El inventario tiene exactamente 6 productos');

    // Evidencia: inventario completo con 6 productos
    await page.screenshot({
      path: './evidencias/clase05/05-inventario-6-productos.png',
      fullPage: true
    });
  });

  test('Verificar precio del primer producto con regex', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);

    const textoPrecio = await page.locator('.inventory_item_price').first().textContent();

    // El regex valida el formato $XX.XX (p.ej. $29.99)
    expect(textoPrecio?.trim()).toMatch(/^\$\d+\.\d{2}$/);

    // Evidencia: primer producto e indicador de precio
    await page.locator('.inventory_item').first().screenshot({
      path: './evidencias/clase05/06-precio-primer-producto.png'
    });
  });

  test('Verificar atributos y estados de los elementos del inventario', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();
    await expect(page).toHaveURL(/inventory/);

    const primerBoton = page.locator('.btn_inventory').first();
    await expect(primerBoton).toBeEnabled();
    await expect(primerBoton).toHaveText('Add to cart');

    // Clic y verificar cambio a 'Remove'
    await primerBoton.click();
    await expect(primerBoton).toHaveText('Remove');

    // Verificar que el carrito muestra 1 item
    const badgeCarrito = page.locator('.shopping_cart_badge');
    await expect(badgeCarrito).toBeVisible();
    await expect(badgeCarrito).toHaveText('1');

    console.log('El botón cambia de estado y el carrito se actualiza');

    // Evidencia: estado del botón 'Remove' y badge del carrito con '1'
    await page.screenshot({
      path: './evidencias/clase05/07-estado-boton-y-badge-carrito.png'
    });
  });

  test('Verificar múltiples propiedades del primer producto con soft assertions', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const primerProducto = page.locator('.inventory_item').first();

    // Con soft assertions, si una falla, las demás siguen
    await expect.soft(primerProducto.locator('.inventory_item_name')).toBeVisible();
    await expect.soft(primerProducto.locator('.inventory_item_desc')).toBeVisible();
    await expect.soft(primerProducto.locator('.inventory_item_price')).toBeVisible();
    await expect.soft(primerProducto.locator('.btn_inventory')).toBeEnabled();
    await expect.soft(primerProducto.locator('img')).toBeVisible();

    console.log('Soft assertions del primer producto completadas');

    // Evidencia: captura del elemento validado mediante soft assertions
    await primerProducto.screenshot({
      path: './evidencias/clase05/08-soft-assertions-producto.png'
    });
  });

  test('Tabla de decisión - Regla 1: logueado con items -> puede pagar', async ({ page }) => {
    // Login
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Agregar item
    await page.locator('.btn_inventory').first().click();

    // Ir al carrito
    await page.locator('.shopping_cart_link').click();
    await expect(page).toHaveURL(/cart/);

    // Debe existir el botón de checkout
    const btnCheckout = page.getByText('Checkout');
    await expect(btnCheckout).toBeVisible();
    await expect(btnCheckout).toBeEnabled();

    // Evidencia: carrito con items y botón Checkout habilitado
    await page.screenshot({
      path: './evidencias/clase05/09-tabla-decision-regla1-checkout.png',
      fullPage: true
    });
  });

  test('Tabla de decisión - Regla 2: logueado sin items -> carrito vacío', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    // Ir al carrito sin agregar nada
    await page.locator('.shopping_cart_link').click();

    // El carrito debe estar vacío
    const itemsCarrito = page.locator('.cart_item');
    await expect(itemsCarrito).toHaveCount(0);

    // Evidencia: pantalla de carrito completamente vacío
    await page.screenshot({
      path: './evidencias/clase05/10-tabla-decision-regla2-carrito-vacio.png',
      fullPage: true
    });
  });

  // --- TESTS RETO (TAREA 05) ---

  test('Reto 1: toHaveValue() - Ordenar por precio y verificar selección y primer valor', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const selectOrden = page.locator('[data-test="product-sort-container"]');
    await selectOrden.selectOption('lohi');

    // Assertion 1: Verificar que el selector tomó el valor 'lohi'
    await expect(selectOrden).toHaveValue('lohi');

    // Assertion 2: Verificar que el primer producto ahora cuesta $7.99
    const primerPrecio = page.locator('.inventory_item_price').first();
    await expect(primerPrecio).toHaveText('$7.99');

    // Evidencia: catálogo ordenado de menor a mayor precio
    await page.screenshot({
      path: './evidencias/clase05/reto1-to-have-value-ordenamiento.png',
      fullPage: true
    });
  });

  test('Reto 2: toBeFocused() - Verificar el foco en el campo de usuario', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');

    const userInput = page.locator('#user-name');
    await userInput.click();

    // Assertion: Verificar que el campo recibió el foco del teclado
    await expect(userInput).toBeFocused();

    // Evidencia: foco activo en el campo username
    await page.screenshot({
      path: './evidencias/clase05/reto2-to-be-focused-campo-usuario.png'
    });
  });

  test('Reto 3: toHaveCSS() - Verificar propiedad CSS del botón Add to cart', async ({ page }) => {
    await page.goto('https://www.saucedemo.com');
    await page.locator('#user-name').fill('standard_user');
    await page.locator('#password').fill('secret_sauce');
    await page.locator('#login-button').click();

    const primerBoton = page.locator('.btn_inventory').first();

    // Assertion: Verificar propiedad computada 'cursor' sea 'pointer'
    await expect(primerBoton).toHaveCSS('cursor', 'pointer');

    // Evidencia: captura del botón verificado
    await primerBoton.screenshot({
      path: './evidencias/clase05/reto3-to-have-css-cursor-pointer.png'
    });
  });

});