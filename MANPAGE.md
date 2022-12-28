# Pigallery 2 man page
pigallery2 uses [typeconfig](https://github.com/bpatrik/typeconfig) for configuration

`npm start -- --help` prints the following:

```
Usage: <appname> [options] 

Meta cli options: 
--help                           prints this manual 
--config-path                    sets the config file location 
--config-attachState             prints the value state (default, readonly, volatile, etc..) to the config file 
--config-attachDesc              prints description to the config file 
--config-rewrite-cli             updates the config file with the options from cli switches 
--config-rewrite-env             updates the config file with the options from environmental variables 
--config-string-enum             enums are stored as string in the config file (instead of numbers) 
--config-save-if-not-exist       creates config file if not exist 
--config-save-and-exist          creates config file and terminates 

<appname> can be configured through the configuration file, cli switches and environmental variables. 
All settings are case sensitive. 
Example for setting config MyConf through cli: '<appname> --MyConf=5' 
and through env variable: 'SET MyConf=5' . 

Default values can be also overwritten by prefixing the options with 'default-', 
 like '<appname> --default-MyConf=5' and  'SET default-MyConf=5'

App CLI options: 
  --Server-applicationTitle                         (default: 'PiGallery 2')
  --Server-publicUrl                                (default: '')
  --Server-urlBase                                  (default: '')
  --Server-apiPath                                 PiGallery api path. (default: '/pgapi')
  --Server-customHTMLHead                           (default: '')
  --Server-sessionSecret                            (default: [])
  --Server-sessionTimeout                          unit: ms (default: 604800000)
  --Server-port                                     (default: 80)
  --Server-host                                     (default: '0.0.0.0')
  --Server-Threading-enabled                       App can run on multiple thread (default: true)
  --Server-Threading-thumbnailThreads              Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used. (default: 0)
  --Server-Log-level                                (default: 'info')
  --Server-Log-sqlLevel                             (default: 'error')
  --Server-Log-logServerTiming                      (default: false)
  --Users-authenticationRequired                    (default: true)
  --Users-unAuthenticatedUserRole                   (default: 'Admin')
  --Users-enforcedUsers                            Creates these users in the DB if they do not exist. If a user with this name exist, it wont be overwritten, even if the role is different. (default: [])
  --Gallery-enableCache                             (default: true)
  --Gallery-enableOnScrollRendering                 (default: true)
  --Gallery-defaultPhotoSortingMethod              Default sorting method for directory results (default: 'ascDate')
  --Gallery-defaultSearchSortingMethod             Default sorting method for search results (default: 'descDate')
  --Gallery-enableDirectorySortingByDate           If enabled directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo (default: false)
  --Gallery-enableOnScrollThumbnailPrioritising     (default: true)
  --Gallery-NavBar-showItemCount                    (default: true)
  --Gallery-NavBar-links                           List of the navigation bar links (default: [{"type":1},{"type":3},{"type":2}])
  --Gallery-captionFirstNaming                      (default: false)
  --Gallery-enableDownloadZip                       (default: false)
  --Gallery-enableDirectoryFlattening              Adds a button to flattens the file structure, by listing the content of all subdirectories. (default: false)
  --Gallery-defaultSlideshowSpeed                  Default time interval for displaying a photo in the slide show (default: 5)
  --Media-Thumbnail-iconSize                        (default: 45)
  --Media-Thumbnail-personThumbnailSize             (default: 200)
  --Media-Thumbnail-thumbnailSizes                  (default: [240,480])
  --Media-Thumbnail-useLanczos3                    if true, 'lanczos3' will used to scale photos, otherwise faster but lowe quality 'nearest'. (default: true)
  --Media-Thumbnail-quality                        Thumbnail image quality (default: 80)
  --Media-Thumbnail-personFaceMargin                (default: 0.6)
  --Media-Video-enabled                             (default: true)
  --Media-Video-supportedFormatsWithTranscoding    Video formats that are supported after transcoding (with the build-in ffmpeg support) (default: ["avi","mkv","mov","wmv","flv","mts","m2ts","mpg","3gp","m4v","mpeg","vob","divx","xvid","ts"])
  --Media-Video-supportedFormats                   Video formats that are supported also without transcoding (default: ["mp4","webm","ogv","ogg"])
  --Media-Video-transcoding-bitRate                 (default: 5242880)
  --Media-Video-transcoding-resolution              (default: 720)
  --Media-Video-transcoding-fps                     (default: 25)
  --Media-Video-transcoding-codec                   (default: 'libx264')
  --Media-Video-transcoding-format                  (default: 'mp4')
  --Media-Video-transcoding-crf                    Constant Rate Factor. The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible. (default: 23)
  --Media-Video-transcoding-preset                 A preset is a collection of options that will provide a certain encoding speed to compression ratio (default: 'medium')
  --Media-Video-transcoding-customOptions          It will be sent to ffmpeg as it is, as custom options. (default: [])
  --Media-Photo-Converting-enabled                  (default: true)
  --Media-Photo-Converting-onTheFly                Converts photos on the fly, when they are requested. (default: true)
  --Media-Photo-Converting-resolution               (default: 1080)
  --Media-Photo-loadFullImageOnZoom                Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  --Media-Photo-supportedFormats                    (default: ["gif","jpeg","jpg","jpe","png","webp","svg"])
  --Media-folder                                   Images are loaded from this folder (read permission required) (default: 'demo/images')
  --Media-tempFolder                               Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')
  --Media-photoMetadataSize                        Only this many bites will be loaded when scanning photo/video for metadata. (default: 524288)
  --MetaFile-gpx                                   Reads *.gpx files and renders them on the map. (default: true)
  --MetaFile-GPXCompressing-enabled                 (default: true)
  --MetaFile-GPXCompressing-onTheFly               Compresses gpx files on-the-fly, when they are requested. (default: true)
  --MetaFile-GPXCompressing-minDistance            Filters out entry that are closer than this in meters. (default: 5)
  --MetaFile-GPXCompressing-minTimeDistance        Filters out entry that are closer than this in time in milliseconds. (default: 5000)
  --MetaFile-markdown                              Reads *.md files in a directory and shows the next to the map. (default: true)
  --MetaFile-pg2conf                               Reads *.pg2conf files (You can use it for custom sorting and save search (albums)). (default: true)
  --MetaFile-supportedFormats                       (default: ["gpx","pg2conf","md"])
  --Album-enabled                                   (default: true)
  --Search-enabled                                  (default: true)
  --Search-searchCacheTimeout                       (default: 3600000)
  --Search-AutoComplete-enabled                     (default: true)
  --Search-AutoComplete-targetItemsPerCategory      (default: 5)
  --Search-AutoComplete-maxItems                    (default: 30)
  --Search-AutoComplete-cacheTimeout                (default: 3600000)
  --Search-maxMediaResult                           (default: 10000)
  --Search-listDirectories                         Search returns also with directories, not just media (default: false)
  --Search-listMetafiles                           Search also returns with metafiles from directories that contain a media file of the matched search result (default: true)
  --Search-maxDirectoryResult                       (default: 200)
  --Sharing-enabled                                 (default: true)
  --Sharing-passwordProtected                      Enables password protected sharing links. (default: true)
  --Sharing-updateTimeout                          After creating a sharing link, it can be updated for this long (in ms). (default: 300000)
  --Map-enabled                                     (default: true)
  --Map-maxPreviewMarkers                          Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  --Map-useImageMarkers                             (default: true)
  --Map-mapProvider                                 (default: 'OpenStreetMap')
  --Map-mapboxAccessToken                           (default: '')
  --Map-customLayers                                (default: [{"name":"street","url":""}])
  --Faces-enabled                                   (default: true)
  --Faces-keywordsToPersons                         (default: true)
  --Faces-writeAccessMinRole                        (default: 'Admin')
  --Faces-readAccessMinRole                         (default: 'User')
  --RandomPhoto-enabled                            Enables random link generation. (default: true)
  --Database-type                                   (default: 'sqlite')
  --Database-dbFolder                               (default: 'db')
  --Database-sqlite-DBFileName                      (default: 'sqlite.db')
  --Database-mysql-host                             (default: 'localhost')
  --Database-mysql-port                             (default: 3306)
  --Database-mysql-database                         (default: 'pigallery2')
  --Database-mysql-username                         (default: '')
  --Database-mysql-password                         (default: '')
  --Indexing-cachedFolderTimeout                    (default: 3600000)
  --Indexing-reIndexingSensitivity                  (default: 'low')
  --Indexing-excludeFolderList                     If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$RECYCLE.BIN"])
  --Indexing-excludeFileList                       Any folder that contains a file with this name will be excluded from indexing. (default: [])
  --Preview-SearchQuery                             (default: {"type":100,"text":""})
  --Preview-Sorting                                 (default: [6,4])
  --Duplicates-listingLimit                         (default: 1000)
  --Jobs-maxSavedProgress                          Job history size (default: 20)
  --Jobs-mediaProcessingBatchSize                  Job loads this many photos or videos form the DB for processing (default: 1000)
  --Jobs-scheduled                                  (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Preview Filling","jobName":"Preview Filling","config":{},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Preview Filling"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}}])

Environmental variables: 
  Server-applicationTitle                       (default: 'PiGallery 2')
  Server-publicUrl                              (default: '')
  Server-urlBase                                (default: '')
  Server-apiPath                               PiGallery api path. (default: '/pgapi')
  Server-customHTMLHead                         (default: '')
  Server-sessionSecret                          (default: [])
  Server-sessionTimeout                        unit: ms (default: 604800000)
  Server-port                                   (default: 80)
  PORT                                          same as Server-port
  Server-host                                   (default: '0.0.0.0')
  Server-Threading-enabled                     App can run on multiple thread (default: true)
  Server-Threading-thumbnailThreads            Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used. (default: 0)
  Server-Log-level                              (default: 'info')
  Server-Log-sqlLevel                           (default: 'error')
  Server-Log-logServerTiming                    (default: false)
  Users-authenticationRequired                  (default: true)
  Users-unAuthenticatedUserRole                 (default: 'Admin')
  Users-enforcedUsers                          Creates these users in the DB if they do not exist. If a user with this name exist, it wont be overwritten, even if the role is different. (default: [])
  Gallery-enableCache                           (default: true)
  Gallery-enableOnScrollRendering               (default: true)
  Gallery-defaultPhotoSortingMethod            Default sorting method for directory results (default: 'ascDate')
  Gallery-defaultSearchSortingMethod           Default sorting method for search results (default: 'descDate')
  Gallery-enableDirectorySortingByDate         If enabled directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo (default: false)
  Gallery-enableOnScrollThumbnailPrioritising   (default: true)
  Gallery-NavBar-showItemCount                  (default: true)
  Gallery-NavBar-links                         List of the navigation bar links (default: [{"type":1},{"type":3},{"type":2}])
  Gallery-captionFirstNaming                    (default: false)
  Gallery-enableDownloadZip                     (default: false)
  Gallery-enableDirectoryFlattening            Adds a button to flattens the file structure, by listing the content of all subdirectories. (default: false)
  Gallery-defaultSlideshowSpeed                Default time interval for displaying a photo in the slide show (default: 5)
  Media-Thumbnail-iconSize                      (default: 45)
  Media-Thumbnail-personThumbnailSize           (default: 200)
  Media-Thumbnail-thumbnailSizes                (default: [240,480])
  Media-Thumbnail-useLanczos3                  if true, 'lanczos3' will used to scale photos, otherwise faster but lowe quality 'nearest'. (default: true)
  Media-Thumbnail-quality                      Thumbnail image quality (default: 80)
  Media-Thumbnail-personFaceMargin              (default: 0.6)
  Media-Video-enabled                           (default: true)
  Media-Video-supportedFormatsWithTranscoding  Video formats that are supported after transcoding (with the build-in ffmpeg support) (default: ["avi","mkv","mov","wmv","flv","mts","m2ts","mpg","3gp","m4v","mpeg","vob","divx","xvid","ts"])
  Media-Video-supportedFormats                 Video formats that are supported also without transcoding (default: ["mp4","webm","ogv","ogg"])
  Media-Video-transcoding-bitRate               (default: 5242880)
  Media-Video-transcoding-resolution            (default: 720)
  Media-Video-transcoding-fps                   (default: 25)
  Media-Video-transcoding-codec                 (default: 'libx264')
  Media-Video-transcoding-format                (default: 'mp4')
  Media-Video-transcoding-crf                  Constant Rate Factor. The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible. (default: 23)
  Media-Video-transcoding-preset               A preset is a collection of options that will provide a certain encoding speed to compression ratio (default: 'medium')
  Media-Video-transcoding-customOptions        It will be sent to ffmpeg as it is, as custom options. (default: [])
  Media-Photo-Converting-enabled                (default: true)
  Media-Photo-Converting-onTheFly              Converts photos on the fly, when they are requested. (default: true)
  Media-Photo-Converting-resolution             (default: 1080)
  Media-Photo-loadFullImageOnZoom              Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  Media-Photo-supportedFormats                  (default: ["gif","jpeg","jpg","jpe","png","webp","svg"])
  Media-folder                                 Images are loaded from this folder (read permission required) (default: 'demo/images')
  Media-tempFolder                             Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')
  Media-photoMetadataSize                      Only this many bites will be loaded when scanning photo/video for metadata. (default: 524288)
  MetaFile-gpx                                 Reads *.gpx files and renders them on the map. (default: true)
  MetaFile-GPXCompressing-enabled               (default: true)
  MetaFile-GPXCompressing-onTheFly             Compresses gpx files on-the-fly, when they are requested. (default: true)
  MetaFile-GPXCompressing-minDistance          Filters out entry that are closer than this in meters. (default: 5)
  MetaFile-GPXCompressing-minTimeDistance      Filters out entry that are closer than this in time in milliseconds. (default: 5000)
  MetaFile-markdown                            Reads *.md files in a directory and shows the next to the map. (default: true)
  MetaFile-pg2conf                             Reads *.pg2conf files (You can use it for custom sorting and save search (albums)). (default: true)
  MetaFile-supportedFormats                     (default: ["gpx","pg2conf","md"])
  Album-enabled                                 (default: true)
  Search-enabled                                (default: true)
  Search-searchCacheTimeout                     (default: 3600000)
  Search-AutoComplete-enabled                   (default: true)
  Search-AutoComplete-targetItemsPerCategory    (default: 5)
  Search-AutoComplete-maxItems                  (default: 30)
  Search-AutoComplete-cacheTimeout              (default: 3600000)
  Search-maxMediaResult                         (default: 10000)
  Search-listDirectories                       Search returns also with directories, not just media (default: false)
  Search-listMetafiles                         Search also returns with metafiles from directories that contain a media file of the matched search result (default: true)
  Search-maxDirectoryResult                     (default: 200)
  Sharing-enabled                               (default: true)
  Sharing-passwordProtected                    Enables password protected sharing links. (default: true)
  Sharing-updateTimeout                        After creating a sharing link, it can be updated for this long (in ms). (default: 300000)
  Map-enabled                                   (default: true)
  Map-maxPreviewMarkers                        Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  Map-useImageMarkers                           (default: true)
  Map-mapProvider                               (default: 'OpenStreetMap')
  Map-mapboxAccessToken                         (default: '')
  Map-customLayers                              (default: [{"name":"street","url":""}])
  Faces-enabled                                 (default: true)
  Faces-keywordsToPersons                       (default: true)
  Faces-writeAccessMinRole                      (default: 'Admin')
  Faces-readAccessMinRole                       (default: 'User')
  RandomPhoto-enabled                          Enables random link generation. (default: true)
  Database-type                                 (default: 'sqlite')
  Database-dbFolder                             (default: 'db')
  Database-sqlite-DBFileName                    (default: 'sqlite.db')
  Database-mysql-host                           (default: 'localhost')
  MYSQL_HOST                                    same as Database-mysql-host
  Database-mysql-port                           (default: 3306)
  MYSQL_PORT                                    same as Database-mysql-port
  Database-mysql-database                       (default: 'pigallery2')
  MYSQL_DATABASE                                same as Database-mysql-database
  Database-mysql-username                       (default: '')
  MYSQL_USERNAME                                same as Database-mysql-username
  Database-mysql-password                       (default: '')
  MYSQL_PASSWORD                                same as Database-mysql-password
  Indexing-cachedFolderTimeout                  (default: 3600000)
  Indexing-reIndexingSensitivity                (default: 'low')
  Indexing-excludeFolderList                   If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$RECYCLE.BIN"])
  Indexing-excludeFileList                     Any folder that contains a file with this name will be excluded from indexing. (default: [])
  Preview-SearchQuery                           (default: {"type":100,"text":""})
  Preview-Sorting                               (default: [6,4])
  Duplicates-listingLimit                       (default: 1000)
  Jobs-maxSavedProgress                        Job history size (default: 20)
  Jobs-mediaProcessingBatchSize                Job loads this many photos or videos form the DB for processing (default: 1000)
  Jobs-scheduled                                (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Preview Filling","jobName":"Preview Filling","config":{},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Preview Filling"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}}])
```

 ### `config.json` sample:
```json
{
    "Server": {
        "applicationTitle": "PiGallery 2",
        "publicUrl": "",
        "urlBase": "",
        "//[apiPath]": "PiGallery api path.",
        "apiPath": "/pgapi",
        "customHTMLHead": "",
        "sessionSecret": [],
        "//[sessionTimeout]": "unit: ms",
        "sessionTimeout": 604800000,
        "port": 80,
        "host": "0.0.0.0",
        "Threading": {
            "//[enabled]": "App can run on multiple thread",
            "enabled": true,
            "//[thumbnailThreads]": "Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used.",
            "thumbnailThreads": 0
        },
        "Log": {
            "level": "info",
            "sqlLevel": "error",
            "logServerTiming": false
        }
    },
    "Users": {
        "authenticationRequired": true,
        "unAuthenticatedUserRole": "Admin",
        "//[enforcedUsers]": "Creates these users in the DB if they do not exist. If a user with this name exist, it wont be overwritten, even if the role is different.",
        "enforcedUsers": []
    },
    "Gallery": {
        "enableCache": true,
        "enableOnScrollRendering": true,
        "//[defaultPhotoSortingMethod]": "Default sorting method for directory results",
        "defaultPhotoSortingMethod": "ascDate",
        "//[defaultSearchSortingMethod]": "Default sorting method for search results",
        "defaultSearchSortingMethod": "descDate",
        "//[enableDirectorySortingByDate]": "If enabled directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo",
        "enableDirectorySortingByDate": false,
        "enableOnScrollThumbnailPrioritising": true,
        "NavBar": {
            "showItemCount": true,
            "//[links]": "List of the navigation bar links",
            "links": [
                {
                    "type": "gallery"
                },
                {
                    "type": "albums"
                },
                {
                    "type": "faces"
                }
            ]
        },
        "captionFirstNaming": false,
        "enableDownloadZip": false,
        "//[enableDirectoryFlattening]": "Adds a button to flattens the file structure, by listing the content of all subdirectories.",
        "enableDirectoryFlattening": false,
        "//[defaultSlideshowSpeed]": "Default time interval for displaying a photo in the slide show",
        "defaultSlideshowSpeed": 5
    },
    "Media": {
        "Thumbnail": {
            "iconSize": 45,
            "personThumbnailSize": 200,
            "thumbnailSizes": [
                240,
                480
            ],
            "//[useLanczos3]": "if true, 'lanczos3' will used to scale photos, otherwise faster but lowe quality 'nearest'.",
            "useLanczos3": true,
            "//[quality]": "Thumbnail image quality",
            "quality": 80,
            "personFaceMargin": 0.6
        },
        "Video": {
            "enabled": true,
            "//[supportedFormatsWithTranscoding]": "Video formats that are supported after transcoding (with the build-in ffmpeg support)",
            "supportedFormatsWithTranscoding": [
                "avi",
                "mkv",
                "mov",
                "wmv",
                "flv",
                "mts",
                "m2ts",
                "mpg",
                "3gp",
                "m4v",
                "mpeg",
                "vob",
                "divx",
                "xvid",
                "ts"
            ],
            "//[supportedFormats]": "Video formats that are supported also without transcoding",
            "supportedFormats": [
                "mp4",
                "webm",
                "ogv",
                "ogg"
            ],
            "transcoding": {
                "bitRate": 5242880,
                "resolution": 720,
                "fps": 25,
                "codec": "libx264",
                "format": "mp4",
                "//[crf]": "Constant Rate Factor. The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible.",
                "crf": 23,
                "//[preset]": "A preset is a collection of options that will provide a certain encoding speed to compression ratio",
                "preset": "medium",
                "//[customOptions]": "It will be sent to ffmpeg as it is, as custom options.",
                "customOptions": []
            }
        },
        "Photo": {
            "Converting": {
                "enabled": true,
                "//[onTheFly]": "Converts photos on the fly, when they are requested.",
                "onTheFly": true,
                "resolution": 1080
            },
            "//[loadFullImageOnZoom]": "Enables loading the full resolution image on zoom in the ligthbox (preview).",
            "loadFullImageOnZoom": true,
            "supportedFormats": [
                "gif",
                "jpeg",
                "jpg",
                "jpe",
                "png",
                "webp",
                "svg"
            ]
        },
        "//[folder]": "Images are loaded from this folder (read permission required)",
        "folder": "demo/images",
        "//[tempFolder]": "Thumbnails, converted photos, videos will be stored here (write permission required)",
        "tempFolder": "demo/tmp",
        "//[photoMetadataSize]": "Only this many bites will be loaded when scanning photo/video for metadata.",
        "photoMetadataSize": 524288
    },
    "MetaFile": {
        "//[gpx]": "Reads *.gpx files and renders them on the map.",
        "gpx": true,
        "GPXCompressing": {
            "enabled": true,
            "//[onTheFly]": "Compresses gpx files on-the-fly, when they are requested.",
            "onTheFly": true,
            "//[minDistance]": "Filters out entry that are closer than this in meters.",
            "minDistance": 5,
            "//[minTimeDistance]": "Filters out entry that are closer than this in time in milliseconds.",
            "minTimeDistance": 5000
        },
        "//[markdown]": "Reads *.md files in a directory and shows the next to the map.",
        "markdown": true,
        "//[pg2conf]": "Reads *.pg2conf files (You can use it for custom sorting and save search (albums)).",
        "pg2conf": true,
        "supportedFormats": [
            "gpx",
            "pg2conf",
            "md"
        ]
    },
    "Album": {
        "enabled": true
    },
    "Search": {
        "enabled": true,
        "searchCacheTimeout": 3600000,
        "AutoComplete": {
            "enabled": true,
            "targetItemsPerCategory": 5,
            "maxItems": 30,
            "cacheTimeout": 3600000
        },
        "maxMediaResult": 10000,
        "//[listDirectories]": "Search returns also with directories, not just media",
        "listDirectories": false,
        "//[listMetafiles]": "Search also returns with metafiles from directories that contain a media file of the matched search result",
        "listMetafiles": true,
        "maxDirectoryResult": 200
    },
    "Sharing": {
        "enabled": true,
        "//[passwordProtected]": "Enables password protected sharing links.",
        "passwordProtected": true,
        "//[updateTimeout]": [
            "After creating a sharing link, it can be updated for this long (in ms)."
        ],
        "updateTimeout": 300000
    },
    "Map": {
        "enabled": true,
        "//[maxPreviewMarkers]": "Maximum number of markers to be shown on the map preview on the gallery page.",
        "maxPreviewMarkers": 50,
        "useImageMarkers": true,
        "mapProvider": "OpenStreetMap",
        "mapboxAccessToken": "",
        "customLayers": [
            {
                "name": "street",
                "url": ""
            }
        ]
    },
    "Faces": {
        "enabled": true,
        "keywordsToPersons": true,
        "writeAccessMinRole": "Admin",
        "readAccessMinRole": "User"
    },
    "RandomPhoto": {
        "//[enabled]": "Enables random link generation.",
        "enabled": true
    },
    "Database": {
        "type": "sqlite",
        "dbFolder": "db",
        "sqlite": {
            "DBFileName": "sqlite.db"
        },
        "mysql": {
            "host": "localhost",
            "port": 3306,
            "database": "pigallery2",
            "username": "",
            "password": ""
        }
    },
    "Indexing": {
        "cachedFolderTimeout": 3600000,
        "reIndexingSensitivity": "low",
        "//[excludeFolderList]": "If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded.",
        "excludeFolderList": [
            ".Trash-1000",
            ".dtrash",
            "$RECYCLE.BIN"
        ],
        "//[excludeFileList]": "Any folder that contains a file with this name will be excluded from indexing.",
        "excludeFileList": []
    },
    "Preview": {
        "SearchQuery": {
            "type": 100,
            "text": ""
        },
        "Sorting": [
            6,
            4
        ]
    },
    "Duplicates": {
        "listingLimit": 1000
    },
    "Jobs": {
        "//[maxSavedProgress]": "Job history size",
        "maxSavedProgress": 20,
        "//[mediaProcessingBatchSize]": "Job loads this many photos or videos form the DB for processing",
        "mediaProcessingBatchSize": 1000,
        "scheduled": [
            {
                "name": "Indexing",
                "jobName": "Indexing",
                "config": {
                    "indexChangesOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "never"
                }
            },
            {
                "name": "Preview Filling",
                "jobName": "Preview Filling",
                "config": {},
                "allowParallelRun": false,
                "trigger": {
                    "type": "never"
                }
            },
            {
                "name": "Thumbnail Generation",
                "jobName": "Thumbnail Generation",
                "config": {
                    "sizes": [
                        240
                    ],
                    "indexedOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "after",
                    "afterScheduleName": "Preview Filling"
                }
            },
            {
                "name": "Photo Converting",
                "jobName": "Photo Converting",
                "config": {
                    "indexedOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "after",
                    "afterScheduleName": "Thumbnail Generation"
                }
            },
            {
                "name": "Video Converting",
                "jobName": "Video Converting",
                "config": {
                    "indexedOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "after",
                    "afterScheduleName": "Photo Converting"
                }
            },
            {
                "name": "Temp Folder Cleaning",
                "jobName": "Temp Folder Cleaning",
                "config": {
                    "indexedOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "after",
                    "afterScheduleName": "Video Converting"
                }
            }
        ]
    }
}```