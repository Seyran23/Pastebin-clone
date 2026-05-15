import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockUserFindOne, mockSendForgotPasswordEmail, mockSendForgotUsernameEmail } = vi.hoisted(
  () => ({
    mockUserFindOne: vi.fn(),
    mockSendForgotPasswordEmail: vi.fn(),
    mockSendForgotUsernameEmail: vi.fn(),
  }),
);

vi.mock('@/db/models', () => ({
  User: { findOne: mockUserFindOne },
  Token: { findOne: vi.fn(), create: vi.fn() },
}));

vi.mock('@/modules/mail/controller', () => ({
  sendForgotPasswordEmail: mockSendForgotPasswordEmail,
  sendForgotUsernameEmail: mockSendForgotUsernameEmail,
  resendActivationEmail: vi.fn(),
  sendRegistrationEmail: vi.fn(),
  sendEmailAddressChangeEmail: vi.fn(),
}));

vi.mock('@/services/token.service', () => ({
  generateTokens: vi.fn(() => ({ accessToken: 'mock-access', refreshToken: 'mock-refresh' })),
  saveToken: vi.fn(),
  removeToken: vi.fn(),
  validateRefreshToken: vi.fn(),
  findToken: vi.fn(),
  resetPasswordToken: vi.fn(() => 'mock-reset-token'),
  validateResetToken: vi.fn(),
}));

vi.mock('@/modules/user/dto', () => ({
  UserDto: vi.fn().mockImplementation((user: Record<string, unknown>) => user),
}));

import { forgotPasswordService, forgotUsernameService } from '@/modules/auth/service';

const GENERIC_RESPONSE = 'If an account with that information exists, we have sent you an email.';

beforeEach(() => vi.clearAllMocks());

describe('forgotPasswordService', () => {
  it('returns generic message when user does not exist (prevents email enumeration)', async () => {
    mockUserFindOne.mockResolvedValue(null);

    const result = await forgotPasswordService('nonexistent');

    expect(result.message).toBe(GENERIC_RESPONSE);
    expect(mockSendForgotPasswordEmail).not.toHaveBeenCalled();
  });

  it('sends email and returns generic message when user exists', async () => {
    mockUserFindOne.mockResolvedValue({ id: 'user-id', email: 'alice@example.com', username: 'alice' });
    mockSendForgotPasswordEmail.mockResolvedValue(undefined);

    const result = await forgotPasswordService('alice');

    expect(result.message).toBe(GENERIC_RESPONSE);
    expect(mockSendForgotPasswordEmail).toHaveBeenCalledOnce();
  });

  it('response is identical whether user exists or not', async () => {
    mockUserFindOne.mockResolvedValue(null);
    const missing = await forgotPasswordService('nobody');

    mockUserFindOne.mockResolvedValue({ id: 'x', email: 'a@b.com', username: 'alice' });
    mockSendForgotPasswordEmail.mockResolvedValue(undefined);
    const found = await forgotPasswordService('alice');

    expect(missing.message).toBe(found.message);
  });
});

describe('forgotUsernameService', () => {
  it('returns generic message when email does not match any user', async () => {
    mockUserFindOne.mockResolvedValue(null);

    const result = await forgotUsernameService('nobody@example.com');

    expect(result.message).toBe(GENERIC_RESPONSE);
    expect(mockSendForgotUsernameEmail).not.toHaveBeenCalled();
  });

  it('sends email and returns generic message when email matches a user', async () => {
    mockUserFindOne.mockResolvedValue({ id: 'user-id', email: 'alice@example.com', username: 'alice' });
    mockSendForgotUsernameEmail.mockResolvedValue(undefined);

    const result = await forgotUsernameService('alice@example.com');

    expect(result.message).toBe(GENERIC_RESPONSE);
    expect(mockSendForgotUsernameEmail).toHaveBeenCalledWith('alice@example.com', 'alice');
  });
});
