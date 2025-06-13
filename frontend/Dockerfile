FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN apk add --no-cache openssl
RUN npm install
COPY . .
COPY init_ssl.sh .
RUN chmod +x /app/init_ssl.sh
RUN npm run build
RUN npm install -g serve
EXPOSE 3000
ENTRYPOINT ["/app/init_ssl.sh"]
CMD ["serve", "-s", "public", "-l", "3000"]