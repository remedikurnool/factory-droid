# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY apps/backend ./apps/backend
COPY packages/shared ./packages/shared
COPY packages/database ./packages/database
COPY tsconfig.json ./

# Generate Prisma client
WORKDIR /app/packages/database
RUN pnpm prisma:generate

# Build backend
WORKDIR /app/apps/backend
RUN pnpm build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN npm install -g pnpm@8

# Copy built files
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Create uploads directory
RUN mkdir -p uploads

EXPOSE 4000

CMD ["node", "dist/main"]
