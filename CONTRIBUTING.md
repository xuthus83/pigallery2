# PiGallery2 Contribution guide (draft)

## Intro

This project reached to a point when I cannot maintain it alone. 
I'm happy to see that some people already submitted some pull requests (PR) so everyone can benefit their changes.
In general, I'm happy to merge PRs, but I recommend filling a ticket and ask first if it is OK.



## How to develop

1. Download the source files
2. install dependencies `npm install`
3. Build client  `npm run run-dev`
   * This will build the client with english localization and will keep building if you change the source files
4. Build the backend `npm run build-backend`
   * This runs `tsc` that transpiles `.ts` files to `.js` so node can run them. 
     * To rebuild on change run `tsc -w`
   * Note: you can skip this test if you use and IDE that supports typescript (e.g.: webstorm, vscode)
5. Run the server `npm start`

## Developer docs

### Project structure
Overview:
```
|-- benchmark --A benchmark tool to test the speed of the app (not needed for development)
|-- demo -- contains some sample photo for https://pigallery2.herokuapp.com/  (not needed for development)
|-- docker -- contains all docker and docker realted configurations (this is the recommended way for app deplyoment)
|-- docs -- webpage for http://bpatrik.github.io/pigallery2/

|-- src -- contains the rource files <-------- This is what you need
|-- test -- contains the unit and integration tets <----- be nice and write tests to your feature
```

Source structure:
```
|-- src -- contains the rource files <-------- This is what you need
  |-- backend -- nodejs backend code
  |-- common -- shared files (mostly DTOs) between the frontend and the backend
  |-- frontend -- angular based frontend
```
TODO...
