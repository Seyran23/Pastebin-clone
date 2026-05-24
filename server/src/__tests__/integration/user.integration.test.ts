import request from 'supertest';
import { describe, expect, it } from 'vitest';

import app from '@/app';

const AUTH = '/api/auth';
const USERS = '/api/users';
const PASTES = '/api/pastes';

let testId = 0;
const nextUser = () => {
  testId++;
  return {
    username: `usertest${testId}`,
    email: `usertest${testId}@test.com`,
    password: 'StrongPass123!',
  };
};

async function signupAndLogin(): Promise<{ token: string; username: string; userId: string }> {
  const user = nextUser();
  const signup = await request(app).post(`${AUTH}/signup`).send(user);
  const res = await request(app)
    .post(`${AUTH}/login`)
    .send({ username: user.username, password: user.password });
  return {
    token: (res.body as { accessToken: string }).accessToken,
    username: user.username,
    userId: (signup.body as { user: { id: string } }).user.id,
  };
}

describe('GET /api/users/profile/:username', () => {
  it('returns public profile for an existing user', async () => {
    const { username } = await signupAndLogin();
    const res = await request(app).get(`${USERS}/profile/${username}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(username);
    expect(res.body).not.toHaveProperty('password');
  });

  it('returns 404 for a non-existent username', async () => {
    const res = await request(app).get(`${USERS}/profile/nobody_exists_xyz`);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/users/stats/:username', () => {
  it('returns stats for the authenticated owner', async () => {
    const { token, username } = await signupAndLogin();
    const res = await request(app)
      .get(`${USERS}/stats/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('totalActivePastes');
    expect(res.body).toHaveProperty('publicPastes');
    expect(res.body).toHaveProperty('totalLikes');
  });

  it('returns 403 when a different user requests stats', async () => {
    const { username } = await signupAndLogin();
    const { token: otherToken } = await signupAndLogin();

    const res = await request(app)
      .get(`${USERS}/stats/${username}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 401 when unauthenticated', async () => {
    const { username } = await signupAndLogin();
    const res = await request(app).get(`${USERS}/stats/${username}`);
    expect(res.status).toBe(401);
  });
});

describe('GET /api/users/dashboard/:username', () => {
  it('returns dashboard data for the authenticated owner', async () => {
    const { token, username } = await signupAndLogin();
    const res = await request(app)
      .get(`${USERS}/dashboard/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('summary');
    expect(res.body.summary).toHaveProperty('totalPastes');
    expect(res.body.summary).toHaveProperty('totalViews');
    expect(res.body.summary).toHaveProperty('totalLikes');
    expect(res.body.summary).toHaveProperty('totalComments');
    expect(res.body).toHaveProperty('pastesByMonth');
    expect(res.body).toHaveProperty('topPastes');
    expect(Array.isArray(res.body.topPastes)).toBe(true);
  });

  it('returns 403 when a different user requests the dashboard', async () => {
    const { username } = await signupAndLogin();
    const { token: otherToken } = await signupAndLogin();

    const res = await request(app)
      .get(`${USERS}/dashboard/${username}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('reflects newly created pastes in totalPastes', async () => {
    const { token, username } = await signupAndLogin();

    await request(app)
      .post(`${PASTES}/create`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: 'dashboard test paste', name: 'Dash Paste', exposure: 'public', expirationTime: 'never' });

    const res = await request(app)
      .get(`${USERS}/dashboard/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.summary.totalPastes).toBeGreaterThanOrEqual(1);
  });
});

describe('PATCH /api/users/change-password', () => {
  it('changes password successfully with correct current password', async () => {
    const { token } = await signupAndLogin();
    const res = await request(app)
      .patch(`${USERS}/change-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'StrongPass123!', newPassword: 'NewStrongPass456!' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('returns 4xx with wrong current password', async () => {
    const { token } = await signupAndLogin();
    const res = await request(app)
      .patch(`${USERS}/change-password`)
      .set('Authorization', `Bearer ${token}`)
      .send({ currentPassword: 'wrongpassword', newPassword: 'NewStrongPass456!' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app)
      .patch(`${USERS}/change-password`)
      .send({ currentPassword: 'StrongPass123!', newPassword: 'NewStrongPass456!' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:username', () => {
  it('deletes own account successfully', async () => {
    const { token, username } = await signupAndLogin();
    const res = await request(app)
      .delete(`${USERS}/${username}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('returns 403 when trying to delete another user\'s account', async () => {
    const { username } = await signupAndLogin();
    const { token: otherToken } = await signupAndLogin();

    const res = await request(app)
      .delete(`${USERS}/${username}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(res.status).toBe(403);
  });

  it('returns 401 without auth', async () => {
    const { username } = await signupAndLogin();
    const res = await request(app).delete(`${USERS}/${username}`);
    expect(res.status).toBe(401);
  });
});
