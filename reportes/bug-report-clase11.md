# Bug Report - BR-CLASE11-001

**Título:** Dos imágenes no cargan correctamente en la página Broken Images

**Fecha:** 11 de octubre de 2026

**Reportado por:** Julio Alberto Hernandez Morales

**Ambiente:** Windows 11, Playwright con Firefox. Sitio web: https://practice.expandtesting.com

## Descripción

Al acceder a la página de imágenes rotas, se detecta que algunas imágenes no cargan correctamente. La prueba automatizada comprueba el ancho natural de cada imagen y detecta al menos una cuyo valor es 0.

## Severidad: Media

El defecto afecta la visualización de imágenes, pero la página puede seguir siendo accesible. Esta clasificación es provisional y se basa en el impacto observado.

## Prioridad: P3

Se propone corregirlo en una iteración posterior, dado que el defecto identificado afecta a un componente visual y no se ha demostrado que bloquee el uso general de la página.

## Frecuencia: Por confirmar

La prueba automatizada detectó el problema durante la ejecución realizada. Se necesita repetir las comprobaciones para determinar si ocurre siempre o de forma intermitente.

## Pasos para reproducir

1. Abrir https://practice.expandtesting.com/broken-images.
2. Esperar a que las imágenes terminen de cargar.
3. Inspeccionar las imágenes de la sección principal.
4. Comprobar el valor de `naturalWidth` de cada imagen.
5. Identificar las imágenes cuyo ancho natural sea 0.

## Resultado esperado

Todas las imágenes de la página deben cargarse correctamente y tener un ancho natural mayor que 0.

## Resultado obtenido

La prueba detecta al menos una imagen cuyo ancho natural es 0 y falla en la aserción `expect(ancho).toBeGreaterThan(0)`.

## Evidencia

Reporte HTML de Playwright correspondiente a la prueba `Imágenes rotas: todas las imágenes de la página deben cargar`. El reporte muestra el error `Expected: > 0; Received: 0` y las anotaciones relacionadas con BUG-001.

## Notas adicionales

La prueba automatizada está identificada con la etiqueta `@bug` y contiene una anotación que referencia este reporte. La frecuencia del defecto deberá confirmarse mediante nuevas ejecuciones.

## Issue en GitHub

**Número:** #1

**Estado:** Abierto

**Enlace:** https://github.com/Aljulio/ejercicio-de-test/issues/1
