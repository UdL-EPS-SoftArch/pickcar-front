import { When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';

// "Given I open the main page" is defined in login.steps.ts

/** Local "YYYY-MM-DDTHH:mm" value for a datetime-local input, `days` from now at 10:00. */
function localDateTime(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

When(
  /^I search cars in "([^"]*)" from (-?\d+) days to (-?\d+) days from now$/,
  async function (location: string, fromDays: string, toDays: string) {
    await this.page.fill('#location', location);
    await this.page.fill('#pickup', localDateTime(Number(fromDays)));
    await this.page.fill('#dropoff', localDateTime(Number(toDays)));
    await this.page.getByRole('button', { name: 'Search' }).click();
  },
);

Then(/^I should be on the search page for "([^"]*)"$/, async function (location: string) {
  await this.page.waitForURL(/\/search\?/);
  const url = new URL(this.page.url());
  expect(url.searchParams.get('location')).toBe(location);
  expect(url.searchParams.get('start')).not.toBeNull();
  expect(url.searchParams.get('end')).not.toBeNull();
});

Then(/^I should see the search error "([^"]*)"$/, async function (message: string) {
  await expect(this.page.getByRole('alert').filter({ hasText: message })).toBeVisible();
});

Then('I should still be on the main page', async function () {
  expect(new URL(this.page.url()).pathname).toBe('/');
});
