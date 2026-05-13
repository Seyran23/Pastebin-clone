# Pastebin Clone — Server

REST API for the Pastebin Clone application. Built with Express.js, TypeScript, PostgreSQL, Redis, and AWS S3.

Interactive API docs available at `http://localhost:8080/api-docs` when running locally.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Database Schema](#database-schema)
- [Auth Flow](#auth-flow)
- [Paste Lifecycle](#paste-lifecycle)
- [Security](#security)
- [Performance Decisions](#performance-decisions)
- [API Reference](#api-reference)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Scripts](#scripts)

---

## Tech Stack

| Technology | Role | Why |
|---|---|---|
| **Express.js v5** | HTTP framework | Minimal, well-understood. v5 has built-in async error handling — no need to wrap every route handler in try/catch |
| **TypeScript 6** | Type safety | Catches bugs at compile time. `node16` module resolution aligns with Node's native ESM/CJS handling |
| **PostgreSQL** | Primary database | Relational data model fits pastes/users/comments naturally. `ILIKE` for case-insensitive content search without extra tooling |
| **Sequelize v6** | ORM | Model-per-file with `declare` syntax keeps type safety tight. `sync({ alter: true })` handles migrations in dev |
| **AWS S3** | File storage | Paste content can be arbitrarily large — keeping it out of the DB avoids bloating rows and lets S3 handle delivery. Avatars stored alongside content, differentiated by content-type |
| **Redis** | Caching | Static lookup data (categories, syntax highlights, expiration times) cached with no TTL — they never change without a deploy. Short-link uniqueness checked via Redis before DB insert |
| **Pino** | Logging | Fastest Node.js logger. JSON output in production ships cleanly to any log aggregator. `pino-http` logs every request/response automatically |
| **Passport.js** | OAuth | Strategy pattern makes adding more OAuth providers (GitHub, etc.) a single file |
| **JWT** | Auth tokens | Stateless access tokens (1h), DB-backed refresh tokens (7d). Refresh tokens stored in DB so they can be invalidated on logout |
| **bcrypt** | Password hashing | Industry standard. All comparisons use the async variant to avoid blocking the event loop |
| **swagger-jsdoc + swagger-ui-express** | API docs | JSDoc comments colocated with routes — docs stay in sync with code |
| **Helmet** | Security headers | Sets Content-Security-Policy, X-Frame-Options, X-Content-Type-Options, and others in one line |
| **express-rate-limit** | Brute-force protection | Per-IP limits on login, signup, and forgot-password endpoints |

---

## Architecture

```
src/
├── config/
│   └── swagger.ts           ← OpenAPI spec definition
│
├── db/
│   └── models/              ← One Sequelize model per table
│       ├── user.ts
│       ├── paste.ts
│       ├── comment.ts
│       ├── token.ts
│       ├── likestats.ts
│       ├── pastecategory.ts
│       ├── syntaxhighlights.ts
│       └── expirationtime.ts
│
├── middlewares/
│   ├── auth.middleware.ts    ← JWT verification, optional auth
│   ├── error-handler.ts     ← Centralized AppError class + handler
│   ├── rate-limit.ts        ← Per-endpoint rate limiters
│   ├── multer.middleware.ts  ← S3 avatar upload via multer-s3
│   └── validation-error.ts  ← express-validator error formatter
│
├── modules/                 ← Feature modules (route → controller → service)
│   ├── auth/
│   ├── paste/
│   ├── user/
│   ├── mail/
│   ├── cloud/               ← S3 operations
│   └── health/
│
├── services/                ← Shared cross-module services
│   ├── token.service.ts     ← JWT generation, DB token management
│   └── expiredPastes.service.ts ← Cron jobs for expiration
│
├── types/
│   └── express.d.ts         ← Extends Express.User with AuthUser shape
│
└── utils/
    ├── env.ts               ← Typed env var access (throws on missing)
    ├── logger.ts            ← Pino instance
    ├── redis.ts             ← Redis client
    └── getAuthUser.ts       ← Throws 401 if req.user is missing
```

### Request flow

```
Request
  → Helmet (security headers)
  → pino-http (request logging)
  → express.json / cookieParser / CORS
  → Rate limiter (auth routes only)
  → authMiddleware (JWT verify → req.user)
  → express-validator (input validation)
  → Controller (extract from req, call service)
  → Service (business logic, DB, S3, Redis)
  → Response
  → errorHandler (catches AppError and unknown errors)
```

---

## Database Schema

```
users
  id            UUID PK
  username      STRING UNIQUE
  email         STRING UNIQUE
  password      STRING NULL        ← null for OAuth-only accounts
  googleId      STRING UNIQUE NULL ← null for password accounts
  role          ENUM(user, admin)
  isActivated   BOOLEAN
  activationLink STRING NULL
  avatar        STRING NULL        ← S3 key
  location      STRING NULL

pastes
  id              UUID PK
  createdBy       UUID FK → users.id (CASCADE DELETE)
  name            STRING             ← title
  link_endpoint   STRING             ← short URL slug
  cloud_name      STRING             ← S3 key
  exposure        ENUM(public, private, unlisted)
  password        STRING NULL        ← bcrypt hash
  preview         STRING(300) NULL   ← first 300 chars for search
  size            INTEGER            ← bytes
  view_count      INTEGER DEFAULT 0
  expiration_time BIGINT NULL        ← Unix ms timestamp
  expired         BOOLEAN DEFAULT false
  syntax_highlight_id INTEGER FK → syntax_highlights.id
  category_id     INTEGER FK → paste_categories.id

comments
  id        INTEGER PK
  content   TEXT
  paste_id  UUID FK → pastes.id
  user_id   UUID FK → users.id

tokens
  id           INTEGER PK
  user_id      UUID FK → users.id   ← one row per user (last device wins)
  refreshToken STRING

like_stats
  id       INTEGER PK
  paste_id UUID FK → pastes.id (CASCADE DELETE)
  user_id  UUID FK → users.id (CASCADE DELETE)
  is_liked BOOLEAN                  ← true = like, false = dislike
  UNIQUE(paste_id, user_id)

paste_categories  — static lookup
syntax_highlights — static lookup
expiration_times  — static lookup
```

---

## Auth Flow

### Signup
```
POST /api/auth/signup
  → validate (username unique, email unique, 6-20 char password)
  → bcrypt hash password (async)
  → generate UUID activationLink
  → create user (isActivated: false)
  → send verification email → CLIENT_URL/verify-email?activationLink=<uuid>
  → generate JWT pair (access: 1h, refresh: 7d)
  → save refresh token to DB
  → return { accessToken, refreshToken, user }
```

### Email verification
```
GET /api/auth/verify-email/:activationLink  (requires auth)
  → find user by activationLink
  → verify requestingUser.id === user.id (prevents activating someone else's account)
  → set isActivated=true, activationLink=null
  → return new token pair
```

### Login
```
POST /api/auth/login
  → find user by username
  → guard: if password is null → OAuth-only account, reject with clear message
  → bcrypt.compare (async)
  → generate token pair, save refresh token
  → return { accessToken, refreshToken, user }
```

### Password reset
```
POST /api/auth/forgot-password
  → find user by username
  → generate short-lived JWT (10 min) signed with JWT_RESET_TOKEN secret
  → send email → CLIENT_URL/resetpassword?token=<jwt>

POST /api/auth/reset-password
  → verify JWT against JWT_RESET_TOKEN secret
  → find user by id from token payload
  → bcrypt hash new password
  → update user
```

### Google OAuth
```
GET /api/auth/google
  → Passport redirects to Google consent screen

GET /api/auth/google/callback
  → Passport verifies, extracts profile
  → findOrCreateGoogleUser:
      if user exists by googleId → log in
      if user exists by email → link googleId to existing account
      if new → create user (password: null, isActivated: true)
  → generate token pair
  → redirect → CLIENT_URL/oauth/callback?accessToken=...&refreshToken=...
```

### Token refresh
```
GET /api/auth/refresh  (body: { refreshToken })
  → validate JWT signature
  → verify token exists in DB (allows server-side invalidation)
  → fetch fresh user from DB (picks up role/isActivated changes)
  → issue new token pair
```

---

## Paste Lifecycle

### Create
```
POST /api/pastes/create  (auth required)
  → validate content, name, exposure
  → upload content to S3 as text/plain
  → get unique short link (Redis cache check → generate if needed)
  → bcrypt hash password if provided
  → calculate expiration timestamp
  → calculate byte size
  → extract first 300 chars as preview (for search)
  → save paste record to DB
  → return PasteDto
```

### View
```
GET /api/pastes/:link  (auth required)
  → find paste + owner + category + syntax in one query (eager load)
  → if private: verify requestingUser is owner
  → if password-protected and not owner: return { requiresPassword: true }
  → fetch content from S3
  → atomic increment view_count (UPDATE SET view_count = view_count + 1)
  → fetch like stats
  → return full paste data + viewCount
```

### Search
```
GET /api/pastes/search
  → query DB with ILIKE on name AND preview (no S3 involved)
  → cursor-based pagination (createdAt cursor)
  → return list with preview snippets — content never fetched from S3
```

### Expiration (cron)
```
Every 60s:  find pastes where expiration_time <= now AND expired=false → mark expired=true
Every 120s: find expired pastes → delete S3 files → delete DB rows
```

---

## Security

| Measure | Implementation |
|---|---|
| Password hashing | bcrypt, async compare everywhere |
| JWT access tokens | Short-lived (1h), signed with separate secret |
| JWT refresh tokens | 7d, stored in DB — invalidated on logout |
| JWT reset tokens | 10 min, separate secret, one-time use |
| Rate limiting | Login: 10/15min, Signup: 5/1h, Forgot-password: 5/1h |
| Ownership checks | delete/update paste and delete comment verify req.user.id === owner |
| HTTP security headers | Helmet: CSP, X-Frame-Options, X-Content-Type-Options, HSTS |
| OAuth password guard | Login and change-password reject accounts with no password (OAuth-only) |
| Input validation | express-validator on all request bodies |
| Error information leakage | Stack traces only in development responses |

---

## Performance Decisions

**S3 only for full content reads**
Paste content is fetched from S3 only when a user opens a specific paste. Search, archive, and list views use only the DB — specifically the `preview` column (first 300 chars stored on create). This prevents N×S3 requests on search results.

**Redis for static lookups**
Categories, syntax highlights, and expiration times are seeded once and never change. They're cached in Redis with no TTL on first request. Subsequent requests never hit the DB.

**Atomic view counter**
`paste.increment('view_count')` issues a single `UPDATE pastes SET view_count = view_count + 1 WHERE id = ?` — safe under concurrent requests, no race condition.

**Parallel S3 cleanup**
Account deletion uses `Promise.all` to delete all paste S3 files in parallel, not sequentially.

**`Promise.all` for independent queries**
Wherever possible, independent DB queries run in parallel (e.g. checking username + email uniqueness on signup, fetching paste content + like stats on view).

---

## API Reference

Full interactive documentation is available at `/api-docs` (Swagger UI).

Endpoint groups:

| Tag | Base path | Description |
|---|---|---|
| Auth | `/api/auth` | Signup, login, logout, refresh, OAuth, password reset |
| Pastes | `/api/pastes` | Create, view, search, archive, like, comment |
| Users | `/api/users` | Profile, avatar, password, stats |
| Health | `/api/health` | DB + Redis liveness check |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No (default: 8080) | Server port |
| `NODE_ENV` | No (default: development) | Controls log format and error detail |
| `API_URL` | Yes | Server base URL (e.g. `http://localhost:8080`) |
| `CLIENT_URL` | Yes | Frontend base URL (e.g. `http://localhost:3000`) |
| `DB_NAME` | Yes | PostgreSQL database name |
| `DB_USERNAME` | Yes | PostgreSQL username |
| `DB_PASSWORD` | Yes | PostgreSQL password |
| `DB_HOST` | No (default: localhost) | PostgreSQL host |
| `DB_PORT` | No (default: 5432) | PostgreSQL port |
| `JWT_ACCESS_TOKEN` | Yes | Secret for signing access tokens |
| `JWT_REFRESH_TOKEN` | Yes | Secret for signing refresh tokens |
| `JWT_RESET_TOKEN` | Yes | Secret for signing password reset tokens |
| `JWT_ACCESS_TOKEN_EXPIRATION_TIME` | No (default: 1h) | Access token TTL |
| `JWT_REFRESH_TOKEN_EXPIRATION_TIME` | No (default: 7d) | Refresh token TTL |
| `S3_BUCKET_NAME` | Yes | AWS S3 bucket name |
| `S3_BUCKET_REGION` | Yes | AWS region (e.g. `us-east-1`) |
| `S3_ACCESS_KEY` | Yes | AWS access key ID |
| `S3_SECRET_ACCESS_KEY` | Yes | AWS secret access key |
| `REDIS_URL` | Yes | Redis connection URL (e.g. `redis://127.0.0.1:6379`) |
| `SMTP_HOST` | Yes | SMTP server host |
| `SMTP_PORT` | Yes | SMTP server port |
| `SMTP_USER` | Yes | SMTP username |
| `SMTP_PASSWORD` | Yes | SMTP password |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Yes | Google OAuth redirect URI |

Copy `.env.local.example` to `.env.local` and fill in the values.

---

## Running Locally

**Prerequisites:** Node.js 20+, PostgreSQL, Redis, AWS S3 bucket

```bash
# Install dependencies
npm install

# Copy and fill environment variables
cp .env.local.example .env.local

# Start development server (tsx watch — hot reload)
npm run dev
```

The server starts on `http://localhost:8080`.  
Swagger UI: `http://localhost:8080/api-docs`  
Health check: `http://localhost:8080/api/health`

Database tables are created automatically via `sequelize.sync({ alter: true })` on first boot.

**Using Docker for PostgreSQL and Redis:**

```bash
docker run -d --name pastebin-postgres \
  -e POSTGRES_DB=pastebin -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
  -p 5433:5432 postgres:16-alpine

docker run -d --name pastebin-redis \
  -p 6380:6379 redis:7-alpine
```

Then set `DB_PORT=5433` and `REDIS_URL=redis://127.0.0.1:6380` in `.env.local`.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload (tsx watch) |
| `npm run build` | Compile TypeScript + rewrite path aliases for production |
| `npm run start` | Run compiled production build |
| `npm run typecheck` | Type check without emitting files |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
