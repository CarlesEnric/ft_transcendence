FROM node:24-alpine
WORKDIR /app
RUN apk add --no-cache openssl
COPY package*.json ./
RUN npm install
COPY . .
COPY init_ssl.sh .
RUN chmod +x /app/init_ssl.sh
RUN npm run build
EXPOSE 7000
ENTRYPOINT ["/app/init_ssl.sh"]
CMD ["node", "dist/index.js"]