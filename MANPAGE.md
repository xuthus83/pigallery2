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
  --Server-publicUrl                               If you access the page form local network its good to know the public url for creating sharing link. (default: '')
  --Server-urlBase                                 If you access the gallery under a sub url (like: http://mydomain.com/myGallery), set it here. If it is not working you might miss the '/' from the beginning of the url. (default: '')
  --Server-apiPath                                 PiGallery api path. (default: '/pgapi')
  --Server-customHTMLHead                          Injects the content of this between the <head></head> HTML tags of the app. (You can use it add analytics or custom code to the app). (default: '')
  --Server-sessionSecret                            (default: [])
  --Server-sessionTimeout                          Users kept logged in for this long time. (default: 604800000)
  --Server-port                                    Port number. Port 80 is usually what you need. (default: 80)
  --Server-host                                    Server will accept connections from this IPv6 or IPv4 address. (default: '0.0.0.0')
  --Server-Threading-enabled                       Runs directory scanning and thumbnail generation in a different thread. (default: true)
  --Server-Threading-thumbnailThreads              Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used. (default: 0)
  --Server-Log-level                               Logging level. (default: 'info')
  --Server-Log-sqlLevel                            Logging level for SQL queries. (default: 'error')
  --Server-Log-logServerTiming                     If enabled, the app ads "Server-Timing" http header to the response. (default: false)
  --Users-authenticationRequired                   Enables user management with login to password protect the gallery. (default: true)
  --Users-unAuthenticatedUserRole                  Default user right when password protection is disabled. (default: 'Admin')
  --Users-enforcedUsers                            Creates these users in the DB during startup if they do not exist. If a user with this name exist, it won't be overwritten, even if the role is different. (default: [])
  --Gallery-enableCache                            Caches directory contents and search results for better performance. (default: true)
  --Gallery-enableOnScrollRendering                Those thumbnails get higher priority that are visible on the screen. (default: true)
  --Gallery-defaultPhotoSortingMethod              Default sorting method for photo and video in a directory results. (default: 'ascDate')
  --Gallery-defaultSearchSortingMethod             Default sorting method for photo and video in a search results. (default: 'descDate')
  --Gallery-enableDirectorySortingByDate           If enabled, directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo. (default: false)
  --Gallery-enableOnScrollThumbnailPrioritising    Those thumbnails will be rendered first that are in view. (default: true)
  --Gallery-NavBar-showItemCount                   Shows the number photos and videos on the navigation bar. (default: true)
  --Gallery-NavBar-links                           Visible links in the top menu. (default: [{"type":1},{"type":3},{"type":2}])
  --Gallery-captionFirstNaming                     Show the caption (IPTC 120) tags from the EXIF data instead of the filenames. (default: false)
  --Gallery-enableDownloadZip                      Enable download zip of a directory contents Directory flattening. (Does not work for searches.) (default: false)
  --Gallery-enableDirectoryFlattening              Adds a button to flattens the file structure, by listing the content of all subdirectories. (Won't work if the gallery has multiple folders with the same path.) (default: false)
  --Gallery-Lightbox-defaultSlideshowSpeed         Default time interval for displaying a photo in the slide show. (default: 5)
  --Gallery-Lightbox-captionAlwaysOn               If enabled, lightbox will always show caption by default, not only on hover. (default: false)
  --Gallery-Lightbox-facesAlwaysOn                 If enabled, lightbox will always show faces by default, not only on hover. (default: false)
  --Gallery-Lightbox-loopVideos                    If enabled, lightbox will loop videos by default. (default: false)
  --Media-Thumbnail-iconSize                       Icon size (used on maps). (default: 45)
  --Media-Thumbnail-personThumbnailSize            Person (face) thumbnail size. (default: 200)
  --Media-Thumbnail-thumbnailSizes                 Size of the thumbnails. The best matching size will be generated. More sizes give better quality, but use more storage and CPU to render. If size is 240, that shorter side of the thumbnail will have 160 pixels. (default: [240,480])
  --Media-Thumbnail-useLanczos3                    if true, 'lanczos3' will used to scale photos, otherwise faster but lower quality 'nearest'. (default: true)
  --Media-Thumbnail-quality                        Between 0-100. (default: 80)
  --Media-Thumbnail-personFaceMargin               Person face size ratio on the face thumbnail. (default: 0.6)
  --Media-Video-enabled                             (default: true)
  --Media-Video-supportedFormatsWithTranscoding    Video formats that are supported after transcoding (with the build-in ffmpeg support). (default: ["avi","mkv","mov","wmv","flv","mts","m2ts","mpg","3gp","m4v","mpeg","vob","divx","xvid","ts"])
  --Media-Video-supportedFormats                   Video formats that are supported also without transcoding. Browser supported formats: https://www.w3schools.com/html/html5_video.asp (default: ["mp4","webm","ogv","ogg"])
  --Media-Video-transcoding-bitRate                Target bit rate of the output video will be scaled down this this. This should be less than the upload rate of your home server. (default: 5242880)
  --Media-Video-transcoding-resolution             The height of the output video will be scaled down to this, while keeping the aspect ratio. (default: 720)
  --Media-Video-transcoding-fps                    Target frame per second (fps) of the output video will be scaled down this this. (default: 25)
  --Media-Video-transcoding-format                  (default: 'mp4')
  --Media-Video-transcoding-mp4Codec                (default: 'libx264')
  --Media-Video-transcoding-webmCodec               (default: 'libvpx')
  --Media-Video-transcoding-crf                    The range of the Constant Rate Factor (CRF) scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible. (default: 23)
  --Media-Video-transcoding-preset                 A preset is a collection of options that will provide a certain encoding speed to compression ratio. A slower preset will provide better compression (compression is quality per filesize). (default: 'medium')
  --Media-Video-transcoding-customOutputOptions    It will be sent to ffmpeg as it is, as custom output options. (default: [])
  --Media-Video-transcoding-customInputOptions     It will be sent to ffmpeg as it is, as custom input options. (default: [])
  --Media-Photo-Converting-enabled                 Enable photo converting. (default: true)
  --Media-Photo-Converting-loadFullImageOnZoom     Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  --Media-Photo-Converting-onTheFly                Converts photos on the fly, when they are requested. (default: true)
  --Media-Photo-Converting-resolution              The shorter edge of the converted photo will be scaled down to this, while keeping the aspect ratio. (default: 1080)
  --Media-Photo-supportedFormats                   Photo formats that are supported. Browser needs to support these formats natively. Also sharp (libvips) package should be able to convert these formats. (default: ["gif","jpeg","jpg","jpe","png","webp","svg"])
  --Media-folder                                   Images are loaded from this folder (read permission required) (default: 'demo/images')
  --Media-tempFolder                               Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')
  --Media-photoMetadataSize                        Only this many bites will be loaded when scanning photo/video for metadata. Increase this number if your photos shows up as square. (default: 524288)
  --MetaFile-gpx                                   Reads *.gpx files and renders them on the map. (default: true)
  --MetaFile-GPXCompressing-enabled                Enables lossy (based on delta time and distance. Too frequent points are removed) GPX compression. (default: true)
  --MetaFile-GPXCompressing-onTheFly               Enables on the fly *.gpx compression. (default: true)
  --MetaFile-GPXCompressing-minDistance            Filters out entry that are closer than this in meters. (default: 5)
  --MetaFile-GPXCompressing-minTimeDistance        Filters out entry that are closer than this in time in milliseconds. (default: 5000)
  --MetaFile-markdown                              Reads *.md files in a directory and shows the next to the map. (default: true)
  --MetaFile-pg2conf                               Reads *.pg2conf files (You can use it for custom sorting and saved search (albums)). (default: true)
  --MetaFile-supportedFormats                      The app will read and process these files. (default: ["gpx","pg2conf","md"])
  --Album-enabled                                   (default: true)
  --Search-enabled                                 Enables searching. (default: true)
  --Search-searchCacheTimeout                      Search cache timeout. (default: 3600000)
  --Search-AutoComplete-enabled                    Show hints while typing search query. (default: true)
  --Search-AutoComplete-targetItemsPerCategory     Maximum number autocomplete items shown per category. (default: 5)
  --Search-AutoComplete-maxItems                   Maximum number autocomplete items shown at once. (default: 30)
  --Search-AutoComplete-cacheTimeout               Autocomplete cache timeout.  (default: 3600000)
  --Search-maxMediaResult                          Maximum number of photos and videos that are listed in one search result. (default: 10000)
  --Search-maxDirectoryResult                      Maximum number of directories that are listed in one search result. (default: 200)
  --Search-listDirectories                         Search returns also with directories, not just media. (default: false)
  --Search-listMetafiles                           Search also returns with metafiles from directories that contain a media file of the matched search result. (default: true)
  --Sharing-enabled                                Enables sharing. (default: true)
  --Sharing-passwordProtected                      Enables password protected sharing links. (default: true)
  --Sharing-updateTimeout                          After creating a sharing link, it can be updated for this long. (default: 300000)
  --Map-enabled                                     (default: true)
  --Map-useImageMarkers                            Map will use thumbnail images as markers instead of the default pin. (default: true)
  --Map-mapProvider                                 (default: 'OpenStreetMap')
  --Map-mapboxAccessToken                          MapBox needs an access token to work, create one at https://www.mapbox.com. (default: '')
  --Map-customLayers                               The map module will use these urls to fetch the map tiles. (default: [{"name":"street","url":""}])
  --Map-maxPreviewMarkers                          Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  --Faces-enabled                                   (default: true)
  --Faces-keywordsToPersons                        If a photo has the same face (person) name and keyword, the app removes the duplicate, keeping the face only. (default: true)
  --Faces-writeAccessMinRole                       Required minimum right to star (favourite) a face. (default: 'Admin')
  --Faces-readAccessMinRole                        Required minimum right to show the faces tab. (default: 'User')
  --RandomPhoto-enabled                            Enables random link generation. (default: true)
  --Database-type                                  SQLite is recommended. (default: 'sqlite')
  --Database-dbFolder                              All file-based data will be stored here (sqlite database, job history data). (default: 'db')
  --Database-sqlite-DBFileName                     Sqlite will save the db with this filename. (default: 'sqlite.db')
  --Database-mysql-host                             (default: 'localhost')
  --Database-mysql-port                             (default: 3306)
  --Database-mysql-database                         (default: 'pigallery2')
  --Database-mysql-username                         (default: '')
  --Database-mysql-password                         (default: '')
  --Indexing-cachedFolderTimeout                   If there was no indexing in this time, it reindexes. (skipped if indexes are in DB and sensitivity is low). (default: 3600000)
  --Indexing-reIndexingSensitivity                 Set the reindexing sensitivity. High value check the folders for change more often. (default: 'low')
  --Indexing-excludeFolderList                     Folders to exclude from indexing. If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$RECYCLE.BIN"])
  --Indexing-excludeFileList                       Files that mark a folder to be excluded from indexing. Any folder that contains a file with this name will be excluded from indexing. (default: [])
  --Preview-SearchQuery                            Filters the sub-folders with this search query. If filter results no photo, the app will search again without the filter. (default: {"type":100,"text":""})
  --Preview-Sorting                                If multiple preview is available sorts them by these methods and selects the first one. (default: [6,4])
  --Duplicates-listingLimit                        Maximum number of duplicates to list. (default: 1000)
  --Jobs-maxSavedProgress                          Job history size. (default: 20)
  --Jobs-mediaProcessingBatchSize                  Jobs load this many photos or videos form the DB for processing at once. (default: 1000)
  --Jobs-scheduled                                  (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Preview Filling","jobName":"Preview Filling","config":{},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Indexing"}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Preview Filling"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"GPX Compression","jobName":"GPX Compression","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"GPX Compression"}}])

