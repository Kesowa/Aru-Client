#!/bin/sh

# new env vars with adjustments for CSP headers
export STATIC_URL=$(echo "$VITE_STATIC_URL" | sed 's|/aru$||')
export WS_URL=$(echo "$VITE_API_URL" | sed -E 's|^https?://|ws://|')

# Replace placeholders in config.js with environment variables
envsubst '$VITE_COG_URL $VITE_LIVE_URL $VITE_RTMP_URL $VITE_PUBLIC_URL $VITE_ENV $VITE_TITILER_STATIC $VITE_INSTANCE $VITE_STATIC_URL $VITE_API_URL $VITE_MAPBOX_API_KEY $VITE_SITE_KEY $VITE_SECRET_KEY $VITE_VERSION $VITE_OPENWEATHER_API_KEY $VITE_GOOGLE_API_KEY' < /usr/share/nginx/html/index.html > /usr/share/nginx/html/index.html.tmp
mv /usr/share/nginx/html/index.html.tmp /usr/share/nginx/html/index.html

# Replace placeholders in csp_headers.conf with environment variables
envsubst '$VITE_COG_URL $VITE_LIVE_URL $VITE_RTMP_URL $VITE_PUBLIC_URL $VITE_ENV $VITE_TITILER_STATIC $VITE_INSTANCE $VITE_STATIC_URL $VITE_API_URL $VITE_MAPBOX_API_KEY $VITE_SITE_KEY $VITE_SECRET_KEY $VITE_VERSION $VITE_OPENWEATHER_API_KEY $VITE_GOOGLE_API_KEY $STATIC_URL $WS_URL' < /etc/nginx/conf.d/csp_headers.conf > /etc/nginx/conf.d/csp_headers.conf.tmp
mv /etc/nginx/conf.d/csp_headers.conf.tmp /etc/nginx/conf.d/csp_headers.conf

# Start Nginx
exec "$@"
