import { describe, expect, it } from 'vitest';
import request from 'supertest';
import app from '@/app';

const AUTH = '/api/auth';
const PASTES = '/api/pastes';

let testId = 0;
const nextUser = () => {
  testId++;
  return {
    username: `pasteext${testId}`,
    email: `pasteext${testId}@test.com`,
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

async function createPublicPaste(token: string, name = 'Test Paste') {
  const res = await request(app)
    .post(`${PASTES}/create`)
    .set('Authorization', `Bearer ${token}`)
    .send({ content: 'console.log("hello")', name, exposure: 'public', expirationTime: 'never' });
  return res.body as { id: string; linkEndpoint: string };
}

describe('PATCH /api/pastes/:link', () => {
  it('allows the owner to update paste name and exposure', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token, 'Original Name');
    const link = paste.linkEndpoint;

    const res = await request(app)
      .patch(`${PASTES}/${link}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Updated Name', exposure: 'unlisted' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');
    expect(res.body.paste.name).toBe('Updated Name');
  });

  it('returns 403 when a non-owner tries to edit', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: otherToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);
    const link = paste.linkEndpoint;

    const res = await request(app)
      .patch(`${PASTES}/${link}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ name: 'Hacked' });

    expect(res.status).toBe(403);
  });

  it('returns 401 without auth', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);
    const link = paste.linkEndpoint;

    const res = await request(app)
      .patch(`${PASTES}/${link}`)
      .send({ name: 'No auth' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/pastes/archive', () => {
  it('returns paginated list of public pastes', async () => {
    const { token } = await signupAndLogin();
    await createPublicPaste(token, 'Archive Paste');

    const res = await request(app).get(`${PASTES}/archive`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('pagination');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toHaveProperty('hasNextPage');
  });

  it('accepts cursor and limit query params', async () => {
    const res = await request(app).get(`${PASTES}/archive?limit=5`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe('GET /api/pastes/search', () => {
  it('returns search results for authenticated user', async () => {
    const { token } = await signupAndLogin();
    await createPublicPaste(token, 'Searchable Paste Content');

    const res = await request(app)
      .get(`${PASTES}/search?searchTerm=Searchable`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get(`${PASTES}/search?searchTerm=hello`);
    expect(res.status).toBe(401);
  });

  it('returns empty results for a term with no matches', async () => {
    const { token } = await signupAndLogin();
    const res = await request(app)
      .get(`${PASTES}/search?searchTerm=zzznomatchxyz999`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('POST /api/pastes/like/:id', () => {
  it('likes a paste and returns updated stats', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: likerToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);

    const res = await request(app)
      .post(`${PASTES}/like/${paste.id}`)
      .set('Authorization', `Bearer ${likerToken}`)
      .send({ isLike: true });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likedStatus');
    expect(typeof res.body.likedStatus).toBe('boolean');
  });

  it('returns 401 without auth', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);

    const res = await request(app)
      .post(`${PASTES}/like/${paste.id}`)
      .send({ isLike: true });

    expect(res.status).toBe(401);
  });

  it('returns 4xx for an invalid UUID', async () => {
    const { token } = await signupAndLogin();
    const res = await request(app)
      .post(`${PASTES}/like/not-a-valid-uuid`)
      .set('Authorization', `Bearer ${token}`)
      .send({ isLike: true });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('GET /api/pastes/like-stats/:id', () => {
  it('returns like counts for a paste', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);

    const res = await request(app).get(`${PASTES}/like-stats/${paste.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('likes');
    expect(res.body).toHaveProperty('dislikes');
    expect(res.body).toHaveProperty('userVote');
  });
});

describe('POST /api/pastes/comment/:id', () => {
  it('creates a comment on a paste', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: commenterToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);

    const res = await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .send({ content: 'Great paste!' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('content');
    expect(res.body.content).toBe('Great paste!');
  });

  it('returns 401 without auth', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);

    const res = await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .send({ content: 'Should fail' });

    expect(res.status).toBe(401);
  });

  it('returns 4xx when content is empty', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);

    const res = await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '' });

    expect(res.status).toBeGreaterThanOrEqual(400);
    expect(res.status).toBeLessThan(500);
  });
});

describe('GET /api/pastes/comments/:id', () => {
  it('returns comments array for a paste', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: commenterToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);

    await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .send({ content: 'A comment for retrieval' });

    const res = await request(app).get(`${PASTES}/comments/${paste.id}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
    expect(res.body[0]).toHaveProperty('content');
  });

  it('returns empty array for a paste with no comments', async () => {
    const { token } = await signupAndLogin();
    const paste = await createPublicPaste(token);

    const res = await request(app).get(`${PASTES}/comments/${paste.id}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });
});

describe('DELETE /api/pastes/comment/:id', () => {
  it('allows the comment author to delete their comment', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: commenterToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);

    const commentRes = await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .send({ content: 'To be deleted' });

    const commentId = (commentRes.body as { id: string }).id;

    const deleteRes = await request(app)
      .delete(`${PASTES}/comment/${commentId}`)
      .set('Authorization', `Bearer ${commenterToken}`);

    expect(deleteRes.status).toBe(200);
  });

  it('returns 403 when a different user tries to delete the comment', async () => {
    const { token: ownerToken } = await signupAndLogin();
    const { token: commenterToken } = await signupAndLogin();
    const { token: otherToken } = await signupAndLogin();
    const paste = await createPublicPaste(ownerToken);

    const commentRes = await request(app)
      .post(`${PASTES}/comment/${paste.id}`)
      .set('Authorization', `Bearer ${commenterToken}`)
      .send({ content: 'Protected comment' });

    const commentId = (commentRes.body as { id: string }).id;

    const deleteRes = await request(app)
      .delete(`${PASTES}/comment/${commentId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(deleteRes.status).toBe(403);
  });
});
