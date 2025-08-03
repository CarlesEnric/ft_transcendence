FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies including build tools for native modules
RUN apk add --no-cache \
    sqlite \
    openssl \
    python3 \
    py3-pip \
    make \
    g++ \
    dotenv \
    sqlite-dev

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy source code
COPY . .

# Copy SSL script and make it executable
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh

# Build TypeScript
RUN npm run build

# Remove dev dependencies and build tools to reduce image size
RUN npm prune --production && \
    apk del python3 py3-pip make g++ sqlite-dev

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
