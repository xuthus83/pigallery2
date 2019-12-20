# PiGallery2 docker installation [![Docker Build Status](https://img.shields.io/docker/build/bpatrik/pigallery2.svg)](https://hub.docker.com/r/bpatrik/pigallery2/)

You can use [docker](https://docs.docker.com/install/) to run PiGallery2.

## all docker tags
https://hub.docker.com/r/bpatrik/pigallery2/tags/

## Usage

If you have `docker` and don't want to install all the dependencies, use this:
```bash
docker run \
   -p 80:80 \
   -v <path to your config file folder>/config.json:/app/data/config/config.json \
   -v <path to your db file folder>:/app/data/db \
   -v <path to your images folder>:/app/data/images \
   -v <path to your temp folder>:/app/data/tmp \
   bpatrik/pigallery2:nightly-stretch
```

After the container is up and running, you go to `http://localhost` and log in with user: `admin` pass: `admin` and set up the page in the settings. 

**Note**: even with `memory` db, pigallery2 creates a db file for storing user credentials (if enabled), so mounting (with `-v`) the `/app/data/db` folder is recommended.

### before v1.7.0
There was a breaking change in Docker files after v1.7.0. Use this to run earlier versions:

```bash
docker run \
   -p 80:80 \
   -e NODE_ENV=production \
   -v <path to your config file folder>/config.json:/pigallery2-release/config.json \
   -v <path to your db file folder>/sqlite.db:/pigallery2-release/sqlite.db \
   -v <path to your images folder>:/pigallery2-release/demo/images \
   -v <path to your temp folder>:/pigallery2-release/demo/TEMP \
   bpatrik/pigallery2:1.7.0-stretch
```
Make sure that a file at `<path to your config file folder>/config.json` and `sqlite.db` files exists before running it. 

You do not need the `<path to your db file folder>/sqlite.db` line if you don't use the sqlite database.

 
 ### Build the Docker image on your own
 
 You can clone the repository and build the image, or you can just use the 'self-contained' Dockerfile: [debian-stretch/selfcontained/Dockerfile](debian-stretch/selfcontained/Dockerfile)
