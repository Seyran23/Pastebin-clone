# Pastebin Clone — Project Documentation

## Project Overview

A full-featured pastebin clone — a web platform for sharing text snippets, code, logs, or any plain-text content via short links. Users can set privacy controls (public / unlisted / private), protect pastes with passwords, assign expiration times, and categorize by programming language or topic.

**Core value proposition:** Share a piece of code or text instantly without needing a file, email, or chat. Anyone with the link can read it; the author controls visibility, lifetime, and access.

---

## Tech Stack

### Backend

| Package | Version | Purpose |
|---------|---------|---------|
| `express` | ^4.21 | HTTP server and routing |
| `sequelize` | ^6.37 | ORM — model definitions, migrations, associations |
| `pg` | ^8.13 | PostgreSQL driver |
| `@upstash/redis` | ^1.34 | Redis client — caching lookup tables and link registry |
| `@aws-sdk/client-s3` | ^3.654 | AWS S3 — stores paste content files and user avatars |
| `multer` + `multer-s3` | ^1.4 / ^3.0 | Multipart file upload piped directly to S3 |
| `jsonwebtoken` | ^9.0 | JWT generation and validation (access + refresh tokens) |
| `bcrypt` | ^5.1 | Password hashing (user passwords + paste passwords) |
| `nodemailer` | ^6.9 | SMTP email service (Gmail) |
| `express-validator` | ^7.2 | Request body/param validation |
| `cron` | ^3.1 | Scheduled jobs — mark and delete expired pastes |
| `uuid` | ^10.0 | Unique ID generation (user IDs, paste IDs, S3 filenames) |
| `cookie-parser` | ^1.4 | Parse cookies (refresh token) |
| `cors` | ^2.8 | Cross-origin resource sharing |

### Frontend

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.3 | React framework with App Router |
| `@tanstack/react-query` | ^5.74 | Server state — data fetching, caching, refetching |
| `axios` | ^1.8 | HTTP client with custom interceptor for token refresh |
| `zustand` | ^5.0 | Global client state (auth user, tokens) |
| `react-hook-form` | ^7.56 | Form state management |
| `zod` | ^3.24 | Schema validation (form + API response types) |
| `react-syntax-highlighter` | ^15.6 | Code syntax highlighting in paste view |
| `@radix-ui/*` | various | Accessible headless UI primitives |
| `tailwindcss` | ^4 | Utility-first CSS |
| `sonner` | — | Toast notifications |

---

## Architecture Overview

### Backend — Layered Module Architecture

```
client request
      │
      ▼
  Route (express.Router)
      │  maps HTTP method + path to controller
      ▼
  Validator (express-validator)
      │  validates req.body / req.params before controller runs
      ▼
  Middleware (auth, multer, etc.)
      │  attaches req.user, handles file upload
      ▼
  Controller
      │  extracts args from req, calls service, sends res
      ▼
  Service
      │  all business logic — DB queries, S3 calls, emails
      ▼
  Model (Sequelize)
      │  data access layer
      ▼
  PostgreSQL
```

**Modules:**
```
server/src/
├── index.js                     ← Express app bootstrap
├── config/
│   ├── db.js                    ← Sequelize config (dev/prod)
│   └── swagger.js               ← Swagger setup (incomplete)
├── db/
│   ├── models/                  ← 8 Sequelize models
│   ├── migrations/              ← 8 migration files
│   └── seeders/                 ← 3 seeders (categories, syntax, expiration times)
├── modules/
│   ├── auth/                    ← signup, login, logout, refresh, email flows
│   ├── paste/                   ← CRUD, search, likes, comments
│   ├── user/                    ← profile, avatar, password, delete
│   ├── mail/                    ← email templates + transporter
│   └── cloud/                   ← AWS S3 upload/download/delete
├── services/
│   ├── token.service.js         ← JWT generation + DB token management
│   ├── hashing.service.js       ← bcrypt wrapper
│   └── expiredPastes.service.js ← cron job logic
└── middlewares/
    ├── error-handler.js         ← centralized error handling
    ├── validation-error.middleware.js
    └── multer.middleware.js      ← S3 upload middleware
```

