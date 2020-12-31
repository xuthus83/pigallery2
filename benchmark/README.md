# PiGallery2 performance benchmark results

These results are created mostly for development, but the results are public for curious users.

You can also run it on your files by using the [docker-compose.yml](docker-compose) file.

## PiGallery2 v1.8.2, 31.12.2020
**System**: Raspberry Pi 4 4G Model B, SandisK Mobile Ultra 32Gb CLass10, UHS-I, HDD: Western Digital Elements 1TB (WDBUZG0010BBK)

**OS**: Raspbian GNU/Linux 10 (buster)

**Gallery**: directories: 31, photos: 2036, videos: 35, diskUsage : 22.08GB, persons : 1241, unique persons (faces): 14

| Action | Sub action | Average Duration | Result  |
|:------:|:----------:|:----------------:|:-------:|
| **Scanning directory** | | **10231.7 ms** | **media: 698, directories:0** |
| **Saving directory to DB** | | **3070.8 ms** | **-** |
| **List directory** | | **332.2 ms** | **media: 698, directories:0** |
| | Authenticate | 0.1 ms | - |
| | Normalize path param | 0.0 ms | - |
| | Authorise path | 0.0 ms | - |
| | Inject gallery version | 11.5 ms | - |
| | List directory | 243.7 ms | media: 698, directories:0 |
| | Add thumbnail information | 60.5 ms | media: 698, directories:0 |
| | Clean up gallery results | 16.1 ms | media: 698, directories:0 |
| | Render result | 0.0 ms | media: 698, directories:0 |
| **Listing Faces** | | **335.6 ms** | **items: 14** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 6.1 ms | - |
| | List persons | 1.6 ms | items: 14 |
| | Add sample photo for all | 326.4 ms | items: 14 |
| | Add thumbnail info for persons | 1.0 ms | items: 14 |
| | Remove sample photo for all | 0.1 ms | items: 14 |
| | Render result | 0.0 ms | items: 14 |
| **Searching for `a` as `directory`** | | **858.0 ms** | **media: 1679, directories:21** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 668.4 ms | media: 1679, directories:21 |
| | Add thumbnail information | 150.5 ms | media: 1679, directories:21 |
| | Clean up gallery results | 38.6 ms | media: 1679, directories:21 |
| | Render result | 0.0 ms | media: 1679, directories:21 |
| **Searching for `a` as `person`** | | **475.8 ms** | **media: 768, directories:21** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 386.5 ms | media: 768, directories:21 |
| | Add thumbnail information | 68.6 ms | media: 768, directories:21 |
| | Clean up gallery results | 20.2 ms | media: 768, directories:21 |
| | Render result | 0.0 ms | media: 768, directories:21 |
| **Searching for `a` as `keyword`** | | **760.8 ms** | **media: 1534, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 589.3 ms | media: 1534, directories:21 |
| | Add thumbnail information | 136.9 ms | media: 1534, directories:21 |
| | Clean up gallery results | 33.9 ms | media: 1534, directories:21 |
| | Render result | 0.0 ms | media: 1534, directories:21 |
| **Searching for `a` as `position`** | | **625.5 ms** | **media: 1133, directories:21** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 499.7 ms | media: 1133, directories:21 |
| | Add thumbnail information | 102.4 ms | media: 1133, directories:21 |
| | Clean up gallery results | 22.6 ms | media: 1133, directories:21 |
| | Render result | 0.0 ms | media: 1133, directories:21 |
| **Searching for `a` as `photo`** | | **46.2 ms** | **media: 65, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 38.2 ms | media: 65, directories:21 |
| | Add thumbnail information | 5.9 ms | media: 65, directories:21 |
| | Clean up gallery results | 1.7 ms | media: 65, directories:21 |
| | Render result | 0.0 ms | media: 65, directories:21 |
| **Searching for `a` as `video`** | | **19.9 ms** | **media: 14, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 18.0 ms | media: 14, directories:21 |
| | Add thumbnail information | 1.3 ms | media: 14, directories:21 |
| | Clean up gallery results | 0.2 ms | media: 14, directories:21 |
| | Render result | 0.0 ms | media: 14, directories:21 |
| **Searching for `a` as `any`** | | **1038.2 ms** | **media: 2001, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.2 ms | - |
| | Search | 814.9 ms | media: 2001, directories:21 |
| | Add thumbnail information | 180.0 ms | media: 2001, directories:21 |
| | Clean up gallery results | 42.8 ms | media: 2001, directories:21 |
| | Render result | 0.0 ms | media: 2001, directories:21 |
| **Instant search for `a`** | | **25.1 ms** | **media: 10, directories:10** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Instant search | 23.5 ms | media: 10, directories:10 |
| | Add thumbnail information | 0.9 ms | media: 10, directories:10 |
| | Clean up gallery results | 0.3 ms | media: 10, directories:10 |
| | Render result | 0.0 ms | media: 10, directories:10 |
| **Auto complete for `a`** | | **21.8 ms** | **items: 35** |
| | Authenticate | 0.1 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Autocomplete | 21.4 ms | items: 35 |
| | Render result | 0.0 ms | items: 35 |
*Measurements run 50 times, and an average was calculated.


## PiGallery2 v1.8.2, 31.12.2020
**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm

**OS**: Windows 10, build: 19041.685

**Gallery**: directories: 31, photos: 2036, videos: 35, diskUsage : 22.08GB, persons : 1241, unique persons (faces): 14

