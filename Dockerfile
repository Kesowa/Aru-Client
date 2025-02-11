# syntax=docker/dockerfile:1.4
FROM node:lts AS build

# Set working directory
WORKDIR /app

COPY package.json /app/package.json
COPY package-lock.json /app/package-lock.json
COPY *.tgz /app/

# Same as npm install
RUN npm ci --legacy-peer-deps

COPY . /app

RUN npm run build

# 2. For Nginx setup
FROM nginx:alpine

# Copy config nginx
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=build /app/build .

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]

