var ts = require('gulp-typescript');
var del = require('del');
var gulp = require('gulp');
var merge = require('merge2');
var zip = require('gulp-zip');
var runSequence = require('run-sequence');



gulp.task('clean', function () {
    return del('release/');
});

gulp.task("copy-files", function () {
    return gulp
        .src(['package.json',
            ".npmignore",
            "frontend/**/*.+(png|ejs|html|css)",
            "frontend/systemjs*"], {base: "."})
        .pipe(gulp.dest("release"));
});

gulp.task('compile-release', function () {

    return merge(
        ['frontend',
            'common',
            'backend'].map(function (dir) {
            var tsProject = ts.createProject('tsconfig.json');
            return gulp.src(dir + "/**/*.ts")
                .pipe(tsProject())
                .js
                .pipe(gulp.dest("release/" + dir))
        })
    );
});
gulp.task('zip-release', function () {
    return gulp.src('release/**/*')
        .pipe(zip('pigallery2.zip'))
        .pipe(gulp.dest('release'))
});

gulp.task('build-release', function (done) {
    runSequence('clean', 'copy-files', 'compile-release', 'zip-release', function () {
        console.log('Run something else');
        done();
    });
});