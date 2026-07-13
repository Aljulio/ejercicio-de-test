import { test, expect } from '@playwright/test';

// Test 1: Navegar por las categorías (Clic en Laptops y verificar que cambien los productos)
test('Filtrar productos por la categoría Laptops', async ({ page }) => {
  await page.goto('/');
  
  // Selecciona la categoría "Laptops" en el menú de la izquierda usando su texto
  await page.getByRole('link', { name: 'Laptops' }).click();
  
  // Espera un momento a que carguen las laptops y verifica que el primer producto sea una Sony Vaio
  const primerProducto = page.locator('.card-title a').first();
  await expect(primerProducto).toContainText('Sony vaio');
});

// Test 2: Agregar un producto al carrito de compras
test('Agregar la Sony Vaio i5 al carrito de compras', async ({ page }) => {
  // Ir directo a la página del producto Sony Vaio i5
  await page.goto('/prod.html?idp_=8');
  
  // Configura el manejador para aceptar la alerta nativa del navegador ("Product added")
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('Product added');
    await dialog.accept();
  });

  // Hace clic en el botón verde de "Add to cart"
  await page.getByRole('link', { name: 'Add to cart' }).click();
  
  // Va a la página del carrito para verificar que se haya agregado
  await page.goto('/cart.html');
  await expect(page.locator('#tbodyid')).toContainText('Sony vaio i5');
});

// Test 3: Validar el envío del formulario de contacto (Solución definitiva al botón Close)
test('Abrir y validar el formulario de Contacto', async ({ page }) => {
  await page.goto('/');
  
  // Hace clic en "Contact" en el menú superior
  await page.getByRole('link', { name: 'Contact' }).click();
  
  // Espera a que el modal de contacto sea visible
  await expect(page.locator('#exampleModal')).toBeVisible();
  
  // Rellena los campos del formulario usando sus IDs correspondientes
  await page.locator('#recipient-email').fill('correo@ejemplo.com');
  await page.locator('#recipient-name').fill('Julio');
  await page.locator('#message-text').fill('Hola, esto es una prueba automatizada.');
  
  // Selecciona el botón gris usando su clase específica para evitar duplicados
  await page.locator('#exampleModal button.btn-secondary').click();
});