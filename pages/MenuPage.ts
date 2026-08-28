import { Page, Locator, expect } from '@playwright/test';

export class MenuPage {
  readonly page: Page;

  readonly menuButton: Locator;
  readonly closeMenuButton: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    this.menuButton = page.locator('#react-burger-menu-btn');
    this.closeMenuButton = page.locator('#react-burger-cross-btn');
    this.logoutLink = page.locator('#logout_sidebar_link');
  }

  async open() {
    await this.menuButton.click();
    await expect(this.logoutLink).toBeVisible();
  }

  async close() {
    await this.closeMenuButton.click();
  }

  async logout() {
    await this.open();
    await this.logoutLink.click();
    await expect(this.page).toHaveURL('https://www.saucedemo.com/');
  }
}
