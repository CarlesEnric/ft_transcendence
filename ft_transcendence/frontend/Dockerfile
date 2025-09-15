# Multi-stage build for React frontend
FROM node:24-alpine AS builder
# FROM nexus.42barcelona.com:5000/node:24-alpine AS builder

# Set working directory
WORKDIR /app

# Install system dependencies for build
RUN apk add --no-cache git

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies)
RUN npm install

# Copy source code
COPY . .

# Build React app
RUN npm run build

# Final stage - only for copying built files
FROM alpine:latest AS production
# FROM nexus.42barcelona.com:5000/alpine:latest AS production

# Set working directory
WORKDIR /app

# Copy built React app from builder stage
COPY --from=builder /app/dist ./dist

# Copy the setup script and template
COPY setup_config.sh ./setup_config.sh

# Make the script executable
RUN chmod +x ./setup_config.sh

# Run the setup script and then start the container
CMD ["sh", "-c", "./setup_config.sh && tail -f /dev/null"]


# # Alternative Dockerfile using MIRROR RED HAT
# FROM registry.access.redhat.com/ubi9/nodejs-20

# # Set working directory
# WORKDIR /app

# # 👇 Assegura't que ets root abans de qualsevol instal·lació
# USER root

# # Install system dependencies
# RUN dnf install -y python3 gcc gcc-c++ sqlite openssl && dnf clean all

# COPY --from=builder /app/dist ./dist

# # Copy package files
# COPY package*.json ./

# # Install all dependencies (including dev dependencies for build)
# RUN npm install

# # Copy source code
# COPY . .

# # Build TypeScript
# RUN npm run build

# # Copy SSL script and make executable
# COPY ssl/ssl.sh ./ssl/ssl.sh
# RUN chmod +x ssl/ssl.sh

# # ✅ Torna a un usuari no root per seguretat
# USER 1001

# # Remove dev dependencies to keep image size small
# RUN npm prune --production

# # Entrypoint
# ENTRYPOINT ["./ssl/ssl.sh"]
# CMD ["node", "dist/index.js"]

