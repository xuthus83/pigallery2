var ts = require('gulp-typescript');
var gulp = require('gulp');
var zip = require('gulp-zip');
var runSequence = require('run-sequence');
var jsonModify = require('gulp-json-modify');
var exec = require('child_process').exec;

var tsBackendProject = ts.createProject('tsconfig.json');
gulp.task('build-backend', function () {
  return gulp.src([
    "common/**/*.ts",
    "backend/**/*.ts"], {base: "."})
    .pipe(tsBackendProject())
    .js
    .pipe(gulp.dest("./release"))

});
gulp.task('build-frontend', function (cb) {
  exec("ng build -prod --output-path=./release/dist --no-progress", function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
});

gulp.task('copy-static', function () {
  return gulp.src([
    "README.md",
    "LICENSE"], {base: "."})
    .pipe(gulp.dest('./release'));
});

gulp.task('copy-package', function () {
  return gulp.src([
    "package.json"], {base: "."})
    .pipe(jsonModify({
      key: 'devDependencies',
      value: {}
    }))
    .pipe(jsonModify({
      key: 'scripts',
      value: {"start": "node ./backend/index.js"}
    }))
    .pipe(gulp.dest('./release'));
});


gulp.task('zip-release', function () {
  return gulp.src(['release/**/*'], {base: "./release"})
    .pipe(zip('pigallery2.zip'))
    .pipe(gulp.dest('.'));
});

gulp.task('build-release', function (done) {
  runSequence('build-frontend', 'build-backend', 'copy-static', 'copy-package', 'zip-release', function () {
    done();
  });
});
