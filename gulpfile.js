var ts = require('gulp-typescript');
var gulp = require('gulp');
var zip = require('gulp-zip');
var fs = require('fs');
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
var createFornendTask = function (tpye, script) {
  gulp.task(tpye, function (cb) {
    exec(script, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
};

gulp.task('build-frontend', function (done) {
  var dirCont = fs.readdirSync("./frontend/locale");
  var files = dirCont.filter(function (elm) {
    return elm.match(/.*\.[a-zA-Z]+\.(xlf)/ig);
  });
  var languages = files.map(function (f) {
    return f.split(".")[1]
  });
  var tasks = [];
  createFornendTask('build-frontend default', "ng build --aot -prod --output-path=./release/dist --no-progress");
  tasks.push('build-frontend default');
  for (var i = 0; i < files.length; i++) {
    createFornendTask('build-frontend ' + languages[i], "ng build --aot -prod --output-path=./release/dist/" + languages[i] + " --no-progress --locale " + languages[i] + " --i18n-format xlf --i18n-file frontend/locale/" + files[i] + " --missing-translation warning");
    tasks.push('build-frontend ' + languages[i]);
  }
  tasks.push(function () {
    done();
  });

  runSequence.apply(this, tasks);

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


gulp.task('build-dev', function (done) {
  var dirCont = fs.readdirSync("./frontend/locale");
  var files = dirCont.filter(function (elm) {
    return elm.match(/.*\.[a-zA-Z]+\.(xlf)/ig);
  });
  var languages = files.map(function (f) {
    return f.split(".")[1]
  });
  var tasks = [];
  createFornendTask('build-frontend-dev default', "ng build --prod --output-path=./dist --no-progress");
  tasks.push('build-frontend-dev default');
  for (var i = 0; i < files.length; i++) {
    createFornendTask('build-frontend-dev ' + languages[i], "ng build --prod --output-path=./dist/" + languages[i] + " --no-progress --locale " + languages[i] + " --i18n-format xlf --i18n-file frontend/locale/" + files[i] + " --missing-translation warning");
    tasks.push('build-frontend-dev ' + languages[i]);
  }
  tasks.push(function () {
    done();
  });

  runSequence.apply(this, tasks);
});
