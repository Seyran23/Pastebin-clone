import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '@/app';

const AUTH = '/api/auth';
const PASTES = '/api/pastes';

let testId = 0;
const nextUser = () => {
  testId++;
  return {
    username: `pastetest${testId}`,
    email: `pastetest${testId}@test.com`,
    password: 'StrongPass123!',
  };
};

async function signupAndLogin(): Promise<{ token: string; username: string }> {
  const user = nextUser();
  await request(app).post(`${AUTH}/signup`).send(user);
  const res = await request(app)
    .post(`${AUTH}/login`)
    .send({ username: user.username, password: user.password });
  return { token: (res.body as { accessToken: string }).accessToken, username: user.username };
}

// No beforeEach cleanup needed — each test uses a unique username via testId

describe('POST /api/pastes/create', () => {
  it('creates a paste and returns link endpoint', async () => {
    const { token } = await signupAndLogin();

    const res = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello world', name: 'Test Paste', exposure: 'public', expirationTime: 'never' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('linkEndpoint');
    expect(typeof res.body.linkEndpoint).toBe('string');
    expect(res.body.linkEndpoint).toHaveLength(8);
  });

  it('returns 401 without a token', async () => {
    const res = await request(app)
      .post(`${PASTES}/create`)
      .send({ content: 'hello', name: 'Test', exposure: 'public', expirationTime: 'never' });

    expect(res.status).toBe(401);
  });

  it('returns 4xx when content is empty', async () => {
    const { token } = await signupAndLogin();

    const res = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '', name: 'Test', exposure: 'public', expirationTime: 'never' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('GET /api/pastes/:link', () => {
  it('returns paste data for a public paste without auth', async () => {
    const { token } = await signupAndLogin();
    const created = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'hello world', name: 'Public Paste', exposure: 'public', expirationTime: 'never' });

    const link = (created.body as { linkEndpoint: string }).linkEndpoint;
    const res = await request(app).get(`${PASTES}/${link}`);

    expect(res.status).toBe(200);
    expect(res.body.pasteData.title).toBe('Public Paste');
    expect(res.body.requiresPassword).toBe(false);
    expect(res.body).toHaveProperty('viewCount');
  });

  it('returns 403 for a private paste fetched without auth', async () => {
    const { token } = await signupAndLogin();
    const created = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'secret', name: 'Private', exposure: 'private', expirationTime: 'never' });

    const link = (created.body as { linkEndpoint: string }).linkEndpoint;
    const res = await request(app).get(`${PASTES}/${link}`);

    expect(res.status).toBe(403);
  });

  it('returns requiresPassword: true for a password-protected paste', async () => {
    const { token } = await signupAndLogin();
    const created = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'locked', name: 'Locked', exposure: 'public', expirationTime: 'never', password: 'hunter2' });

    const link = (created.body as { linkEndpoint: string }).linkEndpoint;
    const res = await request(app).get(`${PASTES}/${link}`);

    expect(res.status).toBe(200);
    expect(res.body.requiresPassword).toBe(true);
  });

  it('returns 404 for a non-existent link', async () => {
    const res = await request(app).get(`${PASTES}/zzzzzzzz`);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/pastes/:id', () => {
  it('deletes paste when owner requests it', async () => {
    const { token } = await signupAndLogin();
    const created = await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'bye', name: 'Temp', exposure: 'public', expirationTime: 'never' });

    const pasteId = (created.body as { id: string }).id;
    const res = await request(app)
      .delete(`${PASTES}/${pasteId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
