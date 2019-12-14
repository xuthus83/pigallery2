FROM alpine AS qemu-builder
RUN apk add --no-cache wget && \
    wget https://github.com/multiarch/qemu-user-static/releases/download/v4.1.1-1/x86_64_qemu-arm-static.tar.gz && \
    tar -xvf x86_64_qemu-arm-static.tar.gz

FROM arm32v6/node:12-stretch AS builder
COPY --from=qemu-builder /qemu-arm-static /usr/bin
# LABEL maintainer="Patrik J. Braun"
# copying only package{-lock}.json to make node_modules cachable
COPY package*.json /build/
WORKDIR /build
RUN set -x && npm install --unsafe-perm
# build app
COPY stretch /build
RUN mkdir -p /build/release/data/config && \
    mkdir -p /build/release/data/db && \
    mkdir -p /build/release/data/images && \
    mkdir -p /build/release/data/tmp && \
    npm run create-release && \
    cd /build/release && npm install --unsafe-perm && \
    npm start -- --config-only --force-rewrite-config \
    --config-path=data/config/config.json \
    --Server-Database-sqlite-storage='data/db/sqlite.db' \
    --Server-Database-memory-usersFile='data/db/users.db' \
    --Server-imagesFolder='data/images' \
    --Server-Thumbnail-folder='data/tmp'  || true


FROM arm32v6/node:12-stretch-slim
COPY --from=qemu-builder /qemu-arm-static /usr/bin
WORKDIR /app
ENTRYPOINT ["npm", "start"]
EXPOSE 80
ENV NODE_ENV=production
COPY --from=builder /build/release /app
RUN ln -s /app/data/config/config.json config.json
VOLUME ["/app/data/config", "/app/data/db", "/app/data/images", "/app/data/TEMP"]
HEALTHCHECK --interval=30s --timeout=10s --retries=4 --start-period=60s \
  CMD wget --quiet --tries=1 --no-check-certificate --spider \
  http://localhost:80 || exit 1

