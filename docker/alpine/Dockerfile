FROM node:alpine
RUN apk add python build-base
COPY . /build
WORKDIR /build
RUN set -x && npm install --unsafe-perm && npm run build-release && \
    cd /build/release && npm install --unsafe-perm
RUN mkdir -p /build/release/data/config && \
    mkdir -p /build/release/data/db && \
    mkdir -p /build/release/data/image && \
    mkdir -p /build/release/data/TEMP && \
    cd /build/release && node backend/server.js && \
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
