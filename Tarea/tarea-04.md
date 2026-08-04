# Tarea 04 — Reflexión: Los 7 Principios del Testing (ISTQB)

## ¿Cuál de los 7 principios te parece más importante y por qué?

Para mí, el principio más importante es el **Principio 3: Las pruebas tempranas ahorran tiempo y dinero (shift-left)**.

Encontrar un bug desde la etapa de desarrollo ayuda a prevenir errores graves y a entregarle al cliente un producto de calidad, sin dejar nada a la especulación de "a ver qué pasa cuando se le muestre al cliente". Mientras más tarde se detecta un error, más caro y complicado resulta corregirlo, y eso no solo cuesta tiempo y dinero, sino también la confianza del cliente en el producto.

**Ejemplo aplicado al curso:** en la Clase 02, al automatizar la captura del footer, detectamos que el selector `.container-fluid` ya no existía en la página real de DemoBlaze. Como lo probamos en ese momento, pudimos encontrar el selector correcto (`footer`) y corregirlo en minutos.
