# Client

Next.js 15 frontend for the Pastebin Clone. Server-side metadata, OG image generation, dark/light theming, and a full user dashboard.

**Live:** [https://pastebin-clone-client.onrender.com](https://pastebin-clone-client.onrender.com)

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui (Radix UI primitives)
- **State:** Zustand (auth store)
- **Data Fetching:** TanStack Query v5
- **Forms:** React Hook Form + Zod
- **Code Editor:** Monaco Editor (`@monaco-editor/react`)
- **Charts:** Recharts
- **HTTP Client:** Axios with request/response interceptors
- **Theming:** next-themes (dark / light)
- **Toasts:** Sonner

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # set NEXT_PUBLIC_BACKEND_URL
npm run dev                        # starts on :3000
```

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Server base URL e.g. `http://localhost:8080` |

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |

## Project Structure

```
app/
├── layout.tsx                  Root layout — ThemeProvider, QueryProvider, Toaster
├── page.tsx                    New paste (home page)
├── error.tsx                   Root error boundary
├── oauth/callback/             Google OAuth token handler
└── (root)/
    ├── [id]/                   Paste view — content, likes, comments, OG image
    │   ├── layout.tsx          generateMetadata for social sharing
    │   ├── opengraph-image.tsx OG image generation (satori)
    │   └── _components/        PasteHeader, PasteCodeBlock, CommentSection, LockedPasteView
    ├── archive/                Public paste archive with cursor pagination
    ├── edit/[link]/            Edit paste (owner only)
    ├── search/                 Full-text search with filters (auth required)
    ├── login/                  Email/password + Google OAuth login
    ├── signup/                 Account registration
    ├── verify-email/           Email activation handler
    ├── passmailer/             Forgot password form
    ├── usernamemailer/         Forgot username form
    ├── resend/                 Resend activation email
    └── user/
        ├── [username]/         Public profile — pastes table, stats
        │   └── comments/       User's comment history
        └── (settings)/         Auth-guarded settings pages
            ├── layout.tsx      Redirects to /login if not authenticated
            ├── dashboard/      Analytics dashboard — charts, top pastes
            ├── profile/        Edit email and location
            ├── change-avatar/  Upload new avatar
            ├── password/       Change password (disabled for Google OAuth users)
            ├── delete-account/ Delete account with confirmation
            └── search-self/    Search own pastes

components/
├── layout/
│   ├── Header.tsx      Navigation, search, user dropdown, theme toggle
│   ├── Footer.tsx
│   ├── ThemeProvider.tsx   next-themes wrapper
│   ├── ThemeToggle.tsx     Sun/Moon button
│   └── QueryProvider.tsx   TanStack Query provider
├── paste/
│   └── LatestPastes.tsx    Sidebar with recent public pastes + skeletons
├── shared/
│   ├── InfoBox.tsx         Alert/info banner
│   ├── RelatedPages.tsx    Settings nav (hides current page link)
│   └── StatCard.tsx        Dashboard summary card
└── ui/                     shadcn/ui components

hooks/
├── useNewPasteForm.ts  Paste creation form state + mutations
├── useLike.ts          Optimistic like/dislike with rollback
├── usePasteUnlock.ts   Password-protected paste unlock flow
├── useSearch.ts        Search query hook
└── useCategories.ts    Paste category options

lib/
├── api/
│   ├── interceptor.ts  Axios instance + 401 refresh queue
│   ├── paste.api.ts    Paste endpoints
│   └── user.api.ts     User / dashboard endpoints
├── constants/
│   ├── auth-links.ts       Settings nav link lists
│   ├── language-colors.ts  Syntax highlight colour map (for OG image)
│   ├── paste-options.ts    Exposure options for select
│   └── select-styles.ts    Theme-aware react-select styles
├── types/              TypeScript interfaces
└── utils.ts            Formatting helpers (timeAgo, bytesToKilobytes, etc.)

store/
└── useAuthStore.ts     Zustand store — tokens, user info, login/logout
```

## Key Features

### Paste Creation
The home page (`/`) hosts the paste editor. Monaco Editor provides syntax highlighting with language autodetection. Unauthenticated users can create guest pastes (no account needed for public pastes). Authenticated users can set exposure (public / private / unlisted), expiration time, category, syntax highlight, and optional password protection.

### Paste View
Each paste has a dedicated URL (`/[id]`). The page generates per-paste Open Graph metadata and a 1200×630 OG image via `opengraph-image.tsx`, so links shared on Slack, Discord, or Twitter render a preview card with title, language, author, and a code snippet.

### Authentication
- Email/password signup with account activation via email
- Google OAuth — single-click sign-in, redirects through `/oauth/callback` for token handling
- Access tokens stored in localStorage, refresh tokens rotated on every use
- Expired access tokens are transparently refreshed — concurrent 401 responses queue behind a single refresh call

### Theme Toggle
Dark mode is the default. The toggle (Sun/Moon icon in the header) switches to a warm zinc-based light palette. `next-themes` persists the choice. All layout shells, form inputs, and react-select dropdowns respond to the theme.

### Analytics Dashboard
Owner-only page at `/user/dashboard`. Shows:
- **Summary cards** — total pastes, total views, total likes, total comments
- **Bar charts** — pastes created per month, likes received per month, comments received per month (all since account creation, powered by Recharts)
- **Top 5 pastes** — ranked by view count with syntax and exposure badge

### Settings Guard
All pages under `/user/(settings)/` are wrapped in a client-side auth guard layout (`layout.tsx`). Unauthenticated visits redirect to `/login` with no flash of protected content.

### Search
Full-text paste search at `/search` (requires login). Supports filters for category, time range, and sort order. Cursor-based pagination. Results show a code preview card with syntax highlighting via `react-syntax-highlighter`.

## Auth Store

```ts
useAuthStore() → {
  user,              // IUserInfo | null
  isAuthenticated,   // boolean
  accessToken,       // string | null
  saveAccessToken,
  saveRefreshToken,
  setUserInfo,
  updateUserAvatar,
  logout,
  refreshAccessToken,
}
```

## API Client

`lib/api/interceptor.ts` creates the Axios instance with:
- Base URL from `NEXT_PUBLIC_BACKEND_URL`
- Automatic `Authorization: Bearer <token>` injection from localStorage
- Response interceptor that on 401: pauses the failing request, performs a single token refresh (deduped across concurrent requests), and replays the original request
