'use strict';

var watchify = require('watchify');
var browserify = require('browserify');
var tsify = require('tsify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');
var sourcemaps = require('gulp-sourcemaps');
var assign = require('lodash.assign');
var browserSync = require('browser-sync').create();
var del = require('del');
var flatten = require('gulp-flatten');

// add custom browserify options here
var customOpts = {
  entries: ['./src/index.ts'],
  debug: true
};
var opts = assign({}, watchify.args, customOpts);
var b = watchify(browserify(opts));

// add transformations here
// i.e. b.transform(coffeeify);

gulp.task('typescript', bundle); // so you can run `gulp js` to build the file
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b
    .plugin('tsify', { noImplicitAny: true })
    .bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./dist'));
}

gulp.task('dist', ['dist-node-modules'], function () {
  return gulp.src([
    'src/**/*.html',
    'src/**/*.css',
    'src/**/*.js'
    ], {base: 'src'})
    .pipe(flatten())
    .pipe(gulp.dest('dist'));
});

gulp.task('dist-node-modules', function () {
  return gulp.src([
    'node_modules/bootstrap/**/*'
    ], {base: 'node_modules'})
    .pipe(gulp.dest('dist/vendor'));
});

gulp.task('clean', function () {
  return del('dist');
});

// use default task to launch Browsersync and watch JS files
gulp.task('serve', ['typescript', 'dist'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
          baseDir: "./dist",
          index: "index.html"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch([
      "dist/bundle.js",
      "src/**/*.html",
      "src/**/*.js",
      "src/**/*.css",
      ])
    .on('change', browserSync.reload);
});