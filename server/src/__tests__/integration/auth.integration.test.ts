import { beforeEach, describe, expect, it } from 'vitest';
import request from 'supertest';
import { Token, User } from '@/db/models';
import app from '@/app';

const BASE = '/api/auth';

// Unique suffix per test to avoid conflicts without truncation
let testId = 0;
const nextUser = () => {
  testId++;
  return {
    username: `authuser${testId}`,
    email: `authuser${testId}@test.com`,
    password: 'StrongPass123!',
  };
};

beforeEach(async () => {
  await Token.destroy({ where: {} });
  await User.destroy({ where: {} });
});

describe('POST /api/auth/signup', () => {
  it('creates a user and returns tokens', async () => {
    const user = nextUser();
    const res = await request(app).post(`${BASE}/signup`).send(user);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user).not.toHaveProperty('password');
  });

  it('returns 409 when username is already taken', async () => {
    const user = nextUser();
    await request(app).post(`${BASE}/signup`).send(user);
    const res = await request(app).post(`${BASE}/signup`).send(user);

    expect(res.status).toBe(409);
  });

  it('returns 4xx when required fields are missing', async () => {
    const res = await request(app).post(`${BASE}/signup`).send({ username: 'only' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('POST /api/auth/login', () => {
  it('returns tokens for valid credentials', async () => {
    const user = nextUser();
    await request(app).post(`${BASE}/signup`).send(user);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ username: user.username, password: user.password });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.username).toBe(user.username);
  });

  it('returns 4xx for wrong password', async () => {
    const user = nextUser();
    await request(app).post(`${BASE}/signup`).send(user);

    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ username: user.username, password: 'wrongpassword' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('returns 404 for non-existent username', async () => {
    const res = await request(app)
      .post(`${BASE}/login`)
      .send({ username: 'nobody_exists', password: 'whatever' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/auth/logout', () => {
  it('returns 200 and clears the session', async () => {
    const user = nextUser();
    const signup = await request(app).post(`${BASE}/signup`).send(user);
    const { refreshToken } = signup.body as { refreshToken: string };

    const res = await request(app)
      .post(`${BASE}/logout`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
  });
});
