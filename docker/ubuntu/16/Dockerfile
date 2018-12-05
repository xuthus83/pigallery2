FROM ubuntu:16.04
MAINTAINER Patrik J. Braun

RUN apt-get update && \
    apt-get install -y curl git
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs && \
    apt-get install -y build-essential

RUN git clone https://github.com/bpatrik/pigallery2.git && \
    cd /pigallery2 && \
    npm install --unsafe-perm && \
    npm run build-release

RUN cp -r /pigallery2/release /pigallery2-release && \
    rm /pigallery2 -R

RUN cd /pigallery2-release && \
    npm install --unsafe-perm

cmd cd /pigallery2-release && npm start

