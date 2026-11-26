import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from 'playwright';

function recordCards(page: Page, name: string) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole('link', { name, exact: true }) });
}

function recordCard(page: Page, name: string) {
  return recordCards(page, name).first();
}

function pageIndicator(page: Page) {
  return page.getByText(/^Page \d+ of \d+$/).first();
}

async function ownedRecordVisible(page: Page, name: string): Promise<boolean> {
  for (let i = 0; i < 100; i++) {
    if (await recordCards(page, name).count() > 0) return true;
    const next = page.getByRole('button', { name: 'Next', exact: true });
    if (await next.count() === 0) return false;
    const previous = await pageIndicator(page).innerText();
    await next.click();
    await expect(pageIndicator(page)).not.toHaveText(previous);
  }
  throw new Error('Too many pages while looking for an owned record');
}

async function createRecord(page: Page, name: string, description: string, status?: string) {
  await page.fill('#name', name);
  await page.fill('#description', description);
  if (status) await page.selectOption('#status', status);
  await page.click('button[type="submit"]');
  await expect(page.locator('#name')).toHaveValue('');
  await expect(pageIndicator(page)).toContainText('Page 1 of');
  await expect(page.getByRole('link', { name, exact: true }).first()).toBeVisible();
}

When(/^I create a new record with name "([^"]*)" and description "([^"]*)" and status "([^"]*)"$/,
  async function (name: string, description: string, status: string) {
    await createRecord(this.page, name, description, status);
  });

When(/^I create a new record with name "([^"]*)" and description "([^"]*)"$/,
  async function (name: string, description: string) {
    await createRecord(this.page, name, description);
  });

Then(/^I should see the record "([^"]*)" with status "([^"]*)" in the list$/,
  async function (name: string, status: string) {
    expect(await ownedRecordVisible(this.page, name)).toBe(true);
    await expect(recordCard(this.page, name)).toContainText(`Status: ${status}`);
  });

When(/^I click on the record link "([^"]*)"$/, async function (name: string) {
  const link = this.page.getByRole('link', { name, exact: true }).first();
  await expect(link).toBeVisible();
  await link.click();
  await this.page.waitForURL(/\/records\/\d+$/);
});

Then(/^I should see the record detail page for "([^"]*)" with status "([^"]*)"$/,
  async function (name: string, status: string) {
    await expect(this.page.locator('h1')).toHaveText('Record');
    await expect(this.page.locator('[data-slot="card-title"]')).toContainText(name);
    await expect(this.page.getByText(`Status: ${status}`, { exact: true })).toBeVisible();
  });

Then('I should see at most 5 owned records on the page', async function () {
  const ownedCards = this.page.locator('[data-slot="card"]').filter({
    has: this.page.locator('a[href^="/records/"]'),
  });
  await expect.poll(async () => ownedCards.count()).toBeLessThanOrEqual(5);
});

Then(/^I should see the owned records page indicator "([^"]*)"$/, async function (text: string) {
  await expect(pageIndicator(this.page)).toContainText(text);
});
