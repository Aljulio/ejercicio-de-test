import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  readonly page: Page;

  // Paso uno: datos del comprador
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly postalCodeInput: Locator;
  readonly continueButton: Locator;

  // Paso dos: resumen de la orden
  readonly finishButton: Locator;

  // Confirmación
  readonly completeHeader: Locator;

  constructor(page: Page) {
    this.page = page;

    this.firstNameInput = page.locator('[data-test="firstName"]');
    this.lastNameInput = page.locator('[data-test="lastName"]');
    this.postalCodeInput = page.locator('[data-test="postalCode"]');
    this.continueButton = page.locator('[data-test="continue"]');

    this.finishButton = page.locator('[data-test="finish"]');

    this.completeHeader = page.locator('.complete-header');
  }

  async fillInformation(firstName: string, lastName: string, postalCode: string) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async continueToOverview() {
    await this.continueButton.click();
    await expect(this.page).toHaveURL(/checkout-step-two/);
  }

  async finishPurchase() {
    await this.finishButton.click();
    await expect(this.page).toHaveURL(/checkout-complete/);
  }

  async expectPurchaseComplete() {
    await expect(this.completeHeader).toHaveText('Thank you for your order!');
  }

  // Flujo de alto nivel: llena el formulario y termina la compra de principio a fin
  async completeCheckout(firstName: string, lastName: string, postalCode: string) {
    await this.fillInformation(firstName, lastName, postalCode);
    await this.continueToOverview();
    await this.finishPurchase();
  }
}
