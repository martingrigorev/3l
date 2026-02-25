FROM node:20-alpine

WORKDIR /app

# Install build tools for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build the frontend
RUN npm run build

# Create data directory for SQLite volume
RUN mkdir -p /app/data

# Environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV DB_PATH=/app/data/progress.db

# Expose the internal port
EXPOSE 3000

# Start the server
CMD ["npx", "tsx", "server.ts"]
