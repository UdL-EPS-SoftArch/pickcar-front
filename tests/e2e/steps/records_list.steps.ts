import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import type { Page } from 'playwright';

When('I logout', async function () {
  await this.page.click('text="Logout"');
  await expect(this.page).toHaveURL('http://localhost:3000/');
});

When(/^I click the link "([^"]*)"$/, async function (label: string) {
  await this.page.getByRole('link', { name: label, exact: true }).first().click();
});

Then('I should see the records page', async function () {
  await expect(this.page.locator('h1')).toContainText('Records');
});

function recordCard(page: Page, name: string) {
  return page
    .locator('[data-slot="card"]')
    .filter({ has: page.getByRole('link', { name, exact: true }) })
    .first();
}

function pageIndicator(page: Page) {
  return page.getByText(/^Page \d+ of \d+$/).first();
}

async function gotoNextPage(page: Page) {
  const nextPage = Number(new URL(page.url()).searchParams.get('page') ?? '0') + 1;
  await page.getByRole('link', { name: 'Next', exact: true }).click();
  await page.waitForURL(url => Number(url.searchParams.get('page') ?? '0') === nextPage);
  await expect(pageIndicator(page)).toContainText(`Page ${nextPage + 1} of`);
}

async function recordOnAnyPage(page: Page, name: string): Promise<boolean> {
  for (let i = 0; i < 100; i++) {
    if (await recordCard(page, name).count() > 0) return true;
    if (await page.getByRole('link', { name: 'Next', exact: true }).count() === 0) return false;
    await gotoNextPage(page);
  }
  throw new Error('Too many pages while looking for a record');
}

Then(/^I should see the record "([^"]*)" in the records list$/, async function (name: string) {
  expect(await recordOnAnyPage(this.page, name)).toBe(true);
});

Then(/^I should not see the record "([^"]*)" in the records list$/, async function (name: string) {
  expect(await recordOnAnyPage(this.page, name)).toBe(false);
});

Then('I should see at most 5 records on the page', async function () {
  await expect.poll(async () => this.page.locator('[data-slot="card"]').count()).toBeLessThanOrEqual(5);
});

Then(/^I should see the page indicator "([^"]*)"$/, async function (text: string) {
  await expect(pageIndicator(this.page)).toContainText(text);
});
