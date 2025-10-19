# Stage 1: build
FROM node:24-alpine AS builder
WORKDIR /app

RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install
COPY . .
COPY ssl/ssl.sh ./ssl/ssl.sh
RUN chmod +x ssl/ssl.sh
RUN npm run build

# Stage 2: final image
FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/ssl ./ssl

ENTRYPOINT ["./ssl/ssl.sh"]
CMD ["node", "dist/index.js"]
EXPOSE 3000
