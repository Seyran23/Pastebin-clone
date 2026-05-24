import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('loads with New Paste heading and editor', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'New Paste' })).toBeVisible();
    await expect(page.locator('.monaco-editor')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Paste' })).toBeVisible();
  });

  test('shows error toast when Create Paste is clicked with empty content', async ({ page }) => {
    await page.goto('/');

    await page.waitForSelector('.monaco-editor');
    await page.getByRole('button', { name: 'Create Paste' }).click();

    await expect(page.getByText('Content cannot be empty')).toBeVisible();
  });
});

test.describe('Archive page', () => {
  test('loads and shows public pastes section', async ({ page }) => {
    await page.goto('/archive');

    await expect(page.getByRole('heading', { name: /archive/i })).toBeVisible();
  });
});

test.describe('Login page', () => {
  test('loads with login form', async ({ page }) => {
    await page.goto('/login');

    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
    await expect(page.getByPlaceholder('Your username')).toBeVisible();
    await expect(page.getByPlaceholder('Your password')).toBeVisible();
    await expect(page.locator('form').getByRole('button', { name: 'Login' })).toBeVisible();
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByPlaceholder('Your username').fill('nobody_at_all');
    await page.getByPlaceholder('Your password').fill('StrongPass123!');
    await page.locator('form').getByRole('button', { name: 'Login' }).click();

    await expect(page.getByText(/not found|invalid|incorrect|doesn.*t exist/i).first()).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Signup page', () => {
  test('loads with registration form', async ({ page }) => {
    await page.goto('/signup');

    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByPlaceholder('Your username')).toBeVisible();
    await expect(page.getByPlaceholder('Your email address')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create My Account' })).toBeVisible();
  });
});