| Action | Sub action | Average Duration | Result  |
|:------:|:----------:|:----------------:|:-------:|
| **Scanning directory** | | **2357.2 ms** | **media: 698, directories:0** |
| **Saving directory to DB** | | **1033.1 ms** | **-** |
| **List directory** | | **115.3 ms** | **media: 698, directories:0** |
| | Authenticate | 0.0 ms | - |
| | Normalize path param | 0.0 ms | - |
| | Authorise path | 0.0 ms | - |
| | Inject gallery version | 2.0 ms | - |
| | List directory | 58.8 ms | media: 698, directories:0 |
| | Add thumbnail information | 50.5 ms | media: 698, directories:0 |
| | Clean up gallery results | 4.0 ms | media: 698, directories:0 |
| | Render result | 0.0 ms | media: 698, directories:0 |
| **Listing Faces** | | **79.1 ms** | **items: 14** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 1.8 ms | - |
| | List persons | 0.6 ms | items: 14 |
| | Add sample photo for all | 76.0 ms | items: 14 |
| | Add thumbnail info for persons | 0.5 ms | items: 14 |
| | Remove sample photo for all | 0.0 ms | items: 14 |
| | Render result | 0.0 ms | items: 14 |
| **Searching for `a` as `directory`** | | **272.8 ms** | **media: 1679, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 150.1 ms | media: 1679, directories:21 |
| | Add thumbnail information | 113.6 ms | media: 1679, directories:21 |
| | Clean up gallery results | 8.9 ms | media: 1679, directories:21 |
| | Render result | 0.0 ms | media: 1679, directories:21 |
| **Searching for `a` as `person`** | | **145.0 ms** | **media: 768, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 89.2 ms | media: 768, directories:21 |
| | Add thumbnail information | 51.3 ms | media: 768, directories:21 |
| | Clean up gallery results | 4.4 ms | media: 768, directories:21 |
| | Render result | 0.0 ms | media: 768, directories:21 |
| **Searching for `a` as `keyword`** | | **243.1 ms** | **media: 1534, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 132.1 ms | media: 1534, directories:21 |
| | Add thumbnail information | 102.6 ms | media: 1534, directories:21 |
| | Clean up gallery results | 8.2 ms | media: 1534, directories:21 |
| | Render result | 0.0 ms | media: 1534, directories:21 |
| **Searching for `a` as `position`** | | **195.9 ms** | **media: 1133, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 113.1 ms | media: 1133, directories:21 |
| | Add thumbnail information | 77.1 ms | media: 1133, directories:21 |
| | Clean up gallery results | 5.5 ms | media: 1133, directories:21 |
| | Render result | 0.0 ms | media: 1133, directories:21 |
| **Searching for `a` as `photo`** | | **14.8 ms** | **media: 65, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.0 ms | - |
| | Search | 9.7 ms | media: 65, directories:21 |
| | Add thumbnail information | 4.5 ms | media: 65, directories:21 |
| | Clean up gallery results | 0.4 ms | media: 65, directories:21 |
| | Render result | 0.0 ms | media: 65, directories:21 |
| **Searching for `a` as `video`** | | **6.5 ms** | **media: 14, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.0 ms | - |
| | Search | 5.3 ms | media: 14, directories:21 |
| | Add thumbnail information | 1.0 ms | media: 14, directories:21 |
| | Clean up gallery results | 0.1 ms | media: 14, directories:21 |
| | Render result | 0.0 ms | media: 14, directories:21 |
| **Searching for `a` as `any`** | | **330.6 ms** | **media: 2001, directories:21** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.1 ms | - |
| | Search | 185.8 ms | media: 2001, directories:21 |
| | Add thumbnail information | 133.9 ms | media: 2001, directories:21 |
| | Clean up gallery results | 10.7 ms | media: 2001, directories:21 |
| | Render result | 0.0 ms | media: 2001, directories:21 |
| **Instant search for `a`** | | **7.4 ms** | **media: 10, directories:10** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.0 ms | - |
| | Instant search | 6.5 ms | media: 10, directories:10 |
| | Add thumbnail information | 0.8 ms | media: 10, directories:10 |
| | Clean up gallery results | 0.1 ms | media: 10, directories:10 |
| | Render result | 0.0 ms | media: 10, directories:10 |
| **Auto complete for `a`** | | **8.3 ms** | **items: 35** |
| | Authenticate | 0.0 ms | - |
| | Authorise | 0.0 ms | - |
| | Inject gallery version | 0.0 ms | - |
| | Autocomplete | 8.2 ms | items: 35 |
| | Render result | 0.0 ms | items: 35 |
*Measurements run 50 times, and an average was calculated.


## PiGallery2 v1.5.8, 26.01.2019

**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm
**Gallery**: directories: 0 media: 341, faces: 39

| action | action details | average time | details |
|:------:|:--------------:|:------------:|:-------:|
| Scanning directory |  | 2486.5ms | media: 341, directories:0 |
| Saving directory |  | 780.0ms | - |
| Listing Directory |  | 31.5ms | media: 341, directories:0 |
| searching | `a` as `directory` | 2.9ms | - |
| searching | `a` as `person` | 7.3ms | media: 39, directories:0 |
| searching | `a` as `keyword` | 30.8ms | media: 339, directories:0 |
| searching | `a` as `position` | 25.7ms | media: 282, directories:0 |
| searching | `a` as `photo` | 2.8ms | - |
| searching | `a` as `video` | 2.6ms | - |
| searching | `a` as `any` | 33.0ms | media: 339, directories:0 |
| instant search | `a` | 6.1ms | media: 10, directories:0 |
| auto complete | `a` | 5.4ms | items: 10 | 
