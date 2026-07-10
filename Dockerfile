# Stage 1: Build stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy monorepo configuration and package files
COPY package*.json ./
COPY core/package*.json ./core/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install all dependencies (including devDependencies)
RUN npm ci

# Copy source code
COPY core ./core
COPY backend ./backend
COPY frontend ./frontend

# Generate Prisma Client
RUN cd backend && npx prisma generate

# Build frontend and backend
RUN npm run build

# Stage 2: Production runner stage
FROM node:22-alpine

WORKDIR /app

# Copy monorepo configuration and package files for production dependency installation
COPY package*.json ./
COPY core/package*.json ./core/
COPY backend/package*.json ./backend/

# Install only production dependencies
RUN npm ci --omit=dev

# Copy database schema and migrations
COPY backend/prisma ./backend/prisma
RUN cd backend && npx prisma generate

# Copy built artifacts from builder stage
COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/frontend/dist ./frontend/dist
COPY --from=builder /app/core/src ./core/src

EXPOSE 3001

# Run database migrations and start the application
CMD ["sh", "-c", "cd backend && npx prisma db push && node --experimental-strip-types dist/index.js"]

