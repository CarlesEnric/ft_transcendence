# Multi-stage build for React frontend
FROM node:24-alpine AS builder

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

# Set working directory
WORKDIR /app

# Copy built React app from builder stage
COPY --from=builder /app/dist ./dist

# This container only serves as a volume for static files
CMD ["tail", "-f", "/dev/null"]
