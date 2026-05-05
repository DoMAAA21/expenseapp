# Development Dockerfile for hot reloading
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Reduce npm output to avoid Docker build pipe issues; increase timeout
ENV npm_config_progress=false \
    npm_config_loglevel=error \
    npm_config_fetch_timeout=300000

# Install dependencies (npm ci is more reliable in Docker, uses lockfile)
RUN npm ci

# Copy source code
COPY . .

# Expose port
EXPOSE 5173

# Start development server with hot reloading on port 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
