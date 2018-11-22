# PiGallery2
[![npm version](https://badge.fury.io/js/pigallery2.svg)](https://badge.fury.io/js/pigallery2)
[![Build Status](https://travis-ci.org/bpatrik/pigallery2.svg?branch=master)](https://travis-ci.org/bpatrik/pigallery2)
[![Coverage Status](https://coveralls.io/repos/github/bpatrik/PiGallery2/badge.svg?branch=master)](https://coveralls.io/github/bpatrik/PiGallery2?branch=master)
[![Heroku](https://heroku-badge.herokuapp.com/?app=pigallery2&style=flat)](https://pigallery2.herokuapp.com)
[![Dependency Status](https://david-dm.org/bpatrik/pigallery2.svg)](https://david-dm.org/bpatrik/pigallery2)
[![devDependency Status](https://david-dm.org/bpatrik/pigallery2/dev-status.svg)](https://david-dm.org/bpatrik/pigallery2#info=devDependencies)

This is a directory-first photo gallery website, optimised for running on low resource servers (especially on raspberry pi)

## Live Demo
Live Demo @ heroku: https://pigallery2.herokuapp.com/

## Table of contents
1. [Getting started](#getting-started-on-raspberry-pi-1)
3. [Translate the page to your own language](#translate-the-page-to-your-own-language)
2. [Feature list](#feature-list)
2. [Known errors](#known-errors)
4. [Credits](#credits) 



## Getting started (on Raspberry Pi 1)
### Install NodeJs
Download and extract
```bash
cd ~
wget https://nodejs.org/dist/v6.10.3/node-v6.10.3-linux-armv6l.tar.gz
tar -xzf node-v6.10.3-linux-armv6l.tar.gz
```
Copy it to /usr/local: 
```bash
cd node-v6.10.3-linux-armv6l/
sudo cp -R * /usr/local/
```
Add to path. Add the following line to  `~/.bashrc`
```bash
PATH=$PATH:/usr/local/bin
```
Full node install description: https://raspberrypi.stackexchange.com/questions/48303/install-nodejs-for-all-raspberry-pi
 
### Install PiGallery2
#### Install from release

```bash
cd ~
wget https://github.com/bpatrik/pigallery2/releases/download/1.2.0/pigallery2.zip
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

### Run PiGallery2
```bash
npm start
```
To configure it. Run `PiGallery2` first to create `config.json` file, then edit it and restart. 
Default user: `admin` pass: `admin`

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
   * supporting several core CPU
   * supporting hardware acceleration ([sharp](https://github.com/lovell/sharp) and [gm](https://github.com/aheckmann/gm) as optional and JS-based [Jimp](https://github.com/oliver-moran/jimp)  as fallback)   
 * Custom lightbox for full screen photo viewing
   * keyboard support for navigation  
   * showing low-res thumbnail while full image loads
   * Information panel for showing **Exif info**  
   * Automatic playing
   * gesture support (swipe left, right, up)
 * Client side caching (directories and search results)
 * Rendering **photos** with GPS coordinates **on google map**
   * .gpx file support - `future plan`
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
 * **Markdown based blogging support** - `future plan`
   * you can write some note in the blog.md for every directory
 * bug free :) - `In progress`

## Known errors
* EXIF orientation tag:
  *  There is no nice way to handle EXIF orientation tag properly.
The page handles these photos, but might cause same error in the user experience (e.g.: the pages loads those photos slower. See issue [#11](https://github.com/bpatrik/pigallery2/issues/11))

## Credits
Crossbrowser testing sponsored by [Browser Stack](https://www.browserstack.com)
[<img src="https://camo.githubusercontent.com/a7b268f2785656ab3ca7b1cbb1633ee5affceb8f/68747470733a2f2f64677a6f7139623561736a67312e636c6f756466726f6e742e6e65742f70726f64756374696f6e2f696d616765732f6c61796f75742f6c6f676f2d6865616465722e706e67" alt="Browser Stack" height="31px" style="background: cornflowerblue;">](https://www.browserstack.com)