### Frontend — Next.js App Router

```
client/
├── app/
│   ├── page.tsx                 ← Home: create paste form
│   ├── layout.tsx
│   └── (root)/
│       ├── [id]/page.tsx        ← View paste
│       ├── login/page.tsx
│       ├── signup/page.tsx
│       ├── search/page.tsx
│       ├── archive/page.tsx     ← stub (not implemented)
│       ├── verify-email/page.tsx
│       ├── passmailer/page.tsx  ← forgot password
│       ├── usernamemailer/page.tsx
│       ├── resend/page.tsx
│       └── user/
│           ├── [username]/page.tsx       ← public profile
│           ├── [username]/comments/page.tsx
│           ├── profile/page.tsx          ← edit profile
│           ├── password/page.tsx
│           ├── change-avatar/page.tsx
│           ├── delete-account/page.tsx
│           └── search-self/page.tsx
├── components/                  ← Header, Footer, PastesTable, LatestPastes, etc.
├── hooks/                       ← useCategories, useSearch, useExpirationTimes, useSyntaxHighlights
├── lib/
│   ├── api.ts                   ← all Axios API calls
│   ├── interceptor.ts           ← auto token refresh on 401
│   └── models.ts                ← TypeScript interfaces
└── store/
    └── useAuthStore.ts          ← Zustand: user, tokens, isAuthenticated
```

---

## Database Schema

### `users`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `username` | VARCHAR | UNIQUE, NOT NULL |
| `email` | VARCHAR | UNIQUE, NOT NULL |
| `password` | VARCHAR | NOT NULL (bcrypt hash) |
| `role` | ENUM('user','admin') | DEFAULT 'user' |
| `isActivated` | BOOLEAN | DEFAULT false |
| `activationLink` | VARCHAR | nullable, UUID format |
| `avatar` | VARCHAR | nullable, S3 key |
| `location` | VARCHAR | nullable |
| `createdAt` / `updatedAt` | TIMESTAMP | auto-managed |

**Associations:** hasMany Paste, hasOne Token, hasMany Comment, hasMany LikeStats

---

### `pastes`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | UUID | PK |
| `createdBy` | UUID | FK → users.id |
| `syntax_highlight_id` | INTEGER | FK → syntax_highlights.id, nullable |
| `category_id` | INTEGER | FK → paste_categories.id, nullable |
| `exposure` | ENUM('public','unlisted','private') | NOT NULL |
| `password` | VARCHAR | nullable, bcrypt hash |
| `name` | VARCHAR | NOT NULL |
| `link_endpoint` | VARCHAR | UNIQUE (short URL token) |
| `cloud_name` | VARCHAR | S3 filename |
| `expiration_time` | BIGINT | nullable, Unix timestamp in ms |
| `expired` | BOOLEAN | DEFAULT false |
| `size` | INTEGER | content size in bytes |
| `createdAt` / `updatedAt` | TIMESTAMP | auto-managed |

**Associations:** belongsTo User, hasMany Comment, hasMany LikeStats, belongsTo PasteCategory, belongsTo SyntaxHighlights

---

### `comments`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `content` | TEXT | NOT NULL |
| `paste_id` | UUID | FK → pastes.id, CASCADE DELETE |
| `user_id` | UUID | FK → users.id |
| `createdAt` / `updatedAt` | TIMESTAMP | auto-managed |

---

### `tokens` (refresh tokens)

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `user_id` | UUID | FK → users.id, CASCADE DELETE |
| `refreshToken` | TEXT | NOT NULL |
| `createdAt` / `updatedAt` | TIMESTAMP | auto-managed |

One token row per user — upserted on each login.

---

### `like_stats`

