import { describe, it, expect, vi, beforeEach } from 'vitest';

const {
  mockLikeStatsCount,
  mockLikeStatsFindOne,
  mockLikeStatsCreate,
  mockPasteFindByPk,
  mockUserFindOne,
  mockExistingUpdate,
} = vi.hoisted(() => ({
  mockLikeStatsCount: vi.fn(),
  mockLikeStatsFindOne: vi.fn(),
  mockLikeStatsCreate: vi.fn(),
  mockPasteFindByPk: vi.fn(),
  mockUserFindOne: vi.fn(),
  mockExistingUpdate: vi.fn(),
}));

vi.mock('@/db/models', () => ({
  LikeStats: {
    count: mockLikeStatsCount,
    findOne: mockLikeStatsFindOne,
    create: mockLikeStatsCreate,
  },
  Paste: { findByPk: mockPasteFindByPk },
  User: { findOne: mockUserFindOne },
}));

import { getLikeStatsService, toggleLikeService } from '@/modules/paste/service/like.service';

beforeEach(() => vi.clearAllMocks());

describe('getLikeStatsService', () => {
  it('returns likes, dislikes and null userVote when no userId', async () => {
    mockLikeStatsCount.mockResolvedValueOnce(5).mockResolvedValueOnce(2);

    const result = await getLikeStatsService('paste-id');

    expect(result.likes).toBe(5);
    expect(result.dislikes).toBe(2);
    expect(result.userVote).toBeNull();
    expect(mockLikeStatsCount).toHaveBeenCalledTimes(2);
  });

  it('returns userVote true when user has liked', async () => {
    mockLikeStatsCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    mockLikeStatsFindOne.mockResolvedValueOnce({ is_liked: true });

    const result = await getLikeStatsService('paste-id', 'user-id');

    expect(result.userVote).toBe(true);
  });

  it('returns userVote false when user has disliked', async () => {
    mockLikeStatsCount.mockResolvedValueOnce(3).mockResolvedValueOnce(1);
    mockLikeStatsFindOne.mockResolvedValueOnce({ is_liked: false });

    const result = await getLikeStatsService('paste-id', 'user-id');

    expect(result.userVote).toBe(false);
  });

  it('returns userVote null when user has not voted', async () => {
    mockLikeStatsCount.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    mockLikeStatsFindOne.mockResolvedValueOnce(null);

    const result = await getLikeStatsService('paste-id', 'user-id');

    expect(result.userVote).toBeNull();
  });
});

describe('toggleLikeService', () => {
  const paste = { id: 'paste-id' };
  const user = { id: 'user-id', username: 'testuser' };

  it('throws 404 when paste not found', async () => {
    mockPasteFindByPk.mockResolvedValue(null);
    mockUserFindOne.mockResolvedValue(user);

    await expect(toggleLikeService('testuser', 'paste-id', true)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('throws 404 when user not found', async () => {
    mockPasteFindByPk.mockResolvedValue(paste);
    mockUserFindOne.mockResolvedValue(null);

    await expect(toggleLikeService('testuser', 'paste-id', true)).rejects.toMatchObject({ statusCode: 404 });
  });

  it('creates a new like record when none exists', async () => {
    mockPasteFindByPk.mockResolvedValue(paste);
    mockUserFindOne.mockResolvedValue(user);
    mockLikeStatsFindOne.mockResolvedValue(null);
    mockLikeStatsCreate.mockResolvedValue({});

    const result = await toggleLikeService('testuser', 'paste-id', true);

    expect(mockLikeStatsCreate).toHaveBeenCalledWith({
      user_id: user.id,
      paste_id: paste.id,
      is_liked: true,
    });
    expect(result.likedStatus).toBe(true);
  });

  it('updates an existing record when one exists', async () => {
    mockPasteFindByPk.mockResolvedValue(paste);
    mockUserFindOne.mockResolvedValue(user);
    mockLikeStatsFindOne.mockResolvedValue({ update: mockExistingUpdate });

    await toggleLikeService('testuser', 'paste-id', false);

    expect(mockExistingUpdate).toHaveBeenCalledWith({ is_liked: false });
    expect(mockLikeStatsCreate).not.toHaveBeenCalled();
  });
});
