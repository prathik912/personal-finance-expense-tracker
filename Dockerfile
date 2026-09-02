# Dockerfile for FinanceFlow Production Deployment
FROM node:20-alpine

WORKDIR /app

# Copy package configs and install backend dependencies
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/

WORKDIR /app/backend
RUN npm ci

# Copy full application code
WORKDIR /app
COPY . .

# Generate Prisma Client & Sync SQLite DB
WORKDIR /app/backend
RUN npx prisma generate
RUN npx prisma db push
RUN npm run prisma:seed

ENV NODE_ENV=production
ENV PORT=5000
EXPOSE 5000

CMD ["npm", "start"]
