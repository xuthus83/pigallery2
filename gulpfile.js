var ts = require('gulp-typescript');
var gulp = require('gulp');
var zip = require('gulp-zip');
var fs = require('fs');
var runSequence = require('run-sequence');
var jsonModify = require('gulp-json-modify');
var exec = require('child_process').exec;

var translationFolder = "translate";
var tsBackendProject = ts.createProject('tsconfig.json');
gulp.task('build-backend', function () {
  return gulp.src([
    "common/**/*.ts",
    "backend/**/*.ts"], {base: "."})
    .pipe(tsBackendProject())
    .js
    .pipe(gulp.dest("./release"))

});
var createFrontendTask = function (type, script) {
  gulp.task(type, function (cb) {
    exec(script, function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
};

gulp.task('build-frontend', function (done) {
  var languages = getLanguages();
  var tasks = [];
  createFrontendTask('build-frontend-release default', "ng build --aot -prod --output-path=./release/dist --no-progress");
  tasks.push('build-frontend-release default');
  for (var i = 0; i < languages.length; i++) {
    createFrontendTask('build-frontend-release ' + languages[i], "ng build --aot -prod --output-path=./release/dist/" + languages[i] + " --no-progress --locale=" + languages[i] +
      " --i18n-format xlf --i18n-file frontend/" + translationFolder + "/messages." + languages[i] + ".xlf" + " --missing-translation warning");
    tasks.push('build-frontend-release ' + languages[i]);
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

var getLanguages = function () {
  if (!fs.existsSync("./frontend/" + translationFolder)) {
    return [];
  }
  var dirCont = fs.readdirSync("./frontend/" + translationFolder);
  var files = dirCont.filter(function (elm) {
    return elm.match(/.*\.[a-zA-Z]+\.(xlf)/ig);
  });
  return files.map(function (f) {
    return f.split(".")[1]
  });
};

var simpleBuild = function (isProd) {
  return function (done) {
    var languages = getLanguages();
    var tasks = [];
    var cmd = "ng build  ";
    if (isProd) {
      cmd += " -prod "
    }
    createFrontendTask('build-frontend default', cmd + "--output-path=./dist --no-progress");
    tasks.push('build-frontend default');
    for (var i = 0; i < languages.length; i++) {
      createFrontendTask('build-frontend ' + languages[i], cmd + "--output-path=./dist/" + languages[i] + " --no-progress --locale " + languages[i] +
        " --i18n-format=xlf --i18n-file=frontend/" + translationFolder + "/messages." + languages[i] + ".xlf" + " --missing-translation warning");
      tasks.push('build-frontend ' + languages[i]);
    }
    tasks.push(function () {
      done();
    });

    runSequence.apply(this, tasks);
  };
};

gulp.task("extract-locale", function (cb) {
  console.log("creating source translation file:  locale.source.xlf");
  exec('ng xi18n -of ./../locale.source.xlf -f xlf --locale en', function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    if (err) {
      return cb(err);
    }
    exec('ngx-extractor -i frontend/**/*.ts -f xlf -o locale.source.xlf', function (err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
      cb(err);
    });
  });
});

var translate = function (list, cb) {
  var localsStr = '"[\\"' + list.join('\\",\\"') + '\\"]"';
  console.log(localsStr);
  exec('xlf-google-translate --source-lang="en" --source-file="./locale.source.xlf" --destination-folder="./frontend/"' +
    translationFolder + ' --destination-languages=' + localsStr, function (err, stdout, stderr) {
    console.log(stdout);
    console.log(stderr);
    cb(err);
  });
};

gulp.task("update-translation-only", function (cb) {
  translate(getLanguages(), cb)
});

gulp.task("update-translation", function (done) {
  runSequence('extract-locale', 'update-translation-only', function () {
    done();
  });
});


gulp.task("add-translation-only", function (cb) {
  var languages = getLanguages();
  var lng = null;
  for (var i = 0; i < process.argv.length - 1; i++) {
    if (process.argv[i] === "add-translation") {
      lng = process.argv[i + 1].replace("--", "");
    }
  }
  if (lng == null) {
    console.error("Error: set language with '--' e.g: npm run add-translation -- --en");
    return cb();
  }
  if (languages.indexOf(lng) !== -1) {
    console.error("Error: language already exists, can't add. These language(s) already exist(s): " + languages);
    return cb();
  }
  translate([lng], cb)
});


gulp.task("add-translation", function (done) {
  runSequence('extract-locale', 'add-translation-only', function () {
    done();
  });
});


gulp.task('build-dev', simpleBuild(false));
gulp.task('build-prod', simpleBuild(true));
