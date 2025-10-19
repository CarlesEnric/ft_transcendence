# Stage 1: build
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 py3-pip make g++ sqlite sqlite-dev openssl
COPY package*.json ./
RUN npm install
COPY . .
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh
RUN npm run build

# Stage 2: final image
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache sqlite openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ssl ./ssl

EXPOSE 3003 3005

# Use SSL script as entrypoint
ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]

