FROM node:10-stretch
MAINTAINER Patrik J. Braun


RUN git clone https://github.com/bpatrik/pigallery2.git && \
    cd /pigallery2 && \
    npm install --unsafe-perm && \
    npm run build-release

RUN cp -r /pigallery2/release /pigallery2-release && \
    rm /pigallery2 -R

RUN cd /pigallery2-release && \
    npm install --unsafe-perm

cmd cd /pigallery2-release && npm start

