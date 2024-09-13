# syntax=docker/dockerfile:1.4
FROM node:lts AS build

ARG VITE_COG_URL
ENV VITE_COG_URL=$VITE_COG_URL
ARG VITE_LIVE_URL
ENV VITE_LIVE_URL=$VITE_LIVE_URL
ARG VITE_RTMP_URL
ENV VITE_RTMP_URL=$VITE_RTMP_URL
ARG VITE_PUBLIC_URL
ENV VITE_PUBLIC_URL=$VITE_PUBLIC_URL
ARG VITE_ENV
ENV VITE_ENV=$VITE_ENV
ARG VITE_TITILER_STATIC
ENV VITE_TITILER_STATIC=$VITE_TITILER_STATIC
ARG VITE_INSTANCE
ENV VITE_INSTANCE=$VITE_INSTANCE
ARG VITE_STATIC_URL
ENV VITE_STATIC_URL=$VITE_STATIC_URL
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_MAPBOX_API_KEY
ENV VITE_MAPBOX_API_KEY=$VITE_MAPBOX_API_KEY
ARG VITE_SITE_KEY
ENV VITE_SITE_KEY=$VITE_SITE_KEY
ARG VITE_SECRET_KEY
ENV VITE_SECRET_KEY=$VITE_SECRET_KEY
ARG VITE_VERSION
ENV VITE_VERSION=$VITE_VERSION
ARG VITE_OPENWEATHER_API_KEY
ENV VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY

# Set working directory
WORKDIR /app

# 
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

# Containers run nginx with global directives and daemon off
ENTRYPOINT ["nginx", "-g", "daemon off;"]

