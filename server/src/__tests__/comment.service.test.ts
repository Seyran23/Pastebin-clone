import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockCommentFindAll,
  mockCommentFindByPk,
  mockCommentCreate,
  mockPasteFindByPk,
  mockUserFindOne,
} = vi.hoisted(() => ({
  mockCommentFindAll: vi.fn(),
  mockCommentFindByPk: vi.fn(),
  mockCommentCreate: vi.fn(),
  mockPasteFindByPk: vi.fn(),
  mockUserFindOne: vi.fn(),
}));

vi.mock('@/db/models', () => ({
  Comment: {
    findAll: mockCommentFindAll,
    findByPk: mockCommentFindByPk,
    create: mockCommentCreate,
  },
  Paste: { findByPk: mockPasteFindByPk },
  User: { findOne: mockUserFindOne },
}));

import {
  createCommentService,
  deleteCommentService,
  getCommentsService,
} from '@/modules/paste/service/comment.service';

beforeEach(() => vi.clearAllMocks());

describe('createCommentService', () => {
  const paste = { id: 'paste-id' };
  const user = { id: 'user-id', username: 'alice', avatar: 'https://cdn.example.com/alice.jpg' };

  it('throws 404 when paste not found', async () => {
    mockPasteFindByPk.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue(user);

    await expect(createCommentService('hello', 'paste-id', 'alice')).rejects.toMatchObject({
      statusCode: 404,
      message: 'Paste not found',
    });
  });

  it('throws 404 when user not found', async () => {
    mockPasteFindByPk.mockResolvedValue(paste);
    mockUserFindOne.mockResolvedValue(null);

    await expect(createCommentService('hello', 'paste-id', 'alice')).rejects.toMatchObject({
      statusCode: 404,
      message: 'User not found',
    });
  });

  it('creates and returns shaped comment with author info', async () => {
    mockPasteFindByPk.mockResolvedValue(paste);
    mockUserFindOne.mockResolvedValue(user);
    const now = new Date();
    mockCommentCreate.mockResolvedValue({ id: 1, content: 'hello', createdAt: now });

    const result = await createCommentService('hello', 'paste-id', 'alice');

    expect(result.author).toBe('alice');
    expect(result.avatar).toBe(user.avatar);
    expect(result.content).toBe('hello');
    expect(result.id).toBe(1);
  });
});

describe('getCommentsService', () => {
  it('returns empty array when no comments exist', async () => {
    mockCommentFindAll.mockResolvedValue([]);
    const result = await getCommentsService('paste-id');
    expect(result).toEqual([]);
  });

  it('maps comment with user to expected shape', async () => {
    const now = new Date();
    mockCommentFindAll.mockResolvedValue([
      { id: 1, content: 'Nice paste!', createdAt: now, user: { username: 'bob', avatar: null } },
    ]);

    const result = await getCommentsService('paste-id');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ id: 1, content: 'Nice paste!', author: 'bob', avatar: null });
  });

  it('falls back to Anonymous when user is missing', async () => {
    mockCommentFindAll.mockResolvedValue([
      { id: 2, content: 'hello', createdAt: new Date(), user: undefined },
    ]);

    const [comment] = await getCommentsService('paste-id');
    expect(comment.author).toBe('Anonymous');
  });
});

describe('deleteCommentService', () => {
  it('throws 404 when comment not found', async () => {
    mockCommentFindByPk.mockResolvedValue(null);
    await expect(deleteCommentService('1', 'user-id')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 403 when requester is not the comment owner', async () => {
    mockCommentFindByPk.mockResolvedValue({
      id: 1,
      user_id: 'other-user-id',
      destroy: vi.fn(),
    });
    await expect(deleteCommentService('1', 'my-user-id')).rejects.toMatchObject({ statusCode: 403 });
  });

  it('deletes comment when requester is the owner', async () => {
    const mockDestroy = vi.fn().mockResolvedValue(undefined);
    mockCommentFindByPk.mockResolvedValue({ id: 1, user_id: 'user-id', destroy: mockDestroy });

    const result = await deleteCommentService('1', 'user-id');

    expect(mockDestroy).toHaveBeenCalled();
    expect(result.message).toContain('deleted');
  });
});
