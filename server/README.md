# Server

Express.js REST API for the Pastebin Clone. Handles authentication, paste management, file storage, email delivery, and analytics.

**Live API:** [https://pastebin-clone-39wa.onrender.com](https://pastebin-clone-39wa.onrender.com) · **Docs:** [/api-docs](https://pastebin-clone-39wa.onrender.com/api-docs)

## Tech Stack

- **Runtime:** Node.js 20+ / TypeScript
- **Framework:** Express.js 5
- **ORM:** Sequelize 6 + PostgreSQL
- **Cache:** Redis
- **Storage:** AWS S3 via `@aws-sdk/client-s3`
- **Auth:** JWT (access + refresh token rotation) + Passport.js Google OAuth 2.0
- **Email:** Nodemailer (SMTP)
- **Validation:** express-validator + Zod (env)
- **Logging:** Pino + pino-http
- **Docs:** Swagger UI at `/api-docs`
- **Jobs:** node-cron (expired paste cleanup)
- **Tests:** Vitest + Supertest

## Getting Started

```bash
npm install
cp .env.sample .env.local   # fill in your values
npm run migrate             # create tables
npm run seed                # seed lookup tables
npm run dev                 # starts on :8080
```

## Environment Variables

| Variable | Description |
|---|---|
| `PORT` | Server port (default `8080`) |
| `API_URL` | Full server URL e.g. `http://localhost:8080` |
| `CLIENT_URL` | Frontend URL e.g. `http://localhost:3000` |
| `DB_NAME` | PostgreSQL database name |
| `DB_USERNAME` | PostgreSQL username |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host |
| `DB_PORT` | PostgreSQL port |
| `JWT_ACCESS_TOKEN` | Secret for access tokens |
| `JWT_REFRESH_TOKEN` | Secret for refresh tokens |
| `JWT_RESET_TOKEN` | Secret for password-reset tokens |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | e.g. `1h` |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | e.g. `7d` |
| `S3_BUCKET_NAME` | AWS S3 bucket name |
| `S3_BUCKET_REGION` | AWS region e.g. `us-east-1` |
| `S3_ACCESS_KEY` | AWS access key ID |
| `S3_SECRET_ACCESS_KEY` | AWS secret access key |
| `REDIS_URL` | Redis connection URL e.g. `redis://localhost:6379` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL |
| `SMTP_HOST` | SMTP server host |
| `SMTP_PORT` | SMTP port (default `465`) |
| `SMTP_USER` | SMTP username |
| `SMTP_PASSWORD` | SMTP password |

All variables are validated at boot with Zod — the server fails fast with a clear list of missing values.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Run compiled build |
| `npm run migrate` | Run Sequelize migrations |
| `npm run migrate:undo` | Undo last migration |
| `npm run seed` | Seed lookup tables via sequelize-cli |
| `npm run seed:ts` | Seed users, pastes, comments, likes via HTTP API (server must be running) |
| `npm run test` | Run unit tests |
| `npm run test:integration` | Run integration tests (requires test DB on port 5433) |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Architecture

```
src/
├── app.ts                  Express app setup (middleware, routes)
├── index.ts                Server entry point (listen, graceful shutdown)
├── config/                 Swagger, timing constants
├── db/
│   ├── migrations/         Sequelize migration files
│   ├── models/             Sequelize model definitions + associations
│   ├── seeders/            Lookup table seeders (sequelize-cli)
│   └── seed.ts             HTTP-based seed script (users, pastes, comments)
├── middlewares/            Error handler, multer, rate limiter, validation
├── modules/
│   ├── auth/               Signup, login, logout, OAuth, token refresh, activation
│   ├── paste/              CRUD, search, archive, likes, comments, expiry
│   ├── user/               Profile, avatar, password, stats, dashboard
│   ├── mail/               Email templates and delivery
│   ├── cloud/              S3 upload / download / delete
│   └── health/             Health check endpoint
├── services/
│   ├── token.service.ts    JWT sign/verify, token persistence
│   ├── expiredPastes.service.ts  Cron jobs for cleanup
│   └── hashing.service.ts  Link hash generation
└── utils/                  Env, auth helper, avatar, password hashing
```

## API Modules

### Auth — `/api/auth`

| Method | Path | Description |
|---|---|---|
| `POST` | `/signup` | Register with username, email, password |
| `POST` | `/login` | Login, returns access + refresh tokens |
| `POST` | `/logout` | Invalidate refresh token |
| `POST` | `/refresh` | Rotate access/refresh token pair |
| `GET` | `/google` | Initiate Google OAuth flow |
| `GET` | `/google/callback` | Google OAuth callback |
| `GET` | `/activate/:link` | Activate account via email link |
| `POST` | `/resend-activation` | Resend activation email |
| `POST` | `/forgot-password` | Send password reset email |
| `POST` | `/reset-password` | Set new password via reset token |
| `POST` | `/forgot-username` | Send username reminder email |

### Pastes — `/api/pastes`

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/create` | Required | Create a paste, uploads content to S3 |
| `GET` | `/:link` | Optional | Get paste by link endpoint |
| `PATCH` | `/:link` | Required (owner) | Edit title, exposure, password |
| `DELETE` | `/:id` | Required (owner) | Delete paste + S3 file |
| `POST` | `/unlock-paste` | — | Unlock password-protected paste |
| `GET` | `/archive` | — | Public archive with cursor pagination |
| `GET` | `/search` | Required | Full-text search with filters |
| `GET` | `/search-self` | Required | Search own pastes |
| `GET` | `/summary` | Optional | Recent paste summaries for sidebar |
| `GET` | `/categories` | — | List paste categories |
| `GET` | `/syntax-highlights` | — | List syntax highlight options |
| `GET` | `/expiration-time` | — | List expiration time options |
| `POST` | `/comment/:id` | Required | Add comment to a paste |
| `DELETE` | `/comment/:id` | Required (author) | Delete own comment |
| `GET` | `/comments/:id` | — | Get comments for a paste |
| `GET` | `/user-comments/:username` | — | Get all comments by a user |
| `POST` | `/like/:id` | Required | Toggle like/dislike |
| `GET` | `/like-stats/:id` | Optional | Get like counts for a paste |

### Users — `/api/users`

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/profile/:username` | — | Get public profile |
| `GET` | `/profile/:username/pastes` | Optional | Get user's pastes |
| `PATCH` | `/edit/profile-details` | Required | Update email, location |
| `PATCH` | `/edit/profile-avatar` | Required | Upload new avatar to S3 |
| `PATCH` | `/change-password` | Required | Change password |
| `GET` | `/stats/:username` | Required (owner) | Paste count stats |
| `GET` | `/dashboard/:username` | Required (owner) | Full analytics dashboard |
| `DELETE` | `/:username` | Required (owner) | Delete account + all data |

## Security

- **Helmet** — HTTP security headers on all responses
- **Rate limiting** — signup (5/h), login (10/15min), forgot-password (5/h)
- **bcrypt** — password hashing with cost factor 12
- **JWT rotation** — refresh tokens are single-use; rotated on every refresh
- **Input validation** — all bodies validated with express-validator before controllers run
- **Email enumeration protection** — forgot-password/forgot-username always return 200 regardless of account existence
- **S3 orphan protection** — DB failure after S3 upload triggers automatic S3 file cleanup
- **Owner checks** — paste edit/delete, comment delete, stats, and dashboard verify ownership

## Cron Jobs

Two jobs run daily to delete expired pastes and their S3 files:

```
0 0 * * *   midnight sweep
0 6 * * *   6am sweep
```

## Testing

```bash
# Unit tests — no DB or external services required
npm run test

# Integration tests — requires PostgreSQL on port 5433, database: pastebin_test
npm run test:integration
```

Integration tests drop and recreate the schema before each run, mock S3 and email, and run test files sequentially to avoid FK constraint races.

## API Docs

Swagger UI is available at `http://localhost:8080/api-docs` when the server is running.
