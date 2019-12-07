"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var gulp = require("gulp");
var fs = require("fs");
var zip = require("gulp-zip");
var ts = require("gulp-typescript");
// @ts-ignore
var jsonModify = require("gulp-json-modify");
var exec = require('child_process').exec;
var translationFolder = 'translate';
var tsBackendProject = ts.createProject('tsconfig.json');
gulp.task('build-backend', function () {
    return gulp.src([
        'common/**/*.ts',
        'backend/**/*.ts'
    ], { base: '.' })
        .pipe(tsBackendProject())
        .js
        .pipe(gulp.dest('./release'));
});
var handleError = function (cb) {
    return function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    };
};
var createFrontendTask = function (type, script) {
    gulp.task(type, function (cb) {
        exec(script, handleError(cb));
    });
};
var getLanguages = function () {
    if (!fs.existsSync('./frontend/' + translationFolder)) {
        return [];
    }
    var dirCont = fs.readdirSync('./frontend/' + translationFolder);
    var files = dirCont.filter(function (elm) {
        return elm.match(/.*\.[a-zA-Z]+\.(xlf)/ig);
    });
    return files.map(function (f) {
        return f.split('.')[1];
    });
};
gulp.task('build-frontend', (function () {
    var languages = getLanguages().filter(function (l) {
        return l !== 'en';
    });
    var tasks = [];
    createFrontendTask('build-frontend-release default', 'ng build --aot --prod --output-path=./release/dist --no-progress --i18n-locale=en' +
        ' --i18n-format xlf --i18n-file frontend/' + translationFolder + '/messages.en.xlf' +
        ' --i18n-missing-translation warning');
    tasks.push('build-frontend-release default');
    for (var i = 0; i < languages.length; i++) {
        createFrontendTask('build-frontend-release ' + languages[i], 'ng build --aot --prod --output-path=./release/dist/' + languages[i] +
            ' --no-progress --i18n-locale=' + languages[i] +
            ' --i18n-format xlf --i18n-file frontend/' + translationFolder + '/messages.' + languages[i] + '.xlf' +
            ' --i18n-missing-translation warning');
        tasks.push('build-frontend-release ' + languages[i]);
    }
    return gulp.series.apply(gulp, tasks);
})());
gulp.task('copy-static', function () {
    return gulp.src([
        'backend/model/diagnostics/blank.jpg',
        'README.md',
        'LICENSE'
    ], { base: '.' })
        .pipe(gulp.dest('./release'));
});
gulp.task('copy-package', function () {
    return gulp.src([
        'package.json'
    ], { base: '.' })
        .pipe(jsonModify({
        key: 'devDependencies',
        value: {}
    }))
        .pipe(jsonModify({
        key: 'scripts',
        value: { 'start': 'node ./backend/index.js' }
    }))
        .pipe(gulp.dest('./release'));
});
gulp.task('zip-release', function () {
    return gulp.src(['release/**/*'], { base: './release' })
        .pipe(zip('pigallery2.zip'))
        .pipe(gulp.dest('.'));
});
gulp.task('build-release', gulp.series('build-frontend', 'build-backend', 'copy-static', 'copy-package', 'zip-release'));
var simpleBuild = function (isProd) {
    var languages = getLanguages().filter(function (l) {
        return l !== 'en';
    });
    var tasks = [];
    var cmd = 'ng build --aot ';
    if (isProd) {
        cmd += ' --prod --no-extract-licenses ';
    }
    createFrontendTask('build-frontend default', cmd + '--output-path=./dist --no-progress --no-progress --i18n-locale en' +
        ' --i18n-format=xlf --i18n-file=frontend/' + translationFolder + '/messages.en.xlf' + ' --i18n-missing-translation warning');
    tasks.push('build-frontend default');
    if (!process.env.CI) { // don't build languages if running in CI
        for (var i = 0; i < languages.length; i++) {
            createFrontendTask('build-frontend ' + languages[i], cmd +
                '--output-path=./dist/' + languages[i] +
                ' --no-progress --i18n-locale ' + languages[i] +
                ' --i18n-format=xlf --i18n-file=frontend/' + translationFolder +
                '/messages.' + languages[i] + '.xlf' + ' --i18n-missing-translation warning');
            tasks.push('build-frontend ' + languages[i]);
        }
    }
    return gulp.series.apply(gulp, tasks);
};
gulp.task('extract-locale', function (cb) {
    console.log('creating source translation file:  locale.source.xlf');
    exec('ng xi18n --out-file=./../locale.source.xlf  --i18n-format=xlf --i18n-locale=en', { maxBuffer: 1024 * 1024 }, function (error, stdOut, stdErr) {
        console.log(stdOut);
        console.log(stdErr);
        if (error) {
            return cb(error);
        }
        exec('ngx-extractor -i frontend/**/*.ts -f xlf --out-file locale.source.xlf', handleError(cb));
    });
});
var translate = function (list, cb) {
    var localsStr = '"[\\"' + list.join('\\",\\"') + '\\"]"';
    exec('xlf-google-translate --source-lang="en" --source-file="./locale.source.xlf" --destination-folder="./frontend/"' +
        translationFolder + ' --destination-languages=' + localsStr, handleError(cb));
};
var merge = function (list, cb) {
    var localsStr = '"[\\"' + list.join('\\",\\"') + '\\"]"';
    exec('xlf-google-translate --method="extend-only" --source-lang="en" --source-file="./locale.source.xlf" --destination-folder="./frontend/"' +
        translationFolder + ' --destination-languages=' + localsStr, handleError(cb));
};
gulp.task('update-translation-only', function (cb) {
    translate(getLanguages(), cb);
});
gulp.task('merge-translation-only', function (cb) {
    merge(getLanguages(), cb);
});
gulp.task('update-translation', gulp.series('extract-locale', 'update-translation-only'));
gulp.task('merge-new-translation', gulp.series('extract-locale', 'merge-translation-only'));
gulp.task('add-translation-only', function (cb) {
    var languages = getLanguages();
    var lng = null;
    for (var i = 0; i < process.argv.length - 1; i++) {
        if (process.argv[i] === 'add-translation') {
            lng = process.argv[i + 1].replace('--', '');
        }
    }
    if (lng == null) {
        console.error('Error: set language with \'--\' e.g: npm run add-translation -- --en');
        return cb();
    }
    if (languages.indexOf(lng) !== -1) {
        console.error('Error: language already exists, can\'t add. These language(s) already exist(s): ' + languages);
        return cb();
    }
    translate([lng], cb);
});
gulp.task('add-translation', gulp.series('extract-locale', 'add-translation-only'));
gulp.task('build-dev', simpleBuild(false));
gulp.task('build-prod', simpleBuild(true));
//# sourceMappingURL=gulpfile.js.map