| Column | Type | Constraints |
|--------|------|-------------|
| `id` | INTEGER | PK, auto-increment |
| `paste_id` | UUID | FK → pastes.id, CASCADE DELETE |
| `user_id` | UUID | FK → users.id, CASCADE DELETE |
| `is_liked` | BOOLEAN | true = like, false = dislike |
| `createdAt` / `updatedAt` | TIMESTAMP | auto-managed |

**Unique constraint:** `(paste_id, user_id)` — one vote per user per paste.

---

### Lookup tables

**`paste_categories`** — seeded with topic categories (e.g. "Web Development", "Database", etc.)
```
id: INTEGER PK | category_name: VARCHAR UNIQUE
```

**`syntax_highlights`** — seeded with 50+ programming languages
```
id: INTEGER PK | language: VARCHAR UNIQUE
```

**`expiration_times`** — seeded with preset durations
```
id: INTEGER PK | label: VARCHAR UNIQUE | duration: BIGINT (ms)
Examples: "1 Hour" → 3600000, "1 Day" → 86400000, "Never" → null
```

---

## Auth Flow

```
SIGNUP
──────
POST /api/auth/signup
  Body: { username, email, password }
  1. Check username not taken (409 if taken)
  2. Check email not taken (409 if taken)
  3. bcrypt hash password (salt rounds: 10)
  4. Generate UUID → activationLink
  5. INSERT user (isActivated: false, activationLink)
  6. Send email: "Activate your account"
     Link: CLIENT_URL/verify-email?activationLink=<uuid>
  7. Generate JWT access token (1h) + refresh token (7d)
  8. Upsert refresh token in tokens table
  Response: { accessToken, refreshToken, user }

EMAIL VERIFICATION
──────────────────
GET /api/auth/verify-email/:activationLink  [auth required]
  1. Find user by activationLink
  2. Assert user.id === req.user.id (can only activate own account)
  3. SET isActivated=true, activationLink=null
  4. Generate + return new tokens

LOGIN
─────
POST /api/auth/login
  Body: { username, password }
  1. Find user by username (404 if not found)
  2. bcrypt.compare(password, user.password) (401 if mismatch)
  3. Fetch avatar URL from S3 if avatar key exists
  4. Generate new token pair
  5. Upsert refresh token in tokens table
  Response: { accessToken, refreshToken, user: UserDto }

TOKEN REFRESH
─────────────
GET /api/auth/refresh
  Cookie or body: { refreshToken }
  1. Validate JWT signature → decoded payload
  2. Find token record in DB (401 if not found)
  3. Generate new token pair
  4. Update refresh token in DB
  Response: { accessToken, refreshToken, user }

LOGOUT
──────
POST /api/auth/logout
  Body: { refreshToken }
  1. DELETE token record from DB
  Response: 200 OK

FORGOT PASSWORD
───────────────
POST /api/auth/forgot-password
  Body: { username }
  1. Find user by username
  2. Generate short-lived reset token (10 min) with { id, email } payload
  3. Send email with reset link: CLIENT_URL/resetpassword?token=<token>
  (reset password update endpoint not yet implemented)

FORGOT USERNAME
───────────────
POST /api/auth/forgot-username
  Body: { email }
  1. Find user by email
  2. Send email with username reminder
```

---

## Paste Lifecycle

