import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { MenuPage } from '../pages/MenuPage';

// Crear carpeta para evidencias de la clase 06 si no existe
test.beforeAll(() => {
  if (!fs.existsSync('./evidencias/clase06')) {
    fs.mkdirSync('./evidencias/clase06', { recursive: true });
  }
});

test.describe('Clase 06 - Page Object Model en Sauce Demo', () => {

  test('Login exitoso con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.expectToBeOnInventoryPage();

    console.log('Login con POM exitoso');

    // Evidencia: login exitoso en pantalla de inventario
    await page.screenshot({
      path: './evidencias/clase06/01-login-exitoso-pom.png',
      fullPage: true
    });
  });

  test('Login fallido con POM', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('wrong_user', 'wrong_pass');

    await loginPage.expectLoginError('Username and password do not match');

    console.log('Error de login capturado con POM');

    // Evidencia: mensaje de error de login
    await page.screenshot({
      path: './evidencias/clase06/02-login-fallido-pom.png'
    });
  });

  test('Flujo completo: login → agregar 2 productos → verificar carrito', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    // Agregar productos por nombre
    await inventoryPage.addProductByName('Sauce Labs Backpack');
    await inventoryPage.addProductByName('Sauce Labs Bike Light');

    // Verificar badge del carrito
    await expect(inventoryPage.cartBadge).toHaveText('2');

    // Ir al carrito
    await inventoryPage.goToCart();
    await cartPage.expectItemCount(2);

    console.log('Flujo completo con POM: 2 productos en carrito');

    // Evidencia: carrito con 2 productos
    await page.screenshot({
      path: './evidencias/clase06/03-carrito-2-productos.png',
      fullPage: true
    });
  });

  test('Verificar que el inventario tiene 6 productos', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    const count = await inventoryPage.getProductCount();
    expect(count).toBe(6);

    console.log('El inventario tiene exactamente 6 productos');

    // Evidencia: inventario completo con 6 productos
    await page.screenshot({
      path: './evidencias/clase06/04-inventario-6-productos.png',
      fullPage: true
    });
  });

  test('Ordenar productos de mayor a menor precio', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');

    // Ordenar de mayor a menor precio
    await inventoryPage.sortBy('hilo');

    const precios = page.locator('.inventory_item_price');

    // Los precios deben estar en orden descendente
    const todosLosPrecios = await precios.allTextContents();
    const numericos = todosLosPrecios.map(p => parseFloat(p.replace('$', '')));
    for (let i = 0; i < numericos.length - 1; i++) {
      expect(numericos[i]).toBeGreaterThanOrEqual(numericos[i + 1]);
    }

    console.log('Productos ordenados de mayor a menor precio');

    // Evidencia: catálogo ordenado de mayor a menor precio
    await page.screenshot({
      path: './evidencias/clase06/05-orden-mayor-menor-precio.png',
      fullPage: true
    });
  });

  // ============================================================
  // TESTS RETO - Tarea de la Clase 06
  // ============================================================

  test('Reto 1: CheckoutPage - completar una compra de principio a fin', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    // Login y agregar un producto
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addProductByName('Sauce Labs Backpack');

    // Ir al carrito y proceder al checkout
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();

    // Completar la compra de principio a fin
    await checkoutPage.completeCheckout('Juan', 'Perez', '01001');
    await checkoutPage.expectPurchaseComplete();

    console.log('Reto 1: compra completada de principio a fin con CheckoutPage');

    // Evidencia: pantalla de confirmación de compra
    await page.screenshot({
      path: './evidencias/clase06/reto1-checkout-completado.png',
      fullPage: true
    });
  });

  test('Reto 2: MenuPage - flujo de logout desde el menú hamburguesa', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);
    const menuPage = new MenuPage(page);

    // Login
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.expectToBeOnInventoryPage();

    // Abrir el menú antes de cerrar sesión (evidencia del menú abierto)
    await menuPage.open();
    await page.screenshot({
      path: './evidencias/clase06/reto2-menu-abierto.png'
    });

    // Logout usando el menú hamburguesa
    await menuPage.logoutLink.click();
    await expect(page).toHaveURL('https://www.saucedemo.com/');

    // Debe regresar a la pantalla de login
    await expect(loginPage.loginButton).toBeVisible();

    console.log('Reto 2: logout exitoso con MenuPage');

    // Evidencia: pantalla de login tras el logout
    await page.screenshot({
      path: './evidencias/clase06/reto2-logout-exitoso.png'
    });
  });

  test('Reto 3: removeProductByName() - el badge desaparece al llegar a 0', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Login y agregar un producto
    await loginPage.navigate();
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addProductByName('Sauce Labs Backpack');

    // Confirmar que el badge muestra 1
    await expect(inventoryPage.cartBadge).toHaveText('1');

    // Evidencia: badge del carrito con 1 producto, antes de quitarlo
    await page.screenshot({
      path: './evidencias/clase06/reto3-badge-antes.png'
    });

    // Quitar el producto
    await inventoryPage.removeProductByName('Sauce Labs Backpack');

    // El badge debe desaparecer al llegar a 0
    await inventoryPage.expectCartBadgeHidden();

    console.log('Reto 3: badge del carrito desaparece al quitar el único producto');

    // Evidencia: inventario sin badge visible (carrito vacío)
    await page.screenshot({
      path: './evidencias/clase06/reto3-badge-despues.png'
    });
  });

});