#!/bin/bash

set -e

BACKEND_HOST="${BACKEND_HOST:-localhost}"

cd /home/ec2-user/search-admin-fe

npm install

npm run build

sed -i "s/BACKEND_IP/${BACKEND_HOST}/g" nginx.conf

docker network create search-admin-network 2>/dev/null || true

docker compose down

docker build -t search-admin-fe .

docker compose up -d

docker image prune -f

if ! docker ps | grep -q search-admin-fe; then
    docker logs search-admin-fe 2>&1 | tail -20
    exit 1
fi