# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# ── Stage 2: Production ───────────────────────────────────────────────────────
FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Compiled app
COPY --from=builder /app/dist ./dist

# Sequelize CLI migration files (plain JS, not compiled)
COPY .sequelizerc ./
COPY src/config/db.js ./src/config/db.js
COPY src/db/migrations ./src/db/migrations

EXPOSE 8080

CMD ["sh", "-c", "npx sequelize-cli db:migrate && node dist/index.js"]
