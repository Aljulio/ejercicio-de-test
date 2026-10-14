import { test, expect } from '@playwright/test';

const BASE_URL = 'https://practice.expandtesting.com';
const EVIDENCIAS = 'evidencias/tarea11/';

test.describe('Tarea 11 - Tests reto de Gestión de Bugs', () => {

  test('Reto 1: medir la frecuencia del defecto de texto', async ({ page }, testInfo) => {
    test.setTimeout(180000);

    const URL = `${BASE_URL}/typos`;
    const repeticiones = 12;
    let aparicionesError = 0;
    const resultados: string[] = [];

    for (let i = 1; i <= repeticiones; i++) {
      await page.goto(URL, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      });

      const texto = await page.locator('body').innerText();

      // El defecto observado en la página es "won,t" en lugar de "won't".
      const contieneError = /\bwon,t\b/i.test(texto);

      if (contieneError) {
        aparicionesError++;
      }

      resultados.push(
        `Ejecución ${i}: ${
          contieneError ? 'error detectado (won,t)' : 'sin error detectado'
        }`
      );

      console.log(resultados[resultados.length - 1]);
    }

    const frecuencia = [
      '# Frecuencia del defecto de texto',
      '',
      `URL: ${URL}`,
      `Repeticiones: ${repeticiones}`,
      `Apariciones detectadas: ${aparicionesError}`,
      `Frecuencia: ${aparicionesError}/${repeticiones}`,
      `Porcentaje: ${((aparicionesError / repeticiones) * 100).toFixed(2)} %`,
      '',
      ...resultados,
    ].join('\n');

    test.info().annotations.push({
      type: 'frecuencia',
      description: `${aparicionesError} de ${repeticiones} ejecuciones`,
    });

    await testInfo.attach('frecuencia-defecto-typos', {
      body: frecuencia,
      contentType: 'text/plain',
    });

    await page.screenshot({
      path: `${EVIDENCIAS}01_frecuencia_typos.png`,
      fullPage: true,
    });

    expect(resultados).toHaveLength(repeticiones);
  });

  test('Reto 2: texto sin errores ortográficos', {
    annotation: {
      type: 'issue',
      description: 'https://github.com/Aljulio/ejercicio-de-test/issues/1',
    },
  }, async ({ page }) => {
    test.fixme(
      true,
      'Pendiente: corregir el defecto de texto antes de activar esta prueba'
    );

    await page.goto(`${BASE_URL}/typos`);

    const texto = await page.locator('body').innerText();

    expect(texto).not.toMatch(/\bwon,t\b/i);

    await page.screenshot({
      path: `${EVIDENCIAS}02_texto_sin_errores.png`,
      fullPage: true,
    });
  });

  test('Reto 3: generar borrador de reporte de un defecto', {
    tag: '@bug',
  }, async ({ page }) => {
    test.fail(true, 'BUG-001: se esperan imágenes que no cargan');

    await page.goto(`${BASE_URL}/broken-images`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    const imagenes = page.locator('main img');

    await expect.poll(async () => {
      return imagenes.evaluateAll(
        imgs => imgs.every(
          img => (img as HTMLImageElement).complete
        )
      );
    }, { timeout: 15000 }).toBe(true);

    await page.screenshot({
      path: `${EVIDENCIAS}03_borrador_bug001.png`,
      fullPage: true,
    });

    const anchos = await imagenes.evaluateAll(
      imgs => imgs.map(
        img => (img as HTMLImageElement).naturalWidth
      )
    );

    for (const ancho of anchos) {
      expect(ancho).toBeGreaterThan(0);
    }
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.errors.length > 0) {
      const URL = page.url();

      const borrador = [
        '# Borrador de reporte de defecto',
        '',
        `**Prueba:** ${testInfo.title}`,
        `**Ambiente:** ${testInfo.project.name}`,
        `**URL:** ${URL}`,
        '',
        '**Resultado obtenido:**',
        ...testInfo.errors.map(error => error.message),
      ].join('\n');

      await testInfo.attach('borrador-reporte-bug', {
        body: borrador,
        contentType: 'text/markdown',
      });
    }
  });

});