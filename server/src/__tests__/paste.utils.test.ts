import { describe, expect, it, vi } from 'vitest';

import { buildOrder, calculateRemainingTime, parseTimeFilter } from '@/modules/paste/utils';
import { validateExpiration } from '@/modules/paste/validator';

// Mock @/db/models before importing utils (utils.ts imports sequelize from it)
vi.mock('@/db/models', () => ({
  sequelize: {
    literal: vi.fn((sql: string) => ({ val: sql })),
    fn: vi.fn(),
    col: vi.fn(),
  },
  Paste: {},
  User: {},
}));

describe('calculateRemainingTime', () => {
  it('returns null when expirationTime is null', () => {
    expect(calculateRemainingTime(null)).toBeNull();
  });

  it('returns a positive number for a future expiration', () => {
    const future = Date.now() + 60_000;
    const result = calculateRemainingTime(future);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThanOrEqual(60_000);
  });

  it('returns a negative number for a past expiration', () => {
    const past = Date.now() - 60_000;
    expect(calculateRemainingTime(past)).toBeLessThan(0);
  });
});

describe('buildOrder', () => {
  it('returns DESC createdAt order for "newest"', () => {
    const order = buildOrder('newest') as [[string, string]];
    expect(order[0][0]).toBe('createdAt');
    expect(order[0][1]).toBe('DESC');
  });

  it('returns ASC createdAt order for "oldest"', () => {
    const order = buildOrder('oldest') as [[string, string]];
    expect(order[0][0]).toBe('createdAt');
    expect(order[0][1]).toBe('ASC');
  });

  it('falls back to newest for unknown sort values', () => {
    const order = buildOrder('unknown') as [[string, string]];
    expect(order[0][0]).toBe('createdAt');
    expect(order[0][1]).toBe('DESC');
  });

  it('returns an array for "likes" sort', () => {
    const order = buildOrder('likes');
    expect(Array.isArray(order)).toBe(true);
    expect(order.length).toBeGreaterThan(0);
  });
});

describe('parseTimeFilter', () => {
  it('returns null for "all"', () => {
    expect(parseTimeFilter('all')).toBeNull();
  });

  it('returns null for unknown values', () => {
    expect(parseTimeFilter('century')).toBeNull();
  });

  it('returns a Date ~1 day ago for "day"', () => {
    const result = parseTimeFilter('day');
    expect(result).toBeInstanceOf(Date);
    const diffMs = Date.now() - result!.getTime();
    expect(diffMs).toBeGreaterThan(23 * 3600 * 1000);
    expect(diffMs).toBeLessThan(25 * 3600 * 1000);
  });

  it('returns a Date ~7 days ago for "week"', () => {
    const result = parseTimeFilter('week');
    const diffDays = (Date.now() - result!.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(6.9);
    expect(diffDays).toBeLessThan(7.1);
  });

  it('returns a Date ~30 days ago for "month"', () => {
    const result = parseTimeFilter('month');
    const diffDays = (Date.now() - result!.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBeGreaterThan(29.9);
    expect(diffDays).toBeLessThan(30.1);
  });
});

describe('validateExpiration', () => {
  it('does not throw when expiration is null', () => {
    expect(() => validateExpiration(null)).not.toThrow();
  });

  it('does not throw when expiration is in the future', () => {
    expect(() => validateExpiration(Date.now() + 60_000)).not.toThrow();
  });

  it('throws when expiration is in the past', () => {
    expect(() => validateExpiration(Date.now() - 1)).toThrow('Paste has expired');
  });
});