Environmental variables: 
  Server-applicationTitle                       (default: 'PiGallery 2')
  Server-publicUrl                             If you access the page form local network its good to know the public url for creating sharing link. (default: '')
  Server-urlBase                               If you access the gallery under a sub url (like: http://mydomain.com/myGallery), set it here. If it is not working you might miss the '/' from the beginning of the url. (default: '')
  Server-apiPath                               PiGallery api path. (default: '/pgapi')
  Server-customHTMLHead                        Injects the content of this between the <head></head> HTML tags of the app. (You can use it add analytics or custom code to the app). (default: '')
  Server-sessionSecret                          (default: [])
  Server-sessionTimeout                        Users kept logged in for this long time. (default: 604800000)
  Server-port                                  Port number. Port 80 is usually what you need. (default: 80)
  PORT                                          same as Server-port
  Server-host                                  Server will accept connections from this IPv6 or IPv4 address. (default: '0.0.0.0')
  Server-Threading-enabled                     Runs directory scanning and thumbnail generation in a different thread. (default: true)
  Server-Threading-thumbnailThreads            Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used. (default: 0)
  Server-Log-level                             Logging level. (default: 'info')
  Server-Log-sqlLevel                          Logging level for SQL queries. (default: 'error')
  Server-Log-logServerTiming                   If enabled, the app ads "Server-Timing" http header to the response. (default: false)
  Users-authenticationRequired                 Enables user management with login to password protect the gallery. (default: true)
  Users-unAuthenticatedUserRole                Default user right when password protection is disabled. (default: 'Admin')
  Users-enforcedUsers                          Creates these users in the DB during startup if they do not exist. If a user with this name exist, it won't be overwritten, even if the role is different. (default: [])
  Gallery-enableCache                          Caches directory contents and search results for better performance. (default: true)
  Gallery-enableOnScrollRendering              Those thumbnails get higher priority that are visible on the screen. (default: true)
  Gallery-defaultPhotoSortingMethod            Default sorting method for photo and video in a directory results. (default: 'ascDate')
  Gallery-defaultSearchSortingMethod           Default sorting method for photo and video in a search results. (default: 'descDate')
  Gallery-enableDirectorySortingByDate         If enabled, directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo. (default: false)
  Gallery-enableOnScrollThumbnailPrioritising  Those thumbnails will be rendered first that are in view. (default: true)
  Gallery-NavBar-showItemCount                 Shows the number photos and videos on the navigation bar. (default: true)
  Gallery-NavBar-links                         Visible links in the top menu. (default: [{"type":1},{"type":3},{"type":2}])
  Gallery-captionFirstNaming                   Show the caption (IPTC 120) tags from the EXIF data instead of the filenames. (default: false)
  Gallery-enableDownloadZip                    Enable download zip of a directory contents Directory flattening. (Does not work for searches.) (default: false)
  Gallery-enableDirectoryFlattening            Adds a button to flattens the file structure, by listing the content of all subdirectories. (Won't work if the gallery has multiple folders with the same path.) (default: false)
  Gallery-Lightbox-defaultSlideshowSpeed       Default time interval for displaying a photo in the slide show. (default: 5)
  Gallery-Lightbox-captionAlwaysOn             If enabled, lightbox will always show caption by default, not only on hover. (default: false)
  Gallery-Lightbox-facesAlwaysOn               If enabled, lightbox will always show faces by default, not only on hover. (default: false)
  Gallery-Lightbox-loopVideos                  If enabled, lightbox will loop videos by default. (default: false)
  Media-Thumbnail-iconSize                     Icon size (used on maps). (default: 45)
  Media-Thumbnail-personThumbnailSize          Person (face) thumbnail size. (default: 200)
  Media-Thumbnail-thumbnailSizes               Size of the thumbnails. The best matching size will be generated. More sizes give better quality, but use more storage and CPU to render. If size is 240, that shorter side of the thumbnail will have 160 pixels. (default: [240,480])
  Media-Thumbnail-useLanczos3                  if true, 'lanczos3' will used to scale photos, otherwise faster but lower quality 'nearest'. (default: true)
  Media-Thumbnail-quality                      Between 0-100. (default: 80)
  Media-Thumbnail-personFaceMargin             Person face size ratio on the face thumbnail. (default: 0.6)
  Media-Video-enabled                           (default: true)
  Media-Video-supportedFormatsWithTranscoding  Video formats that are supported after transcoding (with the build-in ffmpeg support). (default: ["avi","mkv","mov","wmv","flv","mts","m2ts","mpg","3gp","m4v","mpeg","vob","divx","xvid","ts"])
  Media-Video-supportedFormats                 Video formats that are supported also without transcoding. Browser supported formats: https://www.w3schools.com/html/html5_video.asp (default: ["mp4","webm","ogv","ogg"])
  Media-Video-transcoding-bitRate              Target bit rate of the output video will be scaled down this this. This should be less than the upload rate of your home server. (default: 5242880)
  Media-Video-transcoding-resolution           The height of the output video will be scaled down to this, while keeping the aspect ratio. (default: 720)
  Media-Video-transcoding-fps                  Target frame per second (fps) of the output video will be scaled down this this. (default: 25)
  Media-Video-transcoding-format                (default: 'mp4')
  Media-Video-transcoding-mp4Codec              (default: 'libx264')
  Media-Video-transcoding-webmCodec             (default: 'libvpx')
  Media-Video-transcoding-crf                  The range of the Constant Rate Factor (CRF) scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible. (default: 23)
  Media-Video-transcoding-preset               A preset is a collection of options that will provide a certain encoding speed to compression ratio. A slower preset will provide better compression (compression is quality per filesize). (default: 'medium')
  Media-Video-transcoding-customOutputOptions  It will be sent to ffmpeg as it is, as custom output options. (default: [])
  Media-Video-transcoding-customInputOptions   It will be sent to ffmpeg as it is, as custom input options. (default: [])
  Media-Photo-Converting-enabled               Enable photo converting. (default: true)
  Media-Photo-Converting-loadFullImageOnZoom   Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  Media-Photo-Converting-onTheFly              Converts photos on the fly, when they are requested. (default: true)
  Media-Photo-Converting-resolution            The shorter edge of the converted photo will be scaled down to this, while keeping the aspect ratio. (default: 1080)
  Media-Photo-supportedFormats                 Photo formats that are supported. Browser needs to support these formats natively. Also sharp (libvips) package should be able to convert these formats. (default: ["gif","jpeg","jpg","jpe","png","webp","svg"])
  Media-folder                                 Images are loaded from this folder (read permission required) (default: 'demo/images')
  Media-tempFolder                             Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')
  Media-photoMetadataSize                      Only this many bites will be loaded when scanning photo/video for metadata. Increase this number if your photos shows up as square. (default: 524288)
  MetaFile-gpx                                 Reads *.gpx files and renders them on the map. (default: true)
  MetaFile-GPXCompressing-enabled              Enables lossy (based on delta time and distance. Too frequent points are removed) GPX compression. (default: true)
  MetaFile-GPXCompressing-onTheFly             Enables on the fly *.gpx compression. (default: true)
  MetaFile-GPXCompressing-minDistance          Filters out entry that are closer than this in meters. (default: 5)
  MetaFile-GPXCompressing-minTimeDistance      Filters out entry that are closer than this in time in milliseconds. (default: 5000)
  MetaFile-markdown                            Reads *.md files in a directory and shows the next to the map. (default: true)
  MetaFile-pg2conf                             Reads *.pg2conf files (You can use it for custom sorting and saved search (albums)). (default: true)
  MetaFile-supportedFormats                    The app will read and process these files. (default: ["gpx","pg2conf","md"])
  Album-enabled                                 (default: true)
  Search-enabled                               Enables searching. (default: true)
  Search-searchCacheTimeout                    Search cache timeout. (default: 3600000)
  Search-AutoComplete-enabled                  Show hints while typing search query. (default: true)
  Search-AutoComplete-targetItemsPerCategory   Maximum number autocomplete items shown per category. (default: 5)
  Search-AutoComplete-maxItems                 Maximum number autocomplete items shown at once. (default: 30)
  Search-AutoComplete-cacheTimeout             Autocomplete cache timeout.  (default: 3600000)
  Search-maxMediaResult                        Maximum number of photos and videos that are listed in one search result. (default: 10000)
  Search-maxDirectoryResult                    Maximum number of directories that are listed in one search result. (default: 200)
  Search-listDirectories                       Search returns also with directories, not just media. (default: false)
  Search-listMetafiles                         Search also returns with metafiles from directories that contain a media file of the matched search result. (default: true)
  Sharing-enabled                              Enables sharing. (default: true)
  Sharing-passwordProtected                    Enables password protected sharing links. (default: true)
  Sharing-updateTimeout                        After creating a sharing link, it can be updated for this long. (default: 300000)
  Map-enabled                                   (default: true)
  Map-useImageMarkers                          Map will use thumbnail images as markers instead of the default pin. (default: true)
  Map-mapProvider                               (default: 'OpenStreetMap')
  Map-mapboxAccessToken                        MapBox needs an access token to work, create one at https://www.mapbox.com. (default: '')
  Map-customLayers                             The map module will use these urls to fetch the map tiles. (default: [{"name":"street","url":""}])
  Map-maxPreviewMarkers                        Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  Faces-enabled                                 (default: true)
  Faces-keywordsToPersons                      If a photo has the same face (person) name and keyword, the app removes the duplicate, keeping the face only. (default: true)
  Faces-writeAccessMinRole                     Required minimum right to star (favourite) a face. (default: 'Admin')
  Faces-readAccessMinRole                      Required minimum right to show the faces tab. (default: 'User')
  RandomPhoto-enabled                          Enables random link generation. (default: true)
  Database-type                                SQLite is recommended. (default: 'sqlite')
  Database-dbFolder                            All file-based data will be stored here (sqlite database, job history data). (default: 'db')
  Database-sqlite-DBFileName                   Sqlite will save the db with this filename. (default: 'sqlite.db')
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
  Indexing-cachedFolderTimeout                 If there was no indexing in this time, it reindexes. (skipped if indexes are in DB and sensitivity is low). (default: 3600000)
  Indexing-reIndexingSensitivity               Set the reindexing sensitivity. High value check the folders for change more often. (default: 'low')
  Indexing-excludeFolderList                   Folders to exclude from indexing. If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$RECYCLE.BIN"])
  Indexing-excludeFileList                     Files that mark a folder to be excluded from indexing. Any folder that contains a file with this name will be excluded from indexing. (default: [])
  Preview-SearchQuery                          Filters the sub-folders with this search query. If filter results no photo, the app will search again without the filter. (default: {"type":100,"text":""})
  Preview-Sorting                              If multiple preview is available sorts them by these methods and selects the first one. (default: [6,4])
  Duplicates-listingLimit                      Maximum number of duplicates to list. (default: 1000)
  Jobs-maxSavedProgress                        Job history size. (default: 20)
  Jobs-mediaProcessingBatchSize                Jobs load this many photos or videos form the DB for processing at once. (default: 1000)
  Jobs-scheduled                                (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":false,"trigger":{"type":1}},{"name":"Preview Filling","jobName":"Preview Filling","config":{},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Indexing"}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Preview Filling"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"GPX Compression","jobName":"GPX Compression","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"GPX Compression"}}])
