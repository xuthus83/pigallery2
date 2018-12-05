# PiGallery2 
[![npm version](https://badge.fury.io/js/pigallery2.svg)](https://badge.fury.io/js/pigallery2)
[![Build Status](https://travis-ci.org/bpatrik/pigallery2.svg?branch=master)](https://travis-ci.org/bpatrik/pigallery2)
[![Heroku](https://heroku-badge.herokuapp.com/?app=pigallery2&style=flat)](https://pigallery2.herokuapp.com)
[![dependencies Status](https://david-dm.org/bpatrik/pigallery2/status.svg)](https://david-dm.org/bpatrik/pigallery2)
[![devDependencies Status](https://david-dm.org/bpatrik/pigallery2/dev-status.svg)](https://david-dm.org/bpatrik/pigallery2?type=dev)

Homepage: http://bpatrik.github.io/pigallery2/

This is a directory-first photo gallery website, optimised for running on low resource servers (especially on raspberry pi)

## Live Demo
Live Demo @ heroku: https://pigallery2.herokuapp.com/ 
 - the demo page **first load** might take up **30s**: the time while the free webservice boots up

## Table of contents
1. [Getting started](#getting-started-on-raspberry-pi-1)
3. [Translate the page to your own language](#translate-the-page-to-your-own-language)
2. [Feature list](#feature-list)
2. [Known errors](#known-errors)
4. [Credits](#credits) 



## Getting started (on Raspberry Pi 1)
### [Install NodeJs](https://nodejs.org/en/download/)
Download and extract
```bash
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Full node install on rapberry pi description: https://www.w3schools.com/nodejs/nodejs_raspberrypi.asp
 
### Install PiGallery2
#### Install from release

```bash
cd ~
wget https://github.com/bpatrik/pigallery2/releases/download/1.5.0/pigallery2.zip
unzip pigallery2.zip
cd pigallery2
npm install
```
#### Install from source
```bash
cd ~
wget https://github.com/bpatrik/pigallery2/archive/master.zip
unzip master.zip
cd pigallery2-master # enter the unzipped directory
npm install
```
**Note**: if you run `npm run build-release`, it creates a clean, minified, production ready version from the app in the `release` folder, that is ready to deploy.

### Run PiGallery2
```bash
npm start
```
To configure it, run `PiGallery2` first to create `config.json` file, then edit it and restart.
The app has a nice UI for settings, you may use that too. 
Default user: `admin` pass: `admin`

### Run with Docker 
```bash
docker run \
   -p 80:80 \
   -e NODE_ENV=production \
   -v <path to your config file folder>/config.json:/pigallery2-release/config.json \
   -v <path to your images folder>:/pigallery2-release/demo/images \
   -v <path to your temp folder>:/pigallery2-release/TEMP \
   bpatrik/pigallery2:nightly-stretch
```
Make sure that a file at `<path to your config file folder>/config.json` exists before running it. 

After the container is up and running, you go to `http://localhost` and log in with user: `admin` pass: `admin` and set up the page in the settings. 

**Note**: of course, you dont need to do installation steps if you are using docker. 

### Useful links/tips:

#### using nginx
https://stackoverflow.com/questions/5009324/node-js-nginx-what-now

#### making https
https://certbot.eff.org/

#### node install error:
If you get error during module installation, make sure you have everything to build node modules from source
```bash
apt-get install build-essential  libkrb5-dev gcc g++
```


## Translate the page to your own language
1. download / clone the repo (the source not the packed release!)
2. add your language e.g: fr
   ```bash
   npm run add-translation -- --fr
   ```
   it creates a new `messages.fr.xls` file at `frontend/translate` folder, 
   it will already contain dummy translation with google translate.
3. 'fix' the dummy translation
4. test if it works:
   build and start the app
   ```bash
   npm install
   npm start
   ```
5. create a pull request at github to add your translation to the project.



## Feature list

 * **Rendering directories as it is**
   * Listing subdirectories recursively
   * Listing photos in a nice grid layout
     * supporting most common image formats
     * showing **tag/keywords, locations, GPS coordinates** for photos
     * rendering photos on demand (on scroll)
 * **On the fly thumbnail generation** in several sizes
   * prioritizes thumbnail generation (generating thumbnail first for the visible photos)
   * saving generated thumbnails to TEMP folder for reuse
   * supporting multi-core CPUs
   * supporting hardware acceleration ([sharp](https://github.com/lovell/sharp) and [gm](https://github.com/aheckmann/gm) as optional and JS-based [Jimp](https://github.com/oliver-moran/jimp)  as fallback)   
 * Custom lightbox for full screen photo viewing
   * keyboard support for navigation  
   * showing low-res thumbnail while full image loads
   * Information panel for showing **Exif info**  
   * Automatic playing
   * gesture support (swipe left, right, up)
 * Client side caching (directories and search results)
 * Rendering **photos** with GPS coordinates **on google map**
   * .gpx file support 
 * **Two modes: SQL database and no-database mode**
   * both modes supports
     * user management
     * password protection can be disabled/enabled
   * database mode supports:
     * faster directory listing
     * searching
       * instant search, auto complete
     * sharing 
       * setting link expiration time
 * internalization / translation support
 * Nice design 
    * responsive design (phone, tablet desktop support)
 * Setup page
 * Random photo url
   * You can generate an url that returns a random photo from your gallery. You can use this feature to develop 3rd party applications, like: changing desktop background
 * video support
   * fully supports *.mp4 files and partially (might have errors with safari and IE) supports *.ogg, *.ogv, *.webm files
   * uses ffmpeg and ffprobe to generate video thumbnails
 * **Markdown based blogging support** - `future plan`
   * you can write some note in the blog.md for every directory
 * bug free :) - `In progress`

## Known errors
* EXIF orientation tag:
  *  There is no nice way to handle EXIF orientation tag properly.
The page handles these photos, but might cause same error in the user experience (e.g.: the pages loads those photos slower. See issue [#11](https://github.com/bpatrik/pigallery2/issues/11))
* Video support on weak servers (like raspberry pi) with low upload rate
  * video playback may use up too much resources and the server might not response for a while. A solution might be to down scale / convert the video files to lower bitrate. 
## Credits
Crossbrowser testing sponsored by [Browser Stack](https://www.browserstack.com)
[<img src="https://camo.githubusercontent.com/a7b268f2785656ab3ca7b1cbb1633ee5affceb8f/68747470733a2f2f64677a6f7139623561736a67312e636c6f756466726f6e742e6e65742f70726f64756374696f6e2f696d616765732f6c61796f75742f6c6f676f2d6865616465722e706e67" alt="Browser Stack" height="31px" style="background: cornflowerblue;">](https://www.browserstack.com)

