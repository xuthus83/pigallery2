FROM node:alpine
RUN apk add python build-base
COPY . /build
WORKDIR /build
RUN set -x && npm install --unsafe-perm && npm run create-release && \
    cd /build/release && npm install --unsafe-perm
RUN mkdir -p /build/release/data/config && \
    mkdir -p /build/release/data/db && \
    mkdir -p /build/release/data/image && \
    mkdir -p /build/release/data/TEMP && \
    cd /build/release && npm start -- --config-only || true && \
    sed -i 's/demo/data/g' config.json && sed -i 's@sqlite\.db@data/db/sqlite\.db@' config.json && \
    mv /build/release/config.json /build/release/data/config/config.json

FROM node:alpine
WORKDIR /app
ENTRYPOINT ["npm", "start"]
EXPOSE 80
ENV NODE_ENV=production
COPY --from=0 /build/release /app
RUN ln -s /app/data/config/config.json config.json
VOLUME ["/app/data/config", "/app/data/db", "/app/data/images", "/app/data/TEMP"]
HEALTHCHECK --interval=15s --timeout=5s --retries=4 --start-period=30s \
  CMD wget --quiet --tries=1 --no-check-certificate --spider \
  http://localhost:80 || exit 1
