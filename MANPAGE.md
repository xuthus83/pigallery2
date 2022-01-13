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
  --Server-sessionSecret                                 (default: [])
  --Server-port                                          (default: 80)
  --Server-host                                          (default: '0.0.0.0')
  --Server-Media-folder                                 Images are loaded from this folder (read permission required) (default: 'demo/images')
  --Server-Media-tempFolder                             Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')
  --Server-Media-Video-transcoding-bitRate               (default: 5242880)
  --Server-Media-Video-transcoding-resolution            (default: 720)
  --Server-Media-Video-transcoding-fps                   (default: 25)
  --Server-Media-Video-transcoding-codec                 (default: 'libx264')
  --Server-Media-Video-transcoding-format                (default: 'mp4')
  --Server-Media-Video-transcoding-crf                  Constant Rate Factor. The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 i
s worst quality possible. (default: 23)
  --Server-Media-Video-transcoding-preset               A preset is a collection of options that will provide a certain encoding speed to compression ratio (defau
lt: 'medium')
  --Server-Media-Video-transcoding-customOptions        It will be sent to ffmpeg as it is, as custom options. (default: [])
  --Server-Media-Photo-Converting-onTheFly              Converts photos on the fly, when they are requested. (default: true)
  --Server-Media-Photo-Converting-resolution             (default: 1080)
  --Server-Media-Thumbnail-qualityPriority              if true, photos will have better quality. (default: true)
  --Server-Media-Thumbnail-personFaceMargin              (default: 0.6)
  --Server-Preview-SearchQuery                           (default: null)
  --Server-Preview-Sorting                               (default: [6,4])
  --Server-Threading-enabled                            App can run on multiple thread (default: true)
  --Server-Threading-thumbnailThreads                   Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be use
d. (default: 0)
  --Server-Database-type                                 (default: 'sqlite')
  --Server-Database-dbFolder                             (default: 'db')
  --Server-Database-sqlite-DBFileName                    (default: 'sqlite.db')
  --Server-Database-mysql-host                           (default: 'localhost')
  --Server-Database-mysql-port                           (default: 3306)
  --Server-Database-mysql-database                       (default: 'pigallery2')
  --Server-Database-mysql-username                       (default: '')
  --Server-Database-mysql-password                       (default: '')
  --Server-Database-enforcedUsers                        (default: [{"name":"admin","role":4,"password":"admin"}])
  --Server-Sharing-updateTimeout                         (default: 300000)
  --Server-sessionTimeout                               unit: ms (default: 604800000)
  --Server-Indexing-cachedFolderTimeout                  (default: 3600000)
  --Server-Indexing-reIndexingSensitivity                (default: 'low')
  --Server-Indexing-excludeFolderList                   If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a
 '/', the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$R
