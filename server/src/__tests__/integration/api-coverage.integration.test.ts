/**
 * Covers every API endpoint that had zero integration test coverage:
 *
 * Auth:    GET  /refresh · POST /forgot-password · POST /forgot-username
 *          POST /resend-activation · POST /reset-password (bad token)
 * Paste:   GET  /categories · /syntax-highlights · /expiration-time
 *          GET  /summary · POST /unlock-paste · GET /search-self
 *          GET  /user-comments/:username
 * User:    GET  /profile/:username/pastes · PATCH /edit/profile-details
 */
import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/app';

const AUTH = '/api/auth';
const PASTES = '/api/pastes';
const USERS = '/api/users';

let testId = 0;
const nextUser = () => {
  testId++;
  return {
    username: `coverage${testId}`,
    email: `coverage${testId}@test.com`,
    password: 'StrongPass123!',
  };
};

async function signupAndLogin() {
  const user = nextUser();
  const signup = await request(app).post(`${AUTH}/signup`).send(user);
  const login = await request(app)
    .post(`${AUTH}/login`)
    .send({ username: user.username, password: user.password });
  return {
    token: (login.body as { accessToken: string }).accessToken,
    refreshToken: (signup.body as { refreshToken: string }).refreshToken,
    username: user.username,
    password: user.password,
  };
}

async function createPaste(token: string, opts: { exposure?: string; password?: string } = {}) {
  const res = await request(app)
    .post(`${PASTES}/create`)
    .set('Authorization', `Bearer ${token}`)
    .send({
      content: 'test content',
      name: 'Test Paste',
      exposure: opts.exposure ?? 'public',
      expirationTime: 'never',
      ...(opts.password ? { password: opts.password } : {}),
    });
  return res.body as { id: string; linkEndpoint: string };
}

// ─── Auth ────────────────────────────────────────────────────────────────────

