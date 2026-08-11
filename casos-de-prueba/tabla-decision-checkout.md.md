# Tabla de Decisión: Proceso de Checkout (Sauce Demo)

## Condiciones y Acciones

| Tipo | Condición / Acción | R1 | R2 | R3 | R4 | R5 | R6 |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Condiciones** | C1: Usuario autenticado | Sí | Sí | Sí | Sí | No | Sí |
| | C2: Carrito contiene items | Sí | Sí | No | Sí | Sí | Sí |
| | C3: Datos de envío completos (First Name, Last Name, Zip) | Sí | No | Sí | Sí | Sí | Sí |
| | C4: Clic en "Finish" / Confirmar compra | Sí | - | - | No | - | Sí (Cancel) |
| **Acciones** | A1: Permitir avanzar a Step Two (Overview) | X | | | | | |
| | A2: Mostrar mensaje de error en formulario | | X | | | | |
| | A3: Permitir llegar a checkout vacilante / $0 | | | X | | | |
| | A4: Mostrar página de confirmación ("Thank you for your order") | X | | | | | |
| | A5: Redirigir a pantalla de Login | | | | | X | |
| | A6: Cancelar operación y regresar a Inventario | | | | | | X |

## Descripción de las Reglas

1. **R1 (Flujo Exitoso):** Usuario autenticado, con ítems en el carrito, llena todos los datos de envío y confirma. La compra finaliza con éxito.
2. **R2 (Formulario Incompleto):** Usuario intenta avanzar en el checkout sin completar campos requeridos (First Name, Last Name o Postal Code). El sistema despliega un mensaje de error explícito.
3. **R3 (Checkout sin Ítems):** Usuario accede al flujo de checkout con 0 productos en el carrito. La interfaz permite la navegación pero el costo total es $0.00.
4. **R4 (Abandono en Overview):** Usuario llega a la pantalla de revisión final pero no hace clic en "Finish". La orden no se procesa.
5. **R5 (Sesión No Autenticada):** Intento de navegación directa a `/checkout-step-one.html` sin sesión activa. El sistema restringe el acceso y redirige a la pantalla de login.
6. **R6 (Cancelación explícita):** Usuario con carrito y datos completos decide presionar "Cancel" en el resumen. Se cancela el checkout y se retorna al inventario/carrito.