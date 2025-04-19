#!/bin/sh

# Replace placeholders in config.js with environment variables
envsubst '$VITE_COG_URL $VITE_LIVE_URL $VITE_RTMP_URL $VITE_PUBLIC_URL $VITE_ENV $VITE_TITILER_STATIC $VITE_INSTANCE $VITE_STATIC_URL $VITE_API_URL $VITE_MAPBOX_API_KEY $VITE_SITE_KEY $VITE_SECRET_KEY $VITE_VERSION $VITE_OPENWEATHER_API_KEY $VITE_GOOGLE_API_KEY' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Start Nginx
exec "$@"
