# This Dockerfile sets up a Node.js 24 (Alpine) environment for building and running a Node.js application.
# 
# Steps:
# 1. Uses the official Node.js 24 Alpine image for a lightweight container.
# 2. Sets the working directory to /app.
# 3. Copies package.json and package-lock.json (if present) for dependency installation.
# 4. Installs dependencies using npm.
# 5. Copies the rest of the application source code into the container.
# 6. Builds the application using the npm build script.
# 7. Exposes port 7000 for external access.
# 8. Sets the default command to start the application using npm.
FROM node:24-alpine

WORKDIR /app

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN ls -l /app

COPY init_ssl.sh /app/init_ssl.sh
RUN chmod +x /app/init_ssl.sh

RUN npm run build

EXPOSE 7000

ENTRYPOINT ["/app/init_ssl.sh"]
CMD ["npm", "run", "start"]