FROM node:12-stretch AS BUILDER
# LABEL maintainer="Patrik J. Braun"
# copying only package{-lock}.json to make node_modules cachable
RUN git clone https://github.com/bpatrik/pigallery2.git /build
WORKDIR /build
RUN set -x && npm install --unsafe-perm && \
    mkdir -p /build/release/data/config && \
    mkdir -p /build/release/data/db && \
    mkdir -p /build/release/data/images && \
    mkdir -p /build/release/data/tmp && \
    npm run create-release && \
    cd /build/release && npm install --unsafe-perm && \
    npm start -- --config-only --force-rewrite-config \
    --config-path=data/config/config.json \
    --Server-Database-sqlite-storage='data/db/sqlite.db' \
    --Server-Database-memory-usersFile='data/db/users.db' \
    --Server-Media-folder='data/images' \
    --Server-Media-tempFolder='data/tmp'  || true


FROM node:12-stretch-slim
WORKDIR /app
ENTRYPOINT ["npm", "start"]
EXPOSE 80
ENV NODE_ENV=production
COPY --from=BUILDER /build/release /app
RUN ln -s /app/data/config/config.json config.json
VOLUME ["/app/data/config", "/app/data/db", "/app/data/images", "/app/data/TEMP"]
HEALTHCHECK --interval=30s --timeout=10s --retries=4 --start-period=60s \
  CMD wget --quiet --tries=1 --no-check-certificate --spider \
  http://localhost:80 || exit 1

