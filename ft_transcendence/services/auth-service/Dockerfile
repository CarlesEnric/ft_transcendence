FROM node:24-alpine
# FROM nexus.42barcelona.com:5000/node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache python3 make g++ sqlite openssl

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm install

# Copy SSL script and make executable
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh

# Copy source code
COPY . .


# Build TypeScript
RUN npm run build

# Remove dev dependencies to keep image size small
# RUN npm prune --production

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
