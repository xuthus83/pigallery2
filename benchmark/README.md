# PiGallery2 performance benchmark results

These results are created mostly for development, but the results are public for curious users.

## PiGallery2 v1.8.2, 30.12.2020
**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm

**Gallery**: directories: 0 media: 341, faces: 65

| Action | Sub action | Action details | Average Duration | Details |
|:------:|:----------:|:--------------:|:----------------:|:-------:|
| **Scanning directory** | |  | 1526.7 ms | media: 341, directories:0 |
| **Saving directory to DB** | |  | 679.9 ms | - |
| **List directory** | |  | 61.1 ms | media: 341, directories:0 |
| | List directory |  | 39.7 ms | media: 341, directories:0 |
| | Add Thumbnail information |  | 19.3 ms | media: 341, directories:0 |
| | Clean Up Gallery Result |  | 2.0 ms | media: 341, directories:0 |
| **Listing Faces** | |  | 8.4 ms | items: 1 |
| | List Persons |  | 1.0 ms | items: 1 |
| | Add sample photo |  | 7.1 ms | items: 1 |
| | Add thumbnail info |  | 0.1 ms | items: 1 |
| | Remove sample photo |  | 0.0 ms | items: 1 |
| **Searching** | | `a` as `directory` | 3.3 ms | media: 0, directories:0 |
| **Searching** | | `a` as `person` | 11.6 ms | media: 65, directories:0 |
| **Searching** | | `a` as `keyword` | 38.0 ms | media: 339, directories:0 |
| **Searching** | | `a` as `position` | 31.7 ms | media: 282, directories:0 |
| **Searching** | | `a` as `photo` | 3.2 ms | media: 0, directories:0 |
| **Searching** | | `a` as `video` | 3.2 ms | media: 0, directories:0 |
| **Searching** | | `a` as `any` | 39.3 ms | media: 339, directories:0 |
| **Instant search** | | `a` | 6.7 ms | media: 10, directories:0 |
| **Auto complete** | | `a` | 6.7 ms | items: 10 |
*Measurements run 2 times and an average was calculated.


## PiGallery2 v1.8.2, 30.12.2020
**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm

**Gallery**: directories: 0 media: 341, faces: 65

| Action | Sub action | Action details | Average Duration | Details |
|:------:|:----------:|:--------------:|:----------------:|:-------:|
| **Scanning directory** | |  | 1459.3 ms | media: 341, directories:0 |
| **Saving directory to DB** | |  | 654.9 ms | - |
| **List directory** | |  | 70.4 ms | - |
| | List directory |  | 42.1 ms | - |
| | Add Thumbnail information |  | 25.8 ms | - |
| | Clean Up Gallery Result |  | 2.3 ms | - |
| **Listing Faces** | |  | 10.5 ms | items: 1 |
| | List Persons |  | 1.0 ms | items: 1 |
| | Add sample photo |  | 9.1 ms | items: 1 |
| | Add thumbnail info |  | 0.2 ms | items: 1 |
| | Remove sample photo |  | 0.0 ms | items: 1 |
| **Searching** | | `a` as `directory` | 3.3 ms | - |
| **Searching** | | `a` as `person` | 11.7 ms | media: 65, directories:0 |
| **Searching** | | `a` as `keyword` | 40.4 ms | media: 339, directories:0 |
| **Searching** | | `a` as `position` | 30.4 ms | media: 282, directories:0 |
| **Searching** | | `a` as `photo` | 2.7 ms | - |
| **Searching** | | `a` as `video` | 3.5 ms | - |
| **Searching** | | `a` as `any` | 36.9 ms | media: 339, directories:0 |
| **Instant search** | | `a` | 5.4 ms | media: 10, directories:0 |
| **Auto complete** | | `a` | 6.7 ms | items: 10 |
*Measurements run 2 times and an average was calculated.


## PiGallery2 v1.8.2, 30.12.2020
**System**: Intel(R) Core(TM) i7-6700HQ CPU @ 2.60GHz, 16GB Ram, SHDD: 1TB, 5400 rpm

**Gallery**: directories: 0 media: 341, faces: 65

| Action | Sub action | Action details | Average Duration | Details |
|:------:|:----------:|:--------------:|:----------------:|:-------:|
| Scanning directory | |  | 1746.5 ms | media: 341, directories:0 |
| Saving directory to DB | |  | 994.1 ms | - |
| Scanning directory | |  | 65.3 ms | media: 341, directories:0 |
| Listing Faces | |  | 19.0 ms | items: 1 |
| | List Persons |  | 1.9 ms | items: 1 |
| | Add sample photo |  | 16.6 ms | items: 1 |
| | Add thumbnail info |  | 0.3 ms | items: 1 |
| | Remove sample photo |  | 0.0 ms | items: 1 |
| Searching | | `a` as `directory` | 4.1 ms | - |
| Searching | | `a` as `person` | 16.1 ms | media: 65, directories:0 |
| Searching | | `a` as `keyword` | 41.6 ms | media: 339, directories:0 |
| Searching | | `a` as `position` | 67.1 ms | media: 282, directories:0 |
| Searching | | `a` as `photo` | 5.4 ms | - |
| Searching | | `a` as `video` | 4.3 ms | - |
| Searching | | `a` as `any` | 53.5 ms | media: 339, directories:0 |
| Instant search | | `a` | 5.3 ms | media: 10, directories:0 |
| Auto complete | | `a` | 7.2 ms | items: 10 |
*Measurements run 2 times and an average was calculated.


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
