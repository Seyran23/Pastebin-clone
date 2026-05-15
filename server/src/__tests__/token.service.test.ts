import { describe, it, expect, vi } from 'vitest';

// Mock DB models — token.service imports Token model
vi.mock('@/db/models', () => ({
  Token: {
    findOne: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
}));

import {
  generateTokens,
  validateAccessToken,
  validateRefreshToken,
  resetPasswordToken,
  validateResetToken,
} from '@/services/token.service';

const mockPayload = {
  id: 'user-uuid-123',
  username: 'testuser',
  email: 'test@example.com',
  role: 'user',
  isActivated: true,
  avatar: null,
  location: null,
  createdAt: new Date().toISOString(),
};

describe('generateTokens', () => {
  it('returns accessToken and refreshToken', () => {
    const { accessToken, refreshToken } = generateTokens(mockPayload);
    expect(typeof accessToken).toBe('string');
    expect(typeof refreshToken).toBe('string');
    expect(accessToken.split('.').length).toBe(3); // JWT has 3 parts
    expect(refreshToken.split('.').length).toBe(3);
  });

  it('tokens are different from each other', () => {
    const { accessToken, refreshToken } = generateTokens(mockPayload);
    expect(accessToken).not.toBe(refreshToken);
  });
});

describe('validateAccessToken', () => {
  it('returns the payload for a valid token', () => {
    const { accessToken } = generateTokens(mockPayload);
    const result = validateAccessToken(accessToken);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(mockPayload.id);
    expect(result?.username).toBe(mockPayload.username);
  });

  it('returns null for a tampered token', () => {
    const result = validateAccessToken('invalid.token.here');
    expect(result).toBeNull();
  });

  it('returns null for a refresh token verified as access token', () => {
    const { refreshToken } = generateTokens(mockPayload);
    // refresh token is signed with a different secret
    const result = validateAccessToken(refreshToken);
    expect(result).toBeNull();
  });
});

describe('validateRefreshToken', () => {
  it('returns the payload for a valid refresh token', () => {
    const { refreshToken } = generateTokens(mockPayload);
    const result = validateRefreshToken(refreshToken);
    expect(result).not.toBeNull();
    expect(result?.id).toBe(mockPayload.id);
  });

  it('returns null for a tampered token', () => {
    expect(validateRefreshToken('bad.token')).toBeNull();
  });

  it('returns null for an access token verified as refresh token', () => {
    const { accessToken } = generateTokens(mockPayload);
    expect(validateRefreshToken(accessToken)).toBeNull();
  });
});

describe('resetPasswordToken + validateResetToken', () => {
  const resetPayload = { id: 'user-uuid-123', email: 'test@example.com' };

  it('round-trips: generate then validate returns same payload', () => {
    const token = resetPasswordToken(resetPayload);
    const result = validateResetToken(token);
    expect(result?.id).toBe(resetPayload.id);
    expect(result?.email).toBe(resetPayload.email);
  });

  it('validateResetToken returns null for garbage input', () => {
    expect(validateResetToken('not-a-token')).toBeNull();
  });
});
