# 1. Билд-стейдж
FROM node:22.21.1-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build
RUN npm run export   # создаёт /app/out

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
