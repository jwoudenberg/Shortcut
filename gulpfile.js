var gulp = require('gulp');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var sass = require('gulp-sass');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');

gulp.task('js', function watchJs() {
    var bundler = watchify(browserify(watchify.args));
    bundler.add('./src/index.js');
    bundler.transform(babelify);
    bundler.on('update', bundle);
    bundler.on('log', gutil.log);
    return bundle();

    function bundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({loadMaps: true}))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    }
});

gulp.task('sass', function watchSass() {
    var STYLE_PATH = './style/**/*.scss';
    watch(STYLE_PATH, bundle);

    return bundle();

    function bundle() {
        return gulp.src(STYLE_PATH)
            .pipe(sourcemaps.init())
            .pipe(sass({
                onSuccess: function logResult() { console.log('SASS recompiled.'); },
                errLogToConsole: true
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    }
});

gulp.task('default', ['js', 'sass']);
