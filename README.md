# PiGallery2
[![Build Status](https://travis-ci.org/bpatrik/PiGallery2.svg?branch=master)](https://travis-ci.org/bpatrik/PiGallery2)
[![Coverage Status](https://coveralls.io/repos/github/bpatrik/PiGallery2/badge.svg?branch=master)](https://coveralls.io/github/bpatrik/PiGallery2?branch=master)
[![Heroku](https://heroku-badge.herokuapp.com/?app=pigallery2&style=flat)](https://pigallery2.herokuapp.com)
[![Code Climate](https://codeclimate.com/github/bpatrik/PiGallery2/badges/gpa.svg)](https://codeclimate.com/github/bpatrik/PiGallery2)
[![Dependency Status](https://david-dm.org/bpatrik/PiGallery2.svg)](https://david-dm.org/bpatrik/PiGallery2)
[![devDependency Status](https://david-dm.org/bpatrik/PiGallery2/dev-status.svg)](https://david-dm.org/bpatrik/PiGallery2#info=devDependencies)

This is a directory-first photo gallery website, optimised for running on low resource servers (especially on raspberry pi)


Work in progess.... Estimated first beta in 2017 summer 

Live Demo @ heroku: https://pigallery2.herokuapp.com/

Feature list:
 * **Rendering directories as it is**
   * Listing subdirectories recursively
   * Listing photos in a nice grid layout
     * supporting most common image formats
     * showing **tag/keywords, locations, GPS coordinates** for photos
     * rendering photos on demand (on scroll)
 * On the **fly thumbnail generation** in several sizes
   * prioritizes thumbnail generation (generating thumbnail first for the visible photos)
   * saving generated thumbnails to TEMP folder for reuse
   * supporting several core CPU
   * supporting hardware acceleration - `In progress`   
 * Custom lightbox for full screen photo viewing
   * keyboard support for navigation - `In progress`
   * showing low-res thumbnail while full image loads
   * Information panel for showing **Exif info** - `In progress`
 * Client side caching (folders and search results)
 * Rendering **photos** with GPS coordinates **on google map**
   * .gpx file support - `In progress`
 * **Two modes: SQL database and no-database-mode**
   * both modes: user management
   * password protection can be disabled/enabled
   * database mode supports:
     * faster directory listing
     * searching
       * instant search, auto complete
     * sharing - `In progress`
       * setting link expiration time
 * Nice design - `In progress`
    * responsive design (phone, tablet desktop support)
 * Setup page - `In progress`
 * **Markdown based blogging support** - `In progress`
  * you can write some note in the blog.md for every directory
 * bug free :) - `In progress`