ECYCLE.BIN"])
  --Server-Indexing-excludeFileList                     Any folder that contains a file with this name will be excluded from indexing. (default: [])
  --Server-photoMetadataSize                            only this many bites will be loaded when scanning photo for metadata (default: 524288)
  --Server-Duplicates-listingLimit                       (default: 1000)
  --Server-Log-level                                     (default: 'info')
  --Server-Log-sqlLevel                                  (default: 'error')
  --Server-Jobs-maxSavedProgress                        Job history size (default: 10)
  --Server-Jobs-scheduled                                (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":
false,"trigger":{"type":1}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"
trigger":{"type":4,"afterScheduleName":"Indexing"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false
,"trigger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowPara
llelRun":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly
":true},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}}])
  --Client-applicationTitle                              (default: 'PiGallery 2')
  --Client-publicUrl                                     (default: '')
  --Client-urlBase                                       (default: '')
  --Client-Search-enabled                                (default: true)
  --Client-Search-searchCacheTimeout                     (default: 3600000)
  --Client-Search-AutoComplete-enabled                   (default: true)
  --Client-Search-AutoComplete-maxItemsPerCategory       (default: 5)
  --Client-Search-AutoComplete-cacheTimeout              (default: 3600000)
  --Client-Search-maxMediaResult                         (default: 10000)
  --Client-Search-listDirectories                       Search returns also with directories, not just media (default: false)
  --Client-Search-listMetafiles                         Search also returns with metafiles from directories that contain a media file of the matched search result
 (default: true)
  --Client-Search-maxDirectoryResult                     (default: 200)
  --Client-Sharing-enabled                               (default: true)
  --Client-Sharing-passwordProtected                     (default: true)
  --Client-Album-enabled                                 (default: true)
  --Client-Map-enabled                                   (default: true)
  --Client-Map-maxPreviewMarkers                        Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  --Client-Map-useImageMarkers                           (default: true)
  --Client-Map-mapProvider                               (default: 'OpenStreetMap')
  --Client-Map-mapboxAccessToken                         (default: '')
  --Client-Map-customLayers                              (default: [{"name":"street","url":""}])
  --Client-RandomPhoto-enabled                           (default: true)
  --Client-Other-enableCache                             (default: true)
  --Client-Other-enableOnScrollRendering                 (default: true)
  --Client-Other-defaultPhotoSortingMethod               (default: 'ascDate')
  --Client-Other-enableDirectorySortingByDate           If enabled directories will be sorted by date, like photos, otherwise by name. Directory date is the last 
modification time of that directory not the creation date of the oldest photo (default: false)
  --Client-Other-enableOnScrollThumbnailPrioritising     (default: true)
  --Client-Other-NavBar-showItemCount                    (default: true)
  --Client-Other-captionFirstNaming                      (default: false)
  --Client-Other-enableDownloadZip                       (default: false)
  --Client-authenticationRequired                        (default: true)
  --Client-unAuthenticatedUserRole                       (default: 'Admin')
  --Client-Media-Thumbnail-iconSize                      (default: 45)
  --Client-Media-Thumbnail-personThumbnailSize           (default: 200)
  --Client-Media-Thumbnail-thumbnailSizes                (default: [240,480])
  --Client-Media-Video-enabled                           (default: true)
  --Client-Media-Photo-Converting-enabled                (default: true)
  --Client-Media-Photo-loadFullImageOnZoom              Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  --Client-MetaFile-gpx                                 Reads *.gpx files and renders them on the map (default: true)
  --Client-MetaFile-markdown                            Reads *.md files in a directory and shows the next to the map (default: true)
  --Client-MetaFile-pg2conf                             Reads *.pg2conf files (default: true)
  --Client-Faces-enabled                                 (default: true)
  --Client-Faces-keywordsToPersons                       (default: true)
  --Client-Faces-writeAccessMinRole                      (default: 'Admin')
  --Client-Faces-readAccessMinRole                       (default: 'User')

Environmental variables:
  Server-sessionSecret                               (default: [])
  Server-port                                        (default: 80)
  PORT                                               same as Server-port
  Server-host                                        (default: '0.0.0.0')
  Server-Media-folder                               Images are loaded from this folder (read permission required) (default: 'demo/images')
  Server-Media-tempFolder                           Thumbnails, converted photos, videos will be stored here (write permission required) (default: 'demo/tmp')    
  Server-Media-Video-transcoding-bitRate             (default: 5242880)
  Server-Media-Video-transcoding-resolution          (default: 720)
  Server-Media-Video-transcoding-fps                 (default: 25)
  Server-Media-Video-transcoding-codec               (default: 'libx264')
  Server-Media-Video-transcoding-format              (default: 'mp4')
  Server-Media-Video-transcoding-crf                Constant Rate Factor. The range of the CRF scale is 0–51, where 0 is lossless, 23 is the default, and 51 is wo
rst quality possible. (default: 23)
  Server-Media-Video-transcoding-preset             A preset is a collection of options that will provide a certain encoding speed to compression ratio (default: 
'medium')
  Server-Media-Video-transcoding-customOptions      It will be sent to ffmpeg as it is, as custom options. (default: [])
  Server-Media-Photo-Converting-onTheFly            Converts photos on the fly, when they are requested. (default: true)
  Server-Media-Photo-Converting-resolution           (default: 1080)
  Server-Media-Thumbnail-qualityPriority            if true, photos will have better quality. (default: true)
  Server-Media-Thumbnail-personFaceMargin            (default: 0.6)
  Server-Preview-SearchQuery                         (default: null)
  Server-Preview-Sorting                             (default: [6,4])
  Server-Threading-enabled                          App can run on multiple thread (default: true)
  Server-Threading-thumbnailThreads                 Number of threads that are used to generate thumbnails. If 0, number of 'CPU cores -1' threads will be used. (
default: 0)
  Server-Database-type                               (default: 'sqlite')
  Server-Database-dbFolder                           (default: 'db')
  Server-Database-sqlite-DBFileName                  (default: 'sqlite.db')
  Server-Database-mysql-host                         (default: 'localhost')
  MYSQL_HOST                                         same as Server-Database-mysql-host
  Server-Database-mysql-port                         (default: 3306)
  MYSQL_PORT                                         same as Server-Database-mysql-port
  Server-Database-mysql-database                     (default: 'pigallery2')
  MYSQL_DATABASE                                     same as Server-Database-mysql-database
  Server-Database-mysql-username                     (default: '')
  MYSQL_USERNAME                                     same as Server-Database-mysql-username
  Server-Database-mysql-password                     (default: '')
  MYSQL_PASSWORD                                     same as Server-Database-mysql-password
  Server-Database-enforcedUsers                      (default: [{"name":"admin","role":4,"password":"admin"}])
  Server-Sharing-updateTimeout                       (default: 300000)
  Server-sessionTimeout                             unit: ms (default: 604800000)
  Server-Indexing-cachedFolderTimeout                (default: 3600000)
  Server-Indexing-reIndexingSensitivity              (default: 'low')
  Server-Indexing-excludeFolderList                 If an entry starts with '/' it is treated as an absolute path. If it doesn't start with '/' but contains a '/'
, the path is relative to the image directory. If it doesn't contain a '/', any folder with this name will be excluded. (default: [".Trash-1000",".dtrash","$RECYC
LE.BIN"])
  Server-Indexing-excludeFileList                   Any folder that contains a file with this name will be excluded from indexing. (default: [])
  Server-photoMetadataSize                          only this many bites will be loaded when scanning photo for metadata (default: 524288)
  Server-Duplicates-listingLimit                     (default: 1000)
  Server-Log-level                                   (default: 'info')
  Server-Log-sqlLevel                                (default: 'error')
  Server-Jobs-maxSavedProgress                      Job history size (default: 10)
  Server-Jobs-scheduled                              (default: [{"name":"Indexing","jobName":"Indexing","config":{"indexChangesOnly":true},"allowParallelRun":fals
e,"trigger":{"type":1}},{"name":"Thumbnail Generation","jobName":"Thumbnail Generation","config":{"sizes":[240],"indexedOnly":true},"allowParallelRun":false,"trig
ger":{"type":4,"afterScheduleName":"Indexing"}},{"name":"Photo Converting","jobName":"Photo Converting","config":{"indexedOnly":true},"allowParallelRun":false,"tr
igger":{"type":4,"afterScheduleName":"Thumbnail Generation"}},{"name":"Video Converting","jobName":"Video Converting","config":{"indexedOnly":true},"allowParallel
Run":false,"trigger":{"type":4,"afterScheduleName":"Photo Converting"}},{"name":"Temp Folder Cleaning","jobName":"Temp Folder Cleaning","config":{"indexedOnly":tr
ue},"allowParallelRun":false,"trigger":{"type":4,"afterScheduleName":"Video Converting"}}])
  Client-applicationTitle                            (default: 'PiGallery 2')
  Client-publicUrl                                   (default: '')
  Client-urlBase                                     (default: '')
  Client-Search-enabled                              (default: true)
  Client-Search-searchCacheTimeout                   (default: 3600000)
  Client-Search-AutoComplete-enabled                 (default: true)
  Client-Search-AutoComplete-maxItemsPerCategory     (default: 5)
  Client-Search-AutoComplete-cacheTimeout            (default: 3600000)
  Client-Search-maxMediaResult                       (default: 10000)
  Client-Search-listDirectories                     Search returns also with directories, not just media (default: false)
  Client-Search-listMetafiles                       Search also returns with metafiles from directories that contain a media file of the matched search result (de
fault: true)
  Client-Search-maxDirectoryResult                   (default: 200)
  Client-Sharing-enabled                             (default: true)
  Client-Sharing-passwordProtected                   (default: true)
  Client-Album-enabled                               (default: true)
  Client-Map-enabled                                 (default: true)
  Client-Map-maxPreviewMarkers                      Maximum number of markers to be shown on the map preview on the gallery page. (default: 50)
  Client-Map-useImageMarkers                         (default: true)
  Client-Map-mapProvider                             (default: 'OpenStreetMap')
  Client-Map-mapboxAccessToken                       (default: '')
  Client-Map-customLayers                            (default: [{"name":"street","url":""}])
  Client-RandomPhoto-enabled                         (default: true)
  Client-Other-enableCache                           (default: true)
  Client-Other-enableOnScrollRendering               (default: true)
  Client-Other-defaultPhotoSortingMethod             (default: 'ascDate')
  Client-Other-enableDirectorySortingByDate         If enabled directories will be sorted by date, like photos, otherwise by name. Directory date is the last modi
