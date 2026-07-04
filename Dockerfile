# Stage 1: Build frontend
FROM node:20-alpine as frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend ./
RUN npm run build

# Stage 2: Build backend
FROM node:20-alpine as backend-build

WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm ci
COPY backend ./
RUN npm run build

# Stage 3: Production
FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# Copy built backend
COPY --from=backend-build /app/backend/dist ./backend/dist

# Copy Prisma
COPY backend/prisma ./backend/prisma

# Copy built frontend
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Copy root files
COPY backend/.env* ./

EXPOSE 3001

CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && cd .. && node backend/dist/index.js"]
