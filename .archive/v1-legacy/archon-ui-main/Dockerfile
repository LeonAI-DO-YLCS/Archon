# Vite dev server with proper volume handling
FROM node:18-alpine

WORKDIR /app

# Install system dependencies needed for some npm packages
RUN apk add --no-cache python3 make g++ git curl

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies for testing
RUN npm ci

# Create coverage directory with proper permissions
RUN mkdir -p /app/coverage && chmod 777 /app/coverage

# Copy source code
COPY . .

# Expose the port configured in package.json (3737)
EXPOSE 3737

# Use a startup script to ensure node_modules is available
# This handles the case where source volume mounts might hide node_modules
CMD ["sh", "-c", "if [ ! -d node_modules ]; then npm ci; fi && npm run dev"]