fication time of that directory not the creation date of the oldest photo (default: false)
  Client-Other-enableOnScrollThumbnailPrioritising   (default: true)
  Client-Other-NavBar-showItemCount                  (default: true)
  Client-Other-captionFirstNaming                    (default: false)
  Client-Other-enableDownloadZip                     (default: false)
  Client-authenticationRequired                      (default: true)
  Client-unAuthenticatedUserRole                     (default: 'Admin')
  Client-Media-Thumbnail-iconSize                    (default: 45)
  Client-Media-Thumbnail-personThumbnailSize         (default: 200)
  Client-Media-Thumbnail-thumbnailSizes              (default: [240,480])
  Client-Media-Video-enabled                         (default: true)
  Client-Media-Photo-Converting-enabled              (default: true)
  Client-Media-Photo-loadFullImageOnZoom            Enables loading the full resolution image on zoom in the ligthbox (preview). (default: true)
  Client-MetaFile-gpx                               Reads *.gpx files and renders them on the map (default: true)
  Client-MetaFile-markdown                          Reads *.md files in a directory and shows the next to the map (default: true)
  Client-MetaFile-pg2conf                           Reads *.pg2conf files (default: true)
  Client-Faces-enabled                               (default: true)
  Client-Faces-keywordsToPersons                     (default: true)
  Client-Faces-writeAccessMinRole                    (default: 'Admin')
  Client-Faces-readAccessMinRole                     (default: 'User')
```
