# ── Stage 1: Dependencies ────────────────────────────────────────────────────
FROM node:20-alpine AS deps

RUN apk add --no-cache libc6-compat python3 make g++ \
    # canvas native dependencies
    cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci --frozen-lockfile

# ── Stage 2: Builder ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat python3 make g++ \
    cairo-dev pango-dev libjpeg-turbo-dev giflib-dev

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Provide a dummy DATABASE_URL for build time (Prisma client generation only)
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npm run build

# ── Stage 3: Production Runner ────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat cairo pango libjpeg-turbo giflib

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
# Full node_modules needed so `prisma db push` can run at startup
# (requires prisma CLI, @prisma/adapter-pg, pg, and Prisma's jiti TS loader)
COPY --from=builder /app/node_modules ./node_modules

# Create data directory for Railway volume mount
RUN mkdir -p /data/assets && chown -R nextjs:nodejs /data

# Set permissions
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Run database migrations then start the app
CMD ["sh", "-c", "npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss && node server.js"]
