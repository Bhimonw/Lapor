# Multi-stage build for LAPOR application

# Stage 1: Build frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client

# Increase memory limit for Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Install dependencies (including devDependencies for build)
COPY client/package*.json ./
RUN npm ci --prefer-offline --no-audit

# Copy source code and build
COPY client/ ./
RUN npm run build

# Stage 2: Setup backend and serve frontend
FROM node:18-alpine AS production
WORKDIR /app

# Install server dependencies only (skip postinstall to avoid frontend build)
COPY server/package*.json ./
RUN npm ci --omit=dev --ignore-scripts && npm cache clean --force

# Copy server application files
COPY server/ ./

# Copy built frontend to public directory
COPY --from=frontend-builder /app/client/dist ./public

# Create required directories
RUN mkdir -p uploads/reports

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs
RUN adduser -S lapor -u 1001
RUN chown -R lapor:nodejs /app
USER lapor

# Expose port (Railway will set PORT env var)
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 3000) + '/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Start the application
CMD ["node", "server.js"]