```
CREATE
──────
POST /api/pastes/create  [auth required]
  Body: { content, name, exposure, categoryId?, syntaxHighlightId?,
          expirationTimeId?, password? }

  1. Generate random S3 filename (UUID + ".txt")
  2. Upload content to S3 as text/plain
  3. Generate unique short link:
     a. Check Redis for cached available links
     b. If none: generate random alphanumeric string
     c. Verify uniqueness in DB, cache in Redis
  4. If password provided: bcrypt hash it
  5. If expirationTimeId provided:
     a. Fetch duration from DB
     b. expiration_time = Date.now() + duration
  6. Calculate content size in bytes
  7. INSERT paste record
  Response: { id, name, linkEndpoint, exposure, size, createdAt, ... }

VIEW
────
GET /api/pastes/:link  [auth required]
  1. Find paste by link_endpoint (404 if not found)
  2. If exposure=private: assert req.user.id === paste.createdBy (403)
  3. If paste.password set: return { requiresPassword: true } (don't serve content)
  4. Stream file from S3 → decode as UTF-8 string
  5. Fetch like stats: COUNT is_liked=true (likes), COUNT is_liked=false (dislikes)
  6. Attach owner info (username, avatar)
  Response: { pasteData, owner, content, likeStats, requiresPassword: false }

UNLOCK (password-protected)
────────────────────────────
POST /api/pastes/unlock-paste
  Body: { link, password }
  1. Find paste by link
  2. bcrypt.compare(password, paste.password)
  3. If match: fetch from S3, return full content
  4. If mismatch: 401

UPDATE
──────
PATCH /api/pastes/:link  [auth required]
  Partial update of paste metadata (name, exposure, etc.)

DELETE
──────
DELETE /api/pastes/:id  [auth required]
  1. Find paste → get cloud_name (S3 key)
  2. DELETE file from S3
  3. DELETE paste record (CASCADE: deletes comments + like_stats)

EXPIRATION (background jobs)
────────────────────────────
Every 60 seconds:
  UPDATE pastes SET expired=true
  WHERE expiration_time < NOW() AND expired=false

Every 120 seconds:
  SELECT * FROM pastes WHERE expired=true
  → For each: DELETE from S3, then DELETE from DB
```

---

## Like / Dislike System

```
TOGGLE
──────
POST /api/pastes/like/:id  [auth required]
  Body: { isLike: boolean }
  1. findOrCreate LikeStats for (paste_id=id, user_id=req.user.id)
  2. SET is_liked = isLike
  Note: calling with isLike=true again just confirms the existing like (idempotent)

GET STATS
─────────
GET /api/pastes/like-stats/:id
  SELECT COUNT(*) WHERE paste_id=id AND is_liked=true  → likes
  SELECT COUNT(*) WHERE paste_id=id AND is_liked=false → dislikes
  Response: { likes: number, dislikes: number }

STATUS: Backend fully implemented. Frontend buttons exist but click handlers not wired.
```

---

## Comments

```
CREATE
──────
POST /api/pastes/comment/:id  [auth required]
  Body: { content }
  INSERT comment (content, paste_id=id, user_id=req.user.id)

DELETE
──────
DELETE /api/pastes/comment/:id  [auth required]
  DELETE comment by id
  (no ownership check implemented — any auth user can delete any comment)
```

---

## Search & Pagination

```
PUBLIC SEARCH
─────────────
GET /api/pastes/search  [auth required]
  Query: { searchTerm, category, sort, time, cursor, limit, direction }

  Filters:
    - exposure = 'public'
    - password IS NULL
    - name ILIKE '%searchTerm%'
    - category_id = category (if provided)
    - time: 1h | 24h | 7d | 30d | all → createdAt > NOW() - interval

  Sort: newest | oldest | likes

  Pagination: cursor-based bidirectional
    - cursor = last seen paste ID
    - direction: next | prev

  For each result: fetch content from S3, attach like stats

OWN PASTES SEARCH
─────────────────
GET /api/pastes/search-self  [auth required]
  Query: { title }
  Returns own pastes matching title (all exposures, including private)

SUMMARY
───────
GET /api/pastes/summary?type=public|mine  [optional auth]
  type=public  → latest N public, non-expired, non-password pastes
  type=mine    → latest N pastes belonging to req.user
```

---

## Email Flows

All emails sent via SMTP (Gmail) using Nodemailer.

