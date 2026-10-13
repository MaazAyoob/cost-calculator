# Dockerfile for Express API Server
FROM node:20-alpine AS builder
WORKDIR /app

# Install OpenSSL required by Prisma engine on Alpine Linux
RUN apk add --no-cache openssl

# Copy package definitions and prisma schema first for optimal Docker layer caching
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies (including devDependencies like typescript and prisma CLI)
RUN npm ci

# Generate Prisma Client during the Docker BUILD stage (requires no live database)
RUN npx prisma generate

# Copy application source code and compile TypeScript to dist/
COPY . .
RUN npm run build

# Production runtime stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Install OpenSSL for Prisma runtime on Alpine
RUN apk add --no-cache openssl

# Install production dependencies only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev

# Copy generated Prisma Client runtime and compiled application from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/dist ./dist

EXPOSE 4000

CMD ["node", "dist/index.js"]