```

 ### `config.json` sample:
```json
{
    "Server": {
        "applicationTitle": "PiGallery 2",
        "//[publicUrl]": [
            "If you access the page form local network its good to know the public url for creating sharing link."
        ],
        "publicUrl": "",
        "//[urlBase]": [
            "If you access the gallery under a sub url (like: http://mydomain.com/myGallery), set it here. If it is not working you might miss the '/' from the beginning of the url."
        ],
        "urlBase": "",
        "//[apiPath]": "PiGallery api path.",
        "apiPath": "/pgapi",
        "//[customHTMLHead]": [
            "Injects the content of this between the <head></head> HTML tags of the app. (You can use it add analytics or custom code to the app)."
        ],
        "customHTMLHead": "",
        "sessionSecret": [],
        "//[sessionTimeout]": [
            "Users kept logged in for this long time."
        ],
        "sessionTimeout": 604800000,
        "//[port]": [
            "Port number. Port 80 is usually what you need."
        ],
        "port": 80,
        "//[host]": [
            "Server will accept connections from this IPv6 or IPv4 address."
        ],
        "host": "0.0.0.0",
        "Threading": {
            "//[enabled]": [
                "Runs directory scanning and thumbnail generation in a different thread."
            ],
            "enabled": true,
            "//[thumbnailThreads]": [
                "Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used."
            ],
            "thumbnailThreads": 0
        },
        "Log": {
            "//[level]": [
                "Logging level."
            ],
            "level": "info",
            "//[sqlLevel]": [
                "Logging level for SQL queries."
            ],
            "sqlLevel": "error",
            "//[logServerTiming]": [
                "If enabled, the app ads \"Server-Timing\" http header to the response."
            ],
            "logServerTiming": false
        }
    },
    "Users": {
        "//[authenticationRequired]": [
            "Enables user management with login to password protect the gallery."
        ],
        "authenticationRequired": true,
        "//[unAuthenticatedUserRole]": [
            "Default user right when password protection is disabled."
        ],
        "unAuthenticatedUserRole": "Admin",
        "//[enforcedUsers]": [
            "Creates these users in the DB during startup if they do not exist. If a user with this name exist, it won't be overwritten, even if the role is different."
        ],
        "enforcedUsers": []
    },
    "Gallery": {
        "//[enableCache]": [
            "Caches directory contents and search results for better performance."
        ],
        "enableCache": true,
        "//[enableOnScrollRendering]": [
            "Those thumbnails get higher priority that are visible on the screen."
        ],
        "enableOnScrollRendering": true,
        "//[defaultPhotoSortingMethod]": [
            "Default sorting method for photo and video in a directory results."
        ],
        "defaultPhotoSortingMethod": "ascDate",
        "//[defaultSearchSortingMethod]": [
            "Default sorting method for photo and video in a search results."
        ],
        "defaultSearchSortingMethod": "descDate",
        "//[enableDirectorySortingByDate]": [
            "If enabled, directories will be sorted by date, like photos, otherwise by name. Directory date is the last modification time of that directory not the creation date of the oldest photo."
        ],
        "enableDirectorySortingByDate": false,
        "//[enableOnScrollThumbnailPrioritising]": [
            "Those thumbnails will be rendered first that are in view."
        ],
        "enableOnScrollThumbnailPrioritising": true,
        "NavBar": {
            "//[showItemCount]": [
                "Shows the number photos and videos on the navigation bar."
            ],
            "showItemCount": true,
            "//[links]": [
                "Visible links in the top menu."
            ],
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
        "//[captionFirstNaming]": [
            "Show the caption (IPTC 120) tags from the EXIF data instead of the filenames."
        ],
        "captionFirstNaming": false,
        "//[enableDownloadZip]": [
            "Enable download zip of a directory contents Directory flattening. (Does not work for searches.)"
        ],
        "enableDownloadZip": false,
        "//[enableDirectoryFlattening]": [
            "Adds a button to flattens the file structure, by listing the content of all subdirectories. (Won't work if the gallery has multiple folders with the same path.)"
        ],
        "enableDirectoryFlattening": false,
        "Lightbox": {
            "//[defaultSlideshowSpeed]": [
                "Default time interval for displaying a photo in the slide show."
            ],
            "defaultSlideshowSpeed": 5,
            "//[captionAlwaysOn]": [
                "If enabled, lightbox will always show caption by default, not only on hover."
            ],
            "captionAlwaysOn": false,
            "//[facesAlwaysOn]": [
                "If enabled, lightbox will always show faces by default, not only on hover."
            ],
            "facesAlwaysOn": false,
            "//[loopVideos]": [
                "If enabled, lightbox will loop videos by default."
            ],
            "loopVideos": false
        }
    },
    "Media": {
        "Thumbnail": {
            "//[iconSize]": [
                "Icon size (used on maps)."
            ],
            "iconSize": 45,
            "//[personThumbnailSize]": [
                "Person (face) thumbnail size."
            ],
            "personThumbnailSize": 200,
            "//[thumbnailSizes]": [
                "Size of the thumbnails. The best matching size will be generated. More sizes give better quality, but use more storage and CPU to render. If size is 240, that shorter side of the thumbnail will have 160 pixels."
            ],
            "thumbnailSizes": [
                240,
                480
            ],
            "//[useLanczos3]": [
                "if true, 'lanczos3' will used to scale photos, otherwise faster but lower quality 'nearest'."
            ],
            "useLanczos3": true,
            "//[quality]": [
                "Between 0-100."
            ],
            "quality": 80,
            "//[personFaceMargin]": [
                "Person face size ratio on the face thumbnail."
            ],
            "personFaceMargin": 0.6
        },
        "//[Video]": [
            "Video support uses ffmpeg. ffmpeg and ffprobe binaries need to be available in the PATH or the @ffmpeg-installer/ffmpeg and @ffprobe-installer/ffprobe optional node packages need to be installed."
        ],
        "Video": {
            "enabled": true,
            "//[supportedFormatsWithTranscoding]": [
                "Video formats that are supported after transcoding (with the build-in ffmpeg support)."
            ],
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
            "//[supportedFormats]": [
                "Video formats that are supported also without transcoding. Browser supported formats: https://www.w3schools.com/html/html5_video.asp"
            ],
            "supportedFormats": [
                "mp4",
                "webm",
                "ogv",
                "ogg"
            ],
            "//[transcoding]": [
                "To ensure smooth video playback, video transcoding is recommended to a lower bit rate than the server's upload rate.   The transcoded videos will be save to the thumbnail folder.  You can trigger the transcoding manually, but you can also create an automatic encoding job in advanced settings mode."
            ],
            "transcoding": {
                "//[bitRate]": [
                    "Target bit rate of the output video will be scaled down this this. This should be less than the upload rate of your home server."
                ],
                "bitRate": 5242880,
                "//[resolution]": [
                    "The height of the output video will be scaled down to this, while keeping the aspect ratio."
                ],
                "resolution": 720,
                "//[fps]": [
                    "Target frame per second (fps) of the output video will be scaled down this this."
                ],
                "fps": 25,
                "format": "mp4",
                "mp4Codec": "libx264",
                "webmCodec": "libvpx",
                "//[crf]": [
                    "The range of the Constant Rate Factor (CRF) scale is 0–51, where 0 is lossless, 23 is the default, and 51 is worst quality possible."
                ],
                "crf": 23,
                "//[preset]": [
                    "A preset is a collection of options that will provide a certain encoding speed to compression ratio. A slower preset will provide better compression (compression is quality per filesize)."
                ],
                "preset": "medium",
                "//[customOutputOptions]": [
                    "It will be sent to ffmpeg as it is, as custom output options."
                ],
                "customOutputOptions": [],
                "//[customInputOptions]": [
                    "It will be sent to ffmpeg as it is, as custom input options."
                ],
                "customInputOptions": []
            }
        },
        "Photo": {
            "Converting": {
                "//[enabled]": [
                    "Enable photo converting."
                ],
                "enabled": true,
                "//[loadFullImageOnZoom]": [
                    "Enables loading the full resolution image on zoom in the ligthbox (preview)."
                ],
                "loadFullImageOnZoom": true,
                "//[onTheFly]": [
                    "Converts photos on the fly, when they are requested."
                ],
                "onTheFly": true,
                "//[resolution]": [
                    "The shorter edge of the converted photo will be scaled down to this, while keeping the aspect ratio."
                ],
                "resolution": 1080
            },
            "//[supportedFormats]": [
                "Photo formats that are supported. Browser needs to support these formats natively. Also sharp (libvips) package should be able to convert these formats."
            ],
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
        "//[folder]": [
            "Images are loaded from this folder (read permission required)"
        ],
        "folder": "demo/images",
        "//[tempFolder]": [
            "Thumbnails, converted photos, videos will be stored here (write permission required)"
        ],
        "tempFolder": "demo/tmp",
        "//[photoMetadataSize]": [
            "Only this many bites will be loaded when scanning photo/video for metadata. Increase this number if your photos shows up as square."
        ],
        "photoMetadataSize": 524288
    },
    "MetaFile": {
        "//[gpx]": [
            "Reads *.gpx files and renders them on the map."
        ],
        "gpx": true,
        "GPXCompressing": {
            "//[enabled]": [
                "Enables lossy (based on delta time and distance. Too frequent points are removed) GPX compression."
            ],
            "enabled": true,
            "//[onTheFly]": [
                "Enables on the fly *.gpx compression."
            ],
            "onTheFly": true,
            "//[minDistance]": [
                "Filters out entry that are closer than this in meters."
            ],
            "minDistance": 5,
            "//[minTimeDistance]": [
                "Filters out entry that are closer than this in time in milliseconds."
            ],
            "minTimeDistance": 5000
        },
        "//[markdown]": [
            "Reads *.md files in a directory and shows the next to the map."
        ],
        "markdown": true,
        "//[pg2conf]": [
            "Reads *.pg2conf files (You can use it for custom sorting and saved search (albums))."
        ],
        "pg2conf": true,
        "//[supportedFormats]": [
            "The app will read and process these files."
        ],
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
        "//[enabled]": [
            "Enables searching."
        ],
        "enabled": true,
        "//[searchCacheTimeout]": [
            "Search cache timeout."
        ],
        "searchCacheTimeout": 3600000,
        "AutoComplete": {
            "//[enabled]": [
                "Show hints while typing search query."
            ],
            "enabled": true,
            "//[targetItemsPerCategory]": [
                "Maximum number autocomplete items shown per category."
            ],
            "targetItemsPerCategory": 5,
            "//[maxItems]": [
                "Maximum number autocomplete items shown at once."
            ],
            "maxItems": 30,
            "//[cacheTimeout]": [
                "Autocomplete cache timeout. "
            ],
            "cacheTimeout": 3600000
        },
        "//[maxMediaResult]": [
            "Maximum number of photos and videos that are listed in one search result."
        ],
        "maxMediaResult": 10000,
        "//[maxDirectoryResult]": [
            "Maximum number of directories that are listed in one search result."
        ],
        "maxDirectoryResult": 200,
        "//[listDirectories]": [
            "Search returns also with directories, not just media."
        ],
        "listDirectories": false,
        "//[listMetafiles]": [
            "Search also returns with metafiles from directories that contain a media file of the matched search result."
        ],
        "listMetafiles": true
    },
    "Sharing": {
        "//[enabled]": [
            "Enables sharing."
        ],
        "enabled": true,
        "//[passwordProtected]": [
            "Enables password protected sharing links."
        ],
        "passwordProtected": true,
        "//[updateTimeout]": [
            "After creating a sharing link, it can be updated for this long."
        ],
        "updateTimeout": 300000
    },
    "Map": {
        "enabled": true,
        "//[useImageMarkers]": [
            "Map will use thumbnail images as markers instead of the default pin."
        ],
        "useImageMarkers": true,
        "mapProvider": "OpenStreetMap",
        "//[mapboxAccessToken]": [
            "MapBox needs an access token to work, create one at https://www.mapbox.com."
        ],
        "mapboxAccessToken": "",
        "//[customLayers]": [
            "The map module will use these urls to fetch the map tiles."
        ],
        "customLayers": [
            {
                "//[name]": [
                    "Name of a map layer."
                ],
                "name": "street",
                "//[url]": [
                    "Url of a map layer."
                ],
                "url": ""
            }
        ],
        "//[maxPreviewMarkers]": [
            "Maximum number of markers to be shown on the map preview on the gallery page."
        ],
        "maxPreviewMarkers": 50
    },
    "Faces": {
        "enabled": true,
        "//[keywordsToPersons]": [
            "If a photo has the same face (person) name and keyword, the app removes the duplicate, keeping the face only."
        ],
        "keywordsToPersons": true,
        "//[writeAccessMinRole]": [
            "Required minimum right to star (favourite) a face."
        ],
        "writeAccessMinRole": "Admin",
        "//[readAccessMinRole]": [
            "Required minimum right to show the faces tab."
        ],
        "readAccessMinRole": "User"
    },
    "//[RandomPhoto]": [
        "This feature enables you to generate 'random photo' urls. That URL returns a photo random selected from your gallery. You can use the url with 3rd party application like random changing desktop background. Note: With the current implementation, random link also requires login."
    ],
    "RandomPhoto": {
        "//[enabled]": [
            "Enables random link generation."
        ],
        "enabled": true
    },
    "Database": {
        "//[type]": [
            "SQLite is recommended."
        ],
        "type": "sqlite",
        "//[dbFolder]": [
            "All file-based data will be stored here (sqlite database, job history data)."
        ],
        "dbFolder": "db",
        "sqlite": {
            "//[DBFileName]": [
                "Sqlite will save the db with this filename."
            ],
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
        "//[cachedFolderTimeout]": [
            "If there was no indexing in this time, it reindexes. (skipped if indexes are in DB and sensitivity is low)."
        ],
        "cachedFolderTimeout": 3600000,
        "//[reIndexingSensitivity]": [
            "Set the reindexing sensitivity. High value check the folders for change more often."
        ],
        "reIndexingSensitivity": "low",
        "//[excludeFolderList]": [
            "Folders to exclude from indexing. If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded."
        ],
        "excludeFolderList": [
            ".Trash-1000",
            ".dtrash",
            "$RECYCLE.BIN"
        ],
        "//[excludeFileList]": [
            "Files that mark a folder to be excluded from indexing. Any folder that contains a file with this name will be excluded from indexing."
        ],
        "excludeFileList": []
    },
    "Preview": {
        "//[SearchQuery]": [
            "Filters the sub-folders with this search query. If filter results no photo, the app will search again without the filter."
        ],
        "SearchQuery": {
            "type": 100,
            "text": ""
        },
        "//[Sorting]": [
            "If multiple preview is available sorts them by these methods and selects the first one."
        ],
        "Sorting": [
            6,
            4
        ]
    },
    "Duplicates": {
        "//[listingLimit]": [
            "Maximum number of duplicates to list."
        ],
        "listingLimit": 1000
    },
    "Jobs": {
        "//[maxSavedProgress]": [
            "Job history size."
        ],
        "maxSavedProgress": 20,
        "//[mediaProcessingBatchSize]": [
            "Jobs load this many photos or videos form the DB for processing at once."
        ],
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
                    "type": "after",
                    "afterScheduleName": "Indexing"
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
                "name": "GPX Compression",
                "jobName": "GPX Compression",
                "config": {
                    "indexedOnly": true
                },
                "allowParallelRun": false,
                "trigger": {
                    "type": "after",
                    "afterScheduleName": "Video Converting"
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
                    "afterScheduleName": "GPX Compression"
                }
            }
        ]
    }
}```