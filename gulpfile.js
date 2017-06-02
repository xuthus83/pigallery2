var ts = require('gulp-typescript');
var gulp = require('gulp');
var zip = require('gulp-zip');
var runSequence = require('run-sequence');

var tsProject = ts.createProject('tsconfig.json');
gulp.task('compile-release', function () {
    return gulp.src([
        "frontend/**/*.ts",
        "common/**/*.ts",
        "backend/**/*.ts"], {base: "."})
        .pipe(tsProject())
        .js
        .pipe(gulp.dest("."))

});
gulp.task('zip-release', function () {
    return gulp.src(['package.json',
        "README.md",
        "LICENSE",
        "frontend/**/*.js",
        "common/**/*.js",
        "backend/**/*.js",
        "frontend/**/*.+(png|ejs|html|css)",
        "frontend/systemjs*"], {base: "."})
        .pipe(zip('pigallery2.zip'))
        .pipe(gulp.dest('.'));
});

gulp.task('build-release', function (done) {
    runSequence('compile-release', 'zip-release', function () {
        console.log('Run something else');
        done();
    });
});