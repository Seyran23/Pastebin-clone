import { beforeAll,vi } from 'vitest';

// ── Env vars ─────────────────────────────────────────────────────────────────
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.API_URL = 'http://localhost:8081';
process.env.CLIENT_URL = 'http://localhost:3000';
process.env.DB_NAME = 'pastebin_test';
process.env.DB_USERNAME = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '5432';
process.env.JWT_ACCESS_TOKEN = 'integration_access_secret_for_tests!';
process.env.JWT_REFRESH_TOKEN = 'integration_refresh_secret_for_tests!';
process.env.JWT_RESET_TOKEN = 'integration_reset_secret_for_tests!!';
process.env.S3_BUCKET_NAME = 'test-bucket';
process.env.S3_BUCKET_REGION = 'us-east-1';
process.env.S3_ACCESS_KEY = 'test-key';
process.env.S3_SECRET_ACCESS_KEY = 'test-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.GOOGLE_CLIENT_ID = 'test-google-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-google-secret';
process.env.GOOGLE_CALLBACK_URL = 'http://localhost:8081/api/auth/google/callback';
process.env.SMTP_HOST = 'smtp.test.com';
process.env.SMTP_PORT = '465';
process.env.SMTP_USER = 'test@test.com';
process.env.SMTP_PASSWORD = 'test-password';

// ── Mock external services ────────────────────────────────────────────────────
vi.mock('@/modules/cloud/service', () => ({
  uploadFileToS3: vi.fn().mockResolvedValue(undefined),
  getFileFromS3: vi.fn().mockResolvedValue({
    isImage: false,
    contentType: 'text/plain',
    textContent: 'console.log("hello world")',
    buffer: Buffer.from('console.log("hello world")'),
  }),
  deleteFileFromS3: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/modules/mail/controller', () => ({
  sendRegistrationEmail: vi.fn().mockResolvedValue(undefined),
  sendForgotPasswordEmail: vi.fn().mockResolvedValue(undefined),
  sendForgotUsernameEmail: vi.fn().mockResolvedValue(undefined),
  resendActivationEmail: vi.fn().mockResolvedValue(undefined),
  sendEmailAddressChangeEmail: vi.fn().mockResolvedValue(undefined),
}));

// ── Per-file DB sync (tables only — schema already clean from globalSetup) ───
// Dynamic import ensures env vars above are set before models (and env.ts) load.
beforeAll(async () => {
  const { sequelize } = await import('../../db/models/index.js');

  const [rows] = await sequelize.query(
    "SELECT COUNT(*) AS count FROM information_schema.tables WHERE table_schema = 'public'",
  );
  const tableCount = Number((rows[0] as { count: string }).count);

  if (tableCount === 0) {
    await sequelize.sync({ force: true });
  } else {
    await sequelize.query(
      'TRUNCATE TABLE users, tokens, pastes, like_stats, comments, syntax_highlights, paste_categories, expiration_times RESTART IDENTITY CASCADE',
    );
  }
});
