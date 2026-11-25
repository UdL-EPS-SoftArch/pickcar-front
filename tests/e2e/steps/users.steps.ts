import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

const API_BASE_URL = process.env.API_BASE_URL || 'http://127.0.0.1:8080';

// Creates the user through the API. A 409 means it already exists, which is fine
// because scenarios only need it to be there.
Given(
  /^there is a registered user "([^"]*)" with email "([^"]*)" and password "([^"]*)"$/,
  async function (fullName: string, email: string, password: string) {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/hal+json' },
      body: JSON.stringify({ email, password, fullName }),
    });
    if (res.status !== 201 && res.status !== 409) {
      throw new Error(`Could not create user ${email}: HTTP ${res.status}`);
    }
  },
);

When('I click the current user in the header', async function () {
  await this.page.getByTestId('current-user').click();
});

Then(/^the header shows the current user "([^"]*)"$/, async function (name: string) {
  await expect(this.page.getByTestId('current-user')).toHaveText(name);
});

Then(
  /^the user page shows role "([^"]*)" and status "([^"]*)"$/,
  async function (role: string, status: string) {
    await expect(this.page.locator('dd').filter({ hasText: new RegExp(`^${role}$`) })).toBeVisible();
    await expect(this.page.locator('dd').filter({ hasText: new RegExp(`^${status}$`) })).toBeVisible();
  },
);
