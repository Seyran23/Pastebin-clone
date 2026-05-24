/**
 * Seed script — run while the server is running:
 *   npx tsx seed.ts
 *
 * Creates 3 users, 10 pastes with real S3 content, comments, and likes.
 */

const BASE = 'http://localhost:8080/api';

// ─── helpers ──────────────────────────────────────────────────────────────────

async function post(path: string, body: unknown, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

async function get(path: string, token?: string) {
  const res = await fetch(`${BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

// ─── users ────────────────────────────────────────────────────────────────────

const USERS = [
  { username: 'alice_dev', email: 'alice@seed.test', password: 'alice1234' },
  { username: 'bob_codes', email: 'bob@seed.test',   password: 'bob12345' },
  { username: 'carol_ux',  email: 'carol@seed.test', password: 'carol123' },
];

async function ensureUsers() {
  const tokens: Record<string, string> = {};

  for (const u of USERS) {
    // try signup first
    await post('/auth/signup', u);

    // login to get token (works even if already existed)
    const res = await post('/auth/login', { username: u.username, password: u.password }) as any;
    if (!res.accessToken) {
      console.error(`  ✗ Could not login as ${u.username}:`, res.message ?? res);
      continue;
    }
    tokens[u.username] = res.accessToken;
    console.log(`  ✓ ${u.username}`);
  }
  return tokens;
}

// ─── reference data ───────────────────────────────────────────────────────────

async function getReferenceData() {
  const [syntaxRes, catRes, expRes] = await Promise.all([
    get('/pastes/syntax-highlights'),
    get('/pastes/categories'),
    get('/pastes/expiration-time'),
  ]);

  const syntax = (syntaxRes as any[]).reduce((acc: Record<string, number>, s: any) => {
    acc[s.language.toLowerCase()] = s.id;
    return acc;
  }, {});

  const categories = (catRes as any[]).reduce((acc: Record<string, number>, c: any) => {
    acc[c.category_name.toLowerCase()] = c.id;
    return acc;
  }, {});

  const expiration = (expRes as any[]);

  return { syntax, categories, expiration };
}

// ─── paste definitions ────────────────────────────────────────────────────────

const PASTE_TEMPLATES = [
  {
    author: 'alice_dev',
    name: 'Express.js REST API boilerplate',
    syntaxKey: 'javascript',
    exposure: 'public',
    content: `const express = require('express');
const app = express();

app.use(express.json());

// Routes
app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.get('/users', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

app.post('/users', async (req, res) => {
  const user = await User.create(req.body);
  res.status(201).json(user);
});

app.listen(3000, () => console.log('Server running on :3000'));`,
  },
  {
    author: 'alice_dev',
    name: 'Python data pipeline',
    syntaxKey: 'python',
    exposure: 'public',
    content: `import pandas as pd
from sklearn.preprocessing import StandardScaler

def load_and_clean(path: str) -> pd.DataFrame:
    df = pd.read_csv(path)
    df.dropna(inplace=True)
    df = df[df['value'] > 0]
    return df

def normalize(df: pd.DataFrame, cols: list[str]) -> pd.DataFrame:
    scaler = StandardScaler()
    df[cols] = scaler.fit_transform(df[cols])
    return df

if __name__ == '__main__':
    df = load_and_clean('data.csv')
    result = normalize(df, ['price', 'volume'])
    result.to_csv('cleaned.csv', index=False)
    print(f'Processed {len(result)} rows')`,
  },
  {
    author: 'alice_dev',
    name: 'Tailwind CSS card component',
    syntaxKey: 'css',
    exposure: 'public',
    content: `.card {
  @apply bg-white rounded-2xl shadow-md overflow-hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  @apply shadow-xl;
  transform: translateY(-4px);
}

.card-header {
  @apply p-6 border-b border-gray-100;
}

.card-body {
  @apply p-6 text-gray-700 leading-relaxed;
}

.card-footer {
  @apply px-6 py-4 bg-gray-50 flex justify-end gap-2;
}`,
  },
  {
    author: 'alice_dev',
    name: 'PostgreSQL user analytics query',
    syntaxKey: 'sql',
    exposure: 'unlisted',
    content: `SELECT
  u.username,
  COUNT(DISTINCT p.id)      AS total_pastes,
  COUNT(DISTINCT c.id)      AS total_comments,
  SUM(ls.is_liked::int)     AS total_likes_received,
  MAX(p.created_at)         AS last_active
FROM users u
LEFT JOIN pastes      p  ON p.created_by = u.id AND p.expired = false
LEFT JOIN comments    c  ON c.user_id    = u.id
LEFT JOIN like_stats  ls ON ls.paste_id  = p.id AND ls.is_liked = true
GROUP BY u.id, u.username
HAVING COUNT(DISTINCT p.id) > 0
ORDER BY total_pastes DESC
LIMIT 20;`,
  },
  {
    author: 'bob_codes',
    name: 'Docker Compose for Node + Postgres + Redis',
    syntaxKey: 'yaml',
    exposure: 'public',
    content: `version: '3.9'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://postgres:secret@db:5432/myapp
      - REDIS_URL=redis://cache:6379
    depends_on:
      - db
      - cache

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: myapp
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    command: redis-server --save ""

volumes:
  pgdata:`,
  },
  {
    author: 'bob_codes',
    name: 'TypeScript generic Result type',
    syntaxKey: 'typescript',
    exposure: 'public',
    content: `type Ok<T>  = { success: true;  data: T };
type Err<E> = { success: false; error: E };
type Result<T, E = string> = Ok<T> | Err<E>;

function ok<T>(data: T): Ok<T>   { return { success: true,  data  }; }
function err<E>(error: E): Err<E> { return { success: false, error }; }

async function fetchUser(id: string): Promise<Result<User>> {
  try {
    const user = await db.users.findByPk(id);
    if (!user) return err('User not found');
    return ok(user);
  } catch (e) {
    return err('Database error');
  }
}

// Usage
const result = await fetchUser('123');
if (result.success) {
  console.log(result.data.username);
} else {
  console.error(result.error);
}`,
  },
  {
    author: 'bob_codes',
    name: 'Bash deployment script',
    syntaxKey: 'bash',
    exposure: 'public',
    content: `#!/usr/bin/env bash
set -euo pipefail

BRANCH=\${1:-main}
DEPLOY_DIR=/var/www/app

echo ">>> Deploying branch: $BRANCH"

cd "$DEPLOY_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"

echo ">>> Installing dependencies"
npm ci --production

echo ">>> Running migrations"
npx sequelize-cli db:migrate

echo ">>> Restarting app"
pm2 restart app --update-env

echo ">>> Done ✓"`,
  },
  {
    author: 'carol_ux',
    name: 'React custom useFetch hook',
    syntaxKey: 'typescript',
    exposure: 'public',
    content: `import { useCallback, useEffect, useReducer } from 'react';

type State<T> = { data: T | null; loading: boolean; error: string | null };
type Action<T> =
  | { type: 'loading' }
  | { type: 'success'; payload: T }
  | { type: 'error'; payload: string };

function reducer<T>(state: State<T>, action: Action<T>): State<T> {
  switch (action.type) {
    case 'loading': return { data: null, loading: true,  error: null };
    case 'success': return { data: action.payload, loading: false, error: null };
    case 'error':   return { data: null, loading: false, error: action.payload };
  }
}

export function useFetch<T>(url: string) {
  const [state, dispatch] = useReducer(reducer<T>, {
    data: null, loading: false, error: null,
  });

  const execute = useCallback(async () => {
    dispatch({ type: 'loading' });
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
      dispatch({ type: 'success', payload: await res.json() as T });
    } catch (e) {
      dispatch({ type: 'error', payload: (e as Error).message });
    }
  }, [url]);

  useEffect(() => { void execute(); }, [execute]);
  return { ...state, refetch: execute };
}`,
  },
  {
    author: 'carol_ux',
    name: 'Nginx reverse proxy config',
    syntaxKey: 'nginx',
    exposure: 'public',
    content: `server {
    listen 80;
    server_name example.com www.example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;

    gzip on;
    gzip_types text/plain application/json application/javascript text/css;

    location /api {
        proxy_pass         http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection keep-alive;
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}`,
  },
  {
    author: 'carol_ux',
    name: 'JSON Web Token cheatsheet',
    syntaxKey: 'json',
    exposure: 'public',
    content: `{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user_id_here",
    "username": "alice",
    "email": "alice@example.com",
    "iat": 1716000000,
    "exp": 1716003600
  },
  "notes": {
    "iat": "issued at (Unix timestamp)",
    "exp": "expiry  (Unix timestamp, here: iat + 1 hour)",
    "sub": "subject — typically the user ID",
    "tip": "Never store sensitive data in the payload — it is base64 encoded, not encrypted"
  }
}`,
  },
];

// ─── comments ─────────────────────────────────────────────────────────────────

const COMMENT_TEMPLATES = [
  'Great snippet, saved me a ton of time!',
  'Clean and readable — exactly what I was looking for.',
  'Just what I needed, thanks for sharing.',
  'Works perfectly. Minor note: might want to add error handling.',
  'Bookmarked this one. Really useful pattern.',
  'Nice approach! I usually do it differently but this is cleaner.',
  'This helped me fix a bug I\'ve been stuck on for days.',
  'Simple and effective. Well done.',
];

// ─── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌱 Seeding database...\n');

  console.log('→ Creating users...');
  const tokens = await ensureUsers();

  if (Object.keys(tokens).length === 0) {
    console.error('No tokens obtained — is the server running on :8080?');
    process.exit(1);
  }

  console.log('\n→ Fetching reference data...');
  const { syntax, categories } = await getReferenceData();
  console.log(`  Syntax languages: ${Object.keys(syntax).length}`);
  console.log(`  Categories: ${Object.keys(categories).length}`);

  console.log('\n→ Creating pastes...');
  const pasteLinks: { link: string; pasteId: string; author: string }[] = [];

  for (const tmpl of PASTE_TEMPLATES) {
    const token = tokens[tmpl.author];
    if (!token) { console.log(`  ⚠ Skipping (no token for ${tmpl.author})`); continue; }

    const syntaxId = syntax[tmpl.syntaxKey] ?? null;
    const categoryId = categories.technology ?? categories[Object.keys(categories)[0]] ?? null;

    const res = await post('/pastes/create', {
      name: tmpl.name,
      content: tmpl.content,
      exposure: tmpl.exposure,
      syntaxHighlight: syntaxId,
      category: categoryId,
      expirationTime: 'never',
      password: null,
    }, token) as any;

    if (!res.linkEndpoint) {
      console.log(`  ✗ ${tmpl.name}:`, res.message ?? JSON.stringify(res).slice(0, 80));
      continue;
    }

    pasteLinks.push({ link: res.linkEndpoint, pasteId: res.id, author: tmpl.author });
    console.log(`  ✓ [${tmpl.exposure}] ${tmpl.name}`);
  }

  console.log('\n→ Adding comments...');
  let commentCount = 0;

  for (let i = 0; i < pasteLinks.length; i++) {
    const { pasteId, author: pasteAuthor } = pasteLinks[i];
    // 2 commenters who are not the author
    const commenters = USERS.filter((u) => u.username !== pasteAuthor).slice(0, 2);

    for (const commenter of commenters) {
      const token = tokens[commenter.username];
      if (!token) continue;
      const text = COMMENT_TEMPLATES[(i + commentCount) % COMMENT_TEMPLATES.length];
      const res = await post(`/pastes/comment/${pasteId}`, { content: text }, token) as any;
      if (res.id) commentCount++;
    }
  }
  console.log(`  ✓ ${commentCount} comments added`);

  console.log('\n→ Adding likes...');
  let likeCount = 0;

  for (let i = 0; i < pasteLinks.length; i++) {
    const { pasteId, author: pasteAuthor } = pasteLinks[i];
    const voters = USERS.filter((u) => u.username !== pasteAuthor);

    for (const voter of voters) {
      const token = tokens[voter.username];
      if (!token) continue;
      const isLike = i % 3 !== 2; // mostly likes, occasional dislikes
      await post(`/pastes/like/${pasteId}`, { isLike }, token);
      likeCount++;
    }
  }
  console.log(`  ✓ ${likeCount} votes added`);

  console.log('\n✅ Seed complete!\n');
  console.log('Test accounts:');
  USERS.forEach((u) => console.log(`  ${u.username} / ${u.password}`));
  console.log();
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});