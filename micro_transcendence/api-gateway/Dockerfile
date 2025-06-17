# This Dockerfile sets up a Node.js 24 (Alpine) environment for building and running a Node.js application.
# 
# Steps:
# 1. Uses the official Node.js 24 Alpine image for a lightweight container.
# 2. Sets the working directory to /app.
# 3. Installs OpenSSL for SSL certificate generation.
# 4. Copies package.json and package-lock.json (if present) for dependency installation.
# 5. Installs dependencies using npm.
# 6. Copies the rest of the application source code into the container.
# 7. Builds the application using the npm build script.
# 8. Exposes port 7000 for external access.
# 9. Sets the default command to start the application using npm.
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache python3 python3-dev py3-setuptools make g++ openssl
COPY package*.json ./
RUN npm install
RUN npm install -g npm@latest
COPY . .
COPY init_ssl.sh .
RUN chmod +x /app/init_ssl.sh
RUN npm run build
EXPOSE 8000
ENTRYPOINT ["/app/init_ssl.sh"]
CMD ["node", "dist/index.js"]