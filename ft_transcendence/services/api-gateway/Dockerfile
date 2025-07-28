FROM node:24-alpine

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache openssl

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install
# Install dependencies only for production, not iclude like typescript dependency
#RUN npm install --production

# Copy SSL script and make executable
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port (only service that should be externally accessible)
EXPOSE 3001

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
