import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { ApiError } from '../../../src/api/apiError';
import { UsersService } from '../../../src/api/userApi';
import { idFromUri } from '../../../src/lib/hal';

type ApiWorld = {
  apiError?: unknown;
  apiUser?: { id: string; email: string; password: string };
};

const anonymous = { getAuth: async () => null };

function basicAuth(email: string, password: string) {
  return { getAuth: async () => `Basic ${Buffer.from(`${email}:${password}`).toString('base64')}` };
}

function lastApiError(world: ApiWorld): ApiError {
  expect(world.apiError, 'expected the last API call to fail').toBeInstanceOf(ApiError);
  return world.apiError as ApiError;
}

/** Runs the call and keeps the error (if any) for the following Then steps */
async function capture(world: ApiWorld, call: () => Promise<unknown>) {
  world.apiError = undefined;
  try {
    await call();
  } catch (error) {
    world.apiError = error;
  }
}

When(
  /^I create a user through the API client with email "([^"]*)" and password "([^"]*)"$/,
  async function (this: ApiWorld, email: string, password: string) {
    await capture(this, () => new UsersService(anonymous).createUser({ email, password, fullName: 'API Client' }));
  },
);

Then(/^the API error has status (\d+)$/, function (this: ApiWorld, status: string) {
  expect(lastApiError(this).status).toBe(Number(status));
});

Then(/^the API error message is "([^"]*)"$/, function (this: ApiWorld, message: string) {
  expect(lastApiError(this).message).toBe(message);
});

// The text depends on the backend locale, so only its presence is checked
Then(/^the API error has a message for field "([^"]*)"$/, function (this: ApiWorld, field: string) {
  expect(lastApiError(this).fieldErrors?.[field]).toBeTruthy();
});

Then(/^the API error does not contain "([^"]*)"$/, function (this: ApiWorld, secret: string) {
  const error = lastApiError(this);
  const serialized = JSON.stringify({ ...error, message: error.message, stack: error.stack });
  expect(serialized).not.toContain(secret);
});

// Unique email per scenario: the backend keeps data while it runs
Given(/^there is a new API user with password "([^"]*)"$/, async function (this: ApiWorld, password: string) {
  const email = `e2e-api-${Date.now()}-${Math.floor(Math.random() * 1e6)}@sample.app`;
  const user = await new UsersService(anonymous).createUser({ email, password, fullName: 'API User' });
  const id = idFromUri(user.uri);
  if (!id) throw new Error('Created user has no uri');
  this.apiUser = { id, email, password };
});

function apiUser(world: ApiWorld) {
  if (!world.apiUser) throw new Error('No API user created in this scenario');
  return world.apiUser;
}

When(/^the API user changes the full name to "([^"]*)"$/, async function (this: ApiWorld, fullName: string) {
  const user = apiUser(this);
  await new UsersService(basicAuth(user.email, user.password)).updateUser(user.id, { fullName });
});

Then(/^the API user's full name is "([^"]*)"$/, async function (this: ApiWorld, fullName: string) {
  const user = apiUser(this);
  const current = await new UsersService(basicAuth(user.email, user.password)).getCurrentUser();
  expect(current?.fullName).toBe(fullName);
});

When(
  /^the API user changes the password from "([^"]*)" to "([^"]*)"$/,
  async function (this: ApiWorld, currentPassword: string, newPassword: string) {
    const user = apiUser(this);
    await capture(this, () =>
      new UsersService(basicAuth(user.email, user.password)).changePassword(user.id, currentPassword, newPassword),
    );
  },
);

Then(/^the API user can sign in with password "([^"]*)"$/, async function (this: ApiWorld, password: string) {
  expect(this.apiError).toBeUndefined();
  const user = apiUser(this);
  const current = await new UsersService(basicAuth(user.email, password)).getCurrentUser();
  expect(current?.email).toBe(user.email);
});

Given('I open the registration page', async function () {
  await this.page.goto('http://localhost:3000/users/register');
});

When(
  /^I register with name "([^"]*)", email "([^"]*)" and password "([^"]*)"$/,
  async function (fullName: string, email: string, password: string) {
    await this.page.getByLabel('Full name').fill(fullName);
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Register' }).click();
  },
);

Then(/^I should see the field error "([^"]*)"$/, async function (message: string) {
  await expect(this.page.getByText(message)).toBeVisible();
});

Then('I am still on the registration page', async function () {
  await expect(this.page).toHaveURL(/\/users\/register$/);
});
