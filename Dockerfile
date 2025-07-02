# Multi-stage build for LAPOR application

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app
COPY client/package*.json ./client/
WORKDIR /app/client
RUN npm ci --only=production
COPY client/ ./
RUN npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18-alpine AS production
WORKDIR /app

# Copy package.json files
COPY package*.json ./
COPY server/package*.json ./server/

# Install dependencies
RUN npm ci --only=production
WORKDIR /app/server
RUN npm ci --only=production

# Copy application files
WORKDIR /app
COPY start.js ./
COPY server/ ./server/

# Copy built frontend to public directory
COPY --from=frontend-builder /app/client/dist ./server/public

# Create required directories
RUN mkdir -p server/uploads/reports

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S lapor -u 1001
RUN chown -R lapor:nodejs /app
USER lapor

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["npm", "start"]