| Trigger | Template | Contains |
|---------|----------|---------|
| Signup | Registration | Activation link |
| Email address change in profile | Email change verification | New activation link |
| POST /auth/forgot-password | Forgot password | Reset link (10-min token) |
| POST /auth/forgot-username | Forgot username | Username reminder |
| POST /auth/resend-activation | Registration (resend) | New activation link |

---

## File Storage (AWS S3)

All files stored in a single S3 bucket (`S3_BUCKET_NAME`).

| Content | Key format | Content-Type |
|---------|-----------|--------------|
| Paste text | `<uuid>.txt` (random, not user-supplied) | `text/plain` |
| User avatar | `<uuid>` (random UUID, no extension) | `image/*` |

**Paste upload flow:** Express receives paste text → directly PutObject to S3 (no disk writes).

**Avatar upload flow:** Multer → multer-s3 → streams file directly to S3. Old avatar deleted from S3 before new one saved.

**Fetch flow:** GetObject from S3 → stream body collected → decoded as UTF-8 (text) or base64 (images) → returned in response body.

---

## Redis Caching

Used via `@upstash/redis`. Stores JSON strings.

| Key | Content | Set when |
|-----|---------|---------|
| `"categories"` | `Category[]` | First request after server start |
| `"syntax"` | `SyntaxHighlight[]` | First request after server start |
| `"expirations"` | `ExpirationTime[]` | First request after server start |

