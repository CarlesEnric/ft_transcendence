FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    sqlite \
    openssl \
    python3 \
    py3-pip \
    make \
    g++ \
    sqlite-dev

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy SSL script and make executable
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Remove dev dependencies to reduce image size
RUN npm prune --production

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
