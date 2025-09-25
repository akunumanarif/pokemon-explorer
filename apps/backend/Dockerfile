# Multi-stage Docker build for NestJS Backend
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./

# Development stage
FROM base AS development
RUN apk add --no-cache openssl openssl-dev
RUN npm install
COPY . .
RUN npx prisma generate
EXPOSE 3001
CMD ["npm", "run", "start:dev"]

# Production build stage
FROM base AS builder
RUN apk add --no-cache openssl openssl-dev
RUN npm install --only=production && npm cache clean --force
COPY . .
RUN npx prisma generate
RUN npm run build

# Production stage
FROM node:18-alpine AS production
WORKDIR /app
RUN apk add --no-cache wget
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
EXPOSE 3000
CMD ["npm", "run", "start:prod"]