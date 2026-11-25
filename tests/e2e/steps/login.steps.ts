import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

Given('I open the main page', async function () {
  await this.page.goto('http://localhost:3000');
});

When(/^I click the button "([^"]*)"$/, async function (buttonText: string) {
  await this.page.click(`text="${buttonText}"`);
});

Given('I open the login page', async function () {
  await this.page.goto('http://localhost:3000/login');
});

When(/^I enter "([^"]*)" and "([^"]*)"$/, async function (email: string, password: string) {
  await this.page.fill('#email', email);
  await this.page.fill('#password', password);
  await this.page.click('button[type="submit"]');
});

Then(/^I should see the user page for "([^"]*)"$/, async function (name: string) {
  await this.page.waitForURL(/\/users\/\d+$/);
  await expect(this.page.locator('h1')).toContainText(name);
});

Then(/^I should see the login error "([^"]*)"$/, async function (message: string) {
  await expect(this.page.getByText(message)).toBeVisible();
});
