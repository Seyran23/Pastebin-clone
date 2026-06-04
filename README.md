# Pastebin Clone

A full-stack pastebin web application with authentication, cloud storage, real-time search, and analytics.

## Live Demo

**[https://pastebin-clone-client.onrender.com](https://pastebin-clone-client.onrender.com)**

> Hosted on Render free tier — first load may take 30–60 seconds while the server wakes up.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | Express.js 5, TypeScript, Sequelize ORM |
| Database | PostgreSQL |
| Cache | Redis |
| Storage | AWS S3 |
| Auth | JWT (access + refresh), Google OAuth 2.0 |
| Email | Nodemailer (SMTP) |

## Quick Start

**Prerequisites:** Node.js 20+, PostgreSQL, Redis, AWS S3 bucket

```bash
# 1. Clone
git clone https://github.com/Seyran23/Pastebin-clone
cd pastebin-clone

# 2. Server
cd server
cp .env.sample .env.local        # fill in your values
npm install
npm run migrate                   # create tables
npm run seed                      # seed lookup data
npm run dev                       # starts on :8080

# 3. Client (new terminal)
cd client
cp .env.local.example .env.local  # fill in NEXT_PUBLIC_BACKEND_URL
npm install
npm run dev                       # starts on :3000
```

## Project Structure

```
pastebin-clone/
├── server/     Express API — see server/README.md
└── client/     Next.js app — see client/README.md
```

## Features at a Glance

- Create, view, edit, and delete pastes with syntax highlighting
- Public, private, and unlisted exposure modes
- Password-protected pastes
- Guest paste creation (no account required for public pastes)
- Email/password signup + Google OAuth
- Account activation via email
- Forgot password / forgot username email flows
- File storage on AWS S3
- Full-text paste search with filters (auth required)
- Public archive with cursor pagination
- Per-paste OG image and metadata for social sharing
- User analytics dashboard (pastes, likes, comments over time)
- Dark / light theme toggle

## Documentation

- [Server README](server/README.md) — API, architecture, environment variables, running tests
- [Client README](client/README.md) — pages, components, state management, theming
