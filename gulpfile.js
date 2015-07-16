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
var uglify = require('gulp-uglify');

var argv = require('minimist')(process.argv.slice(2));
var WATCH = argv.watch;

gulp.task('js', function watchJs() {
    var bundler = browserify({ cache: {}, packageCache: {}, debug: true });
    if (WATCH) {
        bundler = watchify(bundler);
        bundler.on('update', bundle);
    }
    bundler.add('./src/index.js');
    bundler.transform(babelify);
    bundler.on('log', gutil.log);
    return bundle();

    function bundle() {
        return bundler.bundle()
            .on('error', gutil.log.bind(gutil, 'Browserify Error'))
            .pipe(source('bundle.js'))
            .pipe(buffer())
            .pipe(sourcemaps.init({ loadMaps: true }))
            .pipe(uglify())
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    }
});

gulp.task('sass', function watchSass() {
    var STYLE_PATH = './style/**/*.scss';

    if (WATCH) {
        watch(STYLE_PATH, bundle);
    }

    return bundle();

    function bundle() {
        return gulp.src(STYLE_PATH)
            .pipe(sourcemaps.init())
            .pipe(sass({
                onSuccess: function logResult() { console.log('SASS recompiled.'); },
                errLogToConsole: true,
                includePaths: [ './node_modules/bootstrap-sass/assets/stylesheets/' ]
            }))
            .pipe(sourcemaps.write('./'))
            .pipe(gulp.dest('./dist'));
    }
});

gulp.task('html', function watchHtml() {
    var HTML_PATH = './index.html';

    if (WATCH) {
        watch(HTML_PATH, bundle);
    }

    return bundle();

    function bundle() {
        return gulp.src(HTML_PATH)
        .pipe(gulp.dest('./dist'))
        .on('finish', function logResult() { console.log('HTML copied.'); });
    }

});

gulp.task('default', ['js', 'sass', 'html']);