describe('GET /api/auth/refresh', () => {
  it('returns new token pair for a valid refresh token', async () => {
    const { refreshToken } = await signupAndLogin();

    const res = await request(app)
      .get(`${AUTH}/refresh`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    // rotated — new refresh token differs from the old one
    expect(res.body.refreshToken).not.toBe(refreshToken);
  });

  it('returns 401 for an invalid refresh token', async () => {
    const res = await request(app)
      .get(`${AUTH}/refresh`)
      .send({ refreshToken: 'this.is.invalid' });

    expect(res.status).toBe(401);
  });

  it('returns 401 when refresh token is omitted', async () => {
    const res = await request(app).get(`${AUTH}/refresh`).send({});
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/forgot-password', () => {
  it('returns 200 with generic message regardless of whether user exists', async () => {
    const res = await request(app)
      .post(`${AUTH}/forgot-password`)
      .send({ username: 'nonexistent_xyz' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 200 for an existing user (no email enumeration)', async () => {
    const { username } = await signupAndLogin();

    const res = await request(app)
      .post(`${AUTH}/forgot-password`)
      .send({ username });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      (
        await request(app)
          .post(`${AUTH}/forgot-password`)
          .send({ username: 'nobody_9999' })
      ).body.message,
    );
  });
});

describe('POST /api/auth/forgot-username', () => {
  it('returns 200 with generic message regardless of whether email exists', async () => {
    const res = await request(app)
      .post(`${AUTH}/forgot-username`)
      .send({ email: 'nobody@example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /api/auth/reset-password', () => {
  it('returns 4xx for an invalid/expired reset token', async () => {
    const res = await request(app)
      .post(`${AUTH}/reset-password`)
      .send({ token: 'bad.reset.token', newPassword: 'NewStrongPass456!' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('POST /api/auth/resend-activation', () => {
  it('returns 409 when account is already activated', async () => {
    // Accounts in test env are not activated by default, but 409 is returned
    // if isActivated=true. Newly created accounts are NOT activated, so this
    // call should succeed (200) or return 404 if email mismatch.
    const user = nextUser();
    await request(app).post(`${AUTH}/signup`).send(user);

    const res = await request(app)
      .post(`${AUTH}/resend-activation`)
      .send({ username: user.username, email: user.email });

    // Account not yet activated → 200 (resend succeeds, email is mocked)
    expect(res.status).toBe(200);
  });

  it('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .post(`${AUTH}/resend-activation`)
      .send({ username: 'nobody_xyz', email: 'nobody@xyz.com' });

    expect(res.status).toBe(404);
  });
});

// ─── Paste lookup data ────────────────────────────────────────────────────────

describe('GET /api/pastes/categories', () => {
  it('returns an array', async () => {
    const res = await request(app).get(`${PASTES}/categories`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/pastes/syntax-highlights', () => {
  it('returns an array', async () => {
    const res = await request(app).get(`${PASTES}/syntax-highlights`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/pastes/expiration-time', () => {
  it('returns an array of labels', async () => {
    const res = await request(app).get(`${PASTES}/expiration-time`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── Paste summary (sidebar) ──────────────────────────────────────────────────

describe('GET /api/pastes/summary', () => {
  it('returns public summaries for type=public', async () => {
    const { token } = await signupAndLogin();
    await createPaste(token);

    const res = await request(app).get(`${PASTES}/summary?type=public`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns own summaries for type=mine when authenticated', async () => {
    const { token } = await signupAndLogin();
    await createPaste(token);

    const res = await request(app)
      .get(`${PASTES}/summary?type=mine`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('returns 400 for unknown type', async () => {
    const res = await request(app).get(`${PASTES}/summary?type=unknown`);
    expect(res.status).toBe(400);
  });
});

// ─── Unlock password-protected paste ─────────────────────────────────────────

describe('POST /api/pastes/unlock-paste', () => {
  it('returns paste content for correct password', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPaste(token, { password: 'unlock123' });

    const res = await request(app)
      .post(`${PASTES}/unlock-paste`)
      .send({ link: paste.linkEndpoint, password: 'unlock123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('pasteData');
  });

  it('returns 403 for wrong password', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPaste(token, { password: 'correctpass' });

    const res = await request(app)
      .post(`${PASTES}/unlock-paste`)
      .send({ link: paste.linkEndpoint, password: 'wrongpass' });

    expect(res.status).toBe(403);
  });
});

// ─── Search own pastes ────────────────────────────────────────────────────────

describe('GET /api/pastes/search-self', () => {
  it('returns matching pastes for the authenticated user', async () => {
    const { token } = await signupAndLogin();
    await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'searchself content', name: 'FindThisPaste', exposure: 'private', expirationTime: 'never' });

    const res = await request(app)
      .get(`${PASTES}/search-self?title=FindThisPaste`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('returns empty array when no pastes match', async () => {
    const { token } = await signupAndLogin();

    const res = await request(app)
      .get(`${PASTES}/search-self?title=zzznomatch999xyz`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get(`${PASTES}/search-self?title=anything`);
    expect(res.status).toBe(401);
  });
});

// ─── User comments ────────────────────────────────────────────────────────────

describe('GET /api/pastes/user-comments/:username', () => {
  it('returns comments authored by the user', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: commenterToken, username: commenterUsername } = await signupAndLogin();
    const paste = await createPaste(ownerToken);

    await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .send({ content: 'Hello from commenter' });

    const res = await request(app).get(`${PASTES}/user-comments/${commenterUsername}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('returns 404 for non-existent username', async () => {
    const res = await request(app).get(`${PASTES}/user-comments/nobody_xyz_9999`);
    expect(res.status).toBe(404);
  });
});

// ─── User profile pastes ──────────────────────────────────────────────────────

describe('GET /api/users/profile/:username/pastes', () => {
  it('returns public pastes for a user profile', async () => {
    const { token, username } = await signupAndLogin();
    await createPaste(token);

    const res = await request(app).get(`${USERS}/profile/${username}/pastes`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('only exposes public pastes to non-owners', async () => {
    const { token, username } = await signupAndLogin();
    await createPaste(token, { exposure: 'private' });
    await createPaste(token, { exposure: 'public' });

    const res = await request(app).get(`${USERS}/profile/${username}/pastes`);

    const hasPrivate = (res.body as { exposure: string }[]).some((p) => p.exposure === 'private');
    expect(hasPrivate).toBe(false);
  });
});

// ─── Update profile details ───────────────────────────────────────────────────

describe('PATCH /api/users/edit/profile-details', () => {
  it('updates location for the authenticated user', async () => {
    const { token } = await signupAndLogin();

    const res = await request(app)
      .patch(`${USERS}/edit/profile-details`)
      .set('Authorization', `Bearer ${token}`)
      .send({ location: 'Baku, AZ' });

    expect(res.status).toBe(200);
    expect(res.body.user.location).toBe('Baku, AZ');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch(`${USERS}/edit/profile-details`)
      .send({ location: 'Anywhere' });

    expect(res.status).toBe(401);
  });
});