Cache miss → query PostgreSQL → serialize to JSON → set in Redis → return.
No TTL set on lookup tables (static seed data, won't change without server restart).

---

## API Reference

### Auth — `/api/auth`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| POST | `/signup` | — | `{ username, email, password }` | Register user |
| POST | `/login` | — | `{ username, password }` | Login |
| POST | `/logout` | — | `{ refreshToken }` | Logout |
| GET | `/refresh` | — | cookie/body: `{ refreshToken }` | Refresh tokens |
| GET | `/verify-email/:activationLink` | ✓ | — | Activate account |
| POST | `/forgot-password` | — | `{ username }` | Send reset email |
| POST | `/forgot-username` | — | `{ email }` | Send username email |
| POST | `/resend-activation` | — | `{ username, email }` | Resend verification |

### Pastes — `/api/pastes`

| Method | Path | Auth | Body / Query | Description |
|--------|------|------|------|-------------|
| GET | `/categories` | — | — | All categories (cached) |
| GET | `/syntax-highlights` | — | — | All syntax languages (cached) |
| GET | `/expiration-time` | — | — | Expiration options (cached) |
| GET | `/summary` | optional | `?type=public\|mine` | Latest paste list |
| GET | `/search` | ✓ | `?searchTerm&category&sort&time&cursor&limit&direction` | Search public pastes |
| GET | `/search-self` | ✓ | `?title` | Search own pastes |
| GET | `/like-stats/:id` | — | — | Like/dislike counts |
| GET | `/:link` | ✓ | — | Get paste by short link |
| POST | `/create` | ✓ | `{ content, name, exposure, ... }` | Create paste |
| POST | `/unlock-paste` | — | `{ link, password }` | Unlock password-protected paste |
| POST | `/like/:id` | ✓ | `{ isLike: boolean }` | Toggle like/dislike |
| POST | `/comment/:id` | ✓ | `{ content }` | Add comment |
| PATCH | `/:link` | ✓ | partial paste fields | Update paste |
| DELETE | `/:id` | ✓ | — | Delete paste |
| DELETE | `/comment/:id` | ✓ | — | Delete comment |

### Users — `/api/users`

| Method | Path | Auth | Body | Description |
|--------|------|------|------|-------------|
| GET | `/profile/:username` | — | — | Get user profile |
| GET | `/profile/:username/pastes` | optional | — | Get user's pastes |
| GET | `/stats/:username` | ✓ | — | Paste stats (own only) |
| PATCH | `/edit/profile-details` | ✓ | `{ email?, location? }` | Update email / location |
| PATCH | `/edit/profile-avatar` | ✓ | multipart file | Upload avatar |
| PATCH | `/change-password` | ✓ | `{ currentPassword, newPassword }` | Change password |
| DELETE | `/:id` | ✓ | — | Delete account |

---

## Known Bugs

These are confirmed crashes/data bugs that break specific features:

### Bug 1 — Dangling `await` in paste controller
**File:** `server/src/modules/paste/controller.js:101`
```javascript
await   // ← bare await with no expression
res.status(200).json({ ...content, requiresPassword: false });
```
**Impact:** `GET /api/pastes/:link` throws a TypeError when the paste is accessible.

---

### Bug 2 — `email` undefined in forgot password payload
**File:** `server/src/modules/auth/service.js:186`
```javascript
const payload = {
  id: user.id,
  email,      // ← `email` not declared; should be `user.email`
};
```
**Impact:** `POST /api/auth/forgot-password` generates a token with `email: undefined`.

---

### Bug 3 — Malformed reset URL
**File:** `server/src/modules/auth/service.js:191`
```javascript
const link = `http//localhost:3000/resetpassword?token=${token}`;
// should be:  http://localhost:3000/...
```
**Impact:** Reset link in email is not a valid URL.

---

### Bug 4 — `link` undefined in forgot username
**File:** `server/src/modules/auth/service.js:206`
```javascript
await sendForgotUsernameEmail(email, user.username, link);
// `link` is never declared in this function's scope
```
**Impact:** `POST /api/auth/forgot-username` throws ReferenceError.

---

### Bug 5 — Missing `await` on password hash
**File:** `server/src/modules/user/service.js:163`
```javascript
const hashPassword = hashingPassword(newPassword); // ← should be await hashingPassword(...)
await user.update({ password: hashPassword });     // stores a Promise object, not a hash
```
**Impact:** `PATCH /api/users/change-password` saves a `[object Promise]` string as the password.

---

## Incomplete Features

| Feature | Status | Detail |
|---------|--------|--------|
| Like/dislike UI | Backend done | Frontend buttons rendered but click handlers not implemented |
| Archive page | Empty stub | `/archive` route and file exist with no content |
| Social OAuth login | UI only | Google/Facebook/Twitter buttons on login/signup, no backend implementation |
| Admin panel | Partial | `role` field in DB, `isAdmin` middleware exists, no admin routes or UI |
| Swagger/OpenAPI docs | Config started | `swagger.js` config and dependencies present, commented out in `index.js` |
| Paste edit UI | Route exists | `PATCH /api/pastes/:link` implemented server-side, unclear if wired in frontend |
| Comment ownership | Bug risk | Delete comment endpoint has no ownership check — any auth user can delete any comment |
| Rate limiting | Missing | No brute-force protection on `/auth/login`, `/auth/signup`, `/auth/forgot-password` |
| File validation on avatar upload | Missing | Multer accepts any file type/size — no MIME type or size guard |

---

## Planned Improvements

### Immediate (bugs)
- Fix all 5 critical bugs listed above

### Short term
- **TypeScript migration** — convert Express server from JS to TS for type safety, better DX
- **Google OAuth** — Passport.js + `passport-google-oauth20`; add `/auth/google` callback route
- **Rate limiting** — `express-rate-limit` middleware on auth endpoints
- **File validation** — enforce MIME type (image/*) and size limit (e.g. 5MB) on avatar upload
- **Comment ownership** — only allow comment author or paste owner to delete

### Medium term
- **Archive page** — paginated chronological list of all public, non-expired pastes
- **Paste view counts** — `views` INTEGER column incremented on each `GET /api/pastes/:link`
- **Request logging** — `morgan` or `pino` for structured HTTP logs

### Deployment
- Docker Compose (Express + PostgreSQL + Redis)
- Environment variable hardening (remove hardcoded DB credentials from `config/db.js`)
- Fix env var typo: `S3_ACCEESS_KEY` → `S3_ACCESS_KEY` everywhere
- CORS configured for production domain
