#!/bin/bash
# One-time server setup for astrolytix.com
# Run this script on a fresh server to configure nginx, TCP settings, etc.
# Usage: sudo bash setup_server_once.sh

set -e

echo "=== Astrolytix Server Setup ==="

# Step 1: Increase TCP SYN backlog (fixes intermittent connection drops)
echo "Configuring TCP SYN backlog..."
if ! grep -q "tcp_max_syn_backlog" /etc/sysctl.conf; then
    echo 'net.ipv4.tcp_max_syn_backlog = 4096' >> /etc/sysctl.conf
fi
sysctl -p

# Step 2: Enable gzip compression in nginx
echo "Enabling gzip compression..."
sed -i 's/# gzip_vary on;/gzip_vary on;/' /etc/nginx/nginx.conf
sed -i 's/# gzip_proxied any;/gzip_proxied any;/' /etc/nginx/nginx.conf
sed -i 's/# gzip_comp_level 6;/gzip_comp_level 6;/' /etc/nginx/nginx.conf
sed -i 's/# gzip_types text\/plain/gzip_types text\/plain/' /etc/nginx/nginx.conf

# Step 3: Configure nginx site with HTTP/2 and caching
echo "Configuring nginx site..."
cat > /etc/nginx/sites-enabled/astrologer << 'EOF'
# HTTP - redirect to HTTPS
server {
    listen 80;
    server_name astrolytix.com www.astrolytix.com;
    return 301 https://$host$request_uri;
}

# HTTPS - main server
server {
    listen 443 ssl http2;
    server_name astrolytix.com www.astrolytix.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/astrolytix.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/astrolytix.com/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    root /var/www/html;
    index index.html;

    # API proxy
    location /api/ {
        proxy_pass http://localhost:8081/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets (images, css, js, fonts) for 1 year
    location ~* \.(jpg|jpeg|png|gif|ico|svg|webp|css|js|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # Cache JSON translation files for 1 week
    location /locales/ {
        expires 7d;
        add_header Cache-Control "public";
    }

    # Static files
    location / {
        try_files $uri $uri/ =404;
    }
}
EOF

# Step 4: Test and reload nginx
echo "Testing nginx configuration..."
nginx -t

echo "Reloading nginx..."
systemctl reload nginx

echo ""
echo "=== Setup Complete ==="
echo "Verify with:"
echo "  curl -sI --http2 https://astrolytix.com | head -3"
echo "  curl -sI https://astrolytix.com/logo.svg | grep -i cache"
