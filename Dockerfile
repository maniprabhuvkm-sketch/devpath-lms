# Use official lightweight Node.js LTS Alpine image
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production
ENV PORT=3000

# Create working directory
WORKDIR /app

# Copy application files
COPY package.json ./
# In case dependencies are added in the future
RUN if [ -f package-lock.json ]; then npm ci --only=production; fi

COPY server.js ./
COPY data/ ./data/
COPY public/ ./public/

# Expose standard application port
EXPOSE 3000

# Run as non-root user for security hardening
USER node

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/courses || exit 1

# Start the application
CMD ["node", "server.js"]
