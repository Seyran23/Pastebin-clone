import { expect, Page, request, test } from '@playwright/test';

const API_URL = process.env.PLAYWRIGHT_API_URL ?? 'http://localhost:8080';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    isActivated: boolean;
    hasPassword: boolean;
    avatar: string | null;
    location: string | null;
    createdAt: string;
  };
}

const E2E_PASSWORD = 'StrongPass123!';

async function signupOrLogin(username: string): Promise<AuthTokens> {
  const api = await request.newContext({ baseURL: API_URL });

  const signupRes = await api.post('/api/auth/signup', {
    data: { username, email: `${username}@e2e.test`, password: E2E_PASSWORD },
  });

  // 201 = created, return tokens directly
  if (signupRes.status() === 201) {
    return signupRes.json() as Promise<AuthTokens>;
  }

  // 409 (already exists) or 429 (rate limited) — fall back to login
  if (signupRes.status() === 409 || signupRes.status() === 429) {
    const loginRes = await api.post('/api/auth/login', {
      data: { username, password: E2E_PASSWORD },
    });
    if (!loginRes.ok()) {
      const hint =
        signupRes.status() === 429
          ? '\n\nHint: signup rate limit hit and user does not exist yet. ' +
            'Stop your dev backend and let Playwright start it automatically ' +
            '(`npm run test:e2e`) — it uses NODE_ENV=test which skips rate limits.'
          : '';
      throw new Error(`Login fallback failed: ${loginRes.status()} ${await loginRes.text()}${hint}`);
    }
    return loginRes.json() as Promise<AuthTokens>;
  }

  throw new Error(`Signup failed: ${signupRes.status()} ${await signupRes.text()}`);
}

async function injectAuth(page: Page, tokens: AuthTokens) {
  await page.addInitScript(
    ({ accessToken, refreshToken, user }) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      // Force isActivated: true so the header renders the dropdown (not the unactivated banner)
      localStorage.setItem('user', JSON.stringify({ ...user, isActivated: true }));
    },
    { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, user: tokens.user },
  );
}

test.describe('Authenticated paste flow', () => {
  let tokens: AuthTokens;
  const username = 'e2e_playwright_user';

  test.beforeAll(async () => {
    tokens = await signupOrLogin(username);
  });

  test('home page shows username in header when tokens are in localStorage', async ({ page }) => {
    await injectAuth(page, tokens);
    await page.goto('/');

    await expect(page.getByText(username)).toBeVisible({ timeout: 8_000 });
  });

  test('can create a paste and land on the paste view page', async ({ page }) => {
    await injectAuth(page, tokens);
    await page.goto('/');

    await page.waitForSelector('.monaco-editor');
    await page.locator('.monaco-editor').first().click();
    await page.keyboard.type('console.log("e2e test paste")');

    await page.getByPlaceholder('Optional title').fill('E2E Test Paste');

    await page.getByRole('button', { name: 'Create Paste' }).click();

    // URL changes from / to /:link (8-char hash)
    await page.waitForURL(/\/[a-zA-Z0-9]{8}$/, { timeout: 15_000 });

    // Paste view shows the title in the h2 heading
    await expect(page.getByRole('heading', { name: 'E2E Test Paste' })).toBeVisible({ timeout: 8_000 });
  });

  test('dashboard page loads with summary stat cards', async ({ page }) => {
    await injectAuth(page, tokens);
    await page.goto(`/user/dashboard`);

    // Dashboard has four stat cards
    await expect(page.getByText(/total pastes/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/total views/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/total likes/i)).toBeVisible({ timeout: 8_000 });
    await expect(page.getByText(/total comments/i)).toBeVisible({ timeout: 8_000 });
  });

  test('user profile page loads with pastes table', async ({ page }) => {
    await injectAuth(page, tokens);
    await page.goto(`/user/${username}`);

    await expect(page.getByText(username)).toBeVisible({ timeout: 8_000 });
  });

  test('logout clears auth state and hides username', async ({ page }) => {
    await injectAuth(page, tokens);
    await page.goto('/');

    await page.getByRole('button', { name: 'User menu' }).click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();

    // After logout, Login link should appear
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible({ timeout: 8_000 });
  });
});

test.describe('Auth guard', () => {
  test('redirects unauthenticated user from /user/dashboard to /login', async ({ page }) => {
    await page.goto('/user/dashboard');
    await page.waitForURL(/\/login/, { timeout: 8_000 });
    await expect(page).toHaveURL(/\/login/);
  });
});
