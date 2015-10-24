'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var flatten = require('gulp-flatten');
var ts = require('gulp-typescript');
var merge = require('merge2');
var concat = require('gulp-concat');
var fileinclude = require('gulp-file-include');

var tsProject = ts.createProject('tsconfig.json', {
  sortOutput : true
});

gulp.task('scripts', function() {
  var tsResult = gulp.src('src/*.ts')
  .pipe(sourcemaps.init())
  .pipe(ts(tsProject));

  return tsResult.js
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(gulp.dest('tmp'));
});

// build project for serving up locally
gulp.task('tmp', ['scripts', 'dist-node-modules'], function () {
  return gulp.src([
    'src/**/*.html',
    'src/**/*.css',
    'src/content_script_web.js'
    ], {base: 'src'})
  .pipe(flatten())
  .pipe(fileinclude({
    prefix: '@@',
    basePath: '@file'
  }))
  .pipe(gulp.dest('tmp'));
});

// build project for loading up in Chrome
gulp.task('dist', ['tmp'], function () {
  var tmp = gulp.src([
    'tmp/**/*',
    '!tmp/index.html',
    '!tmp/content_script_web.js'
  ], {base: 'tmp'});
  var chromePluginResources = gulp.src([
    'src/content_script.js',
    'manifest.json'
  ])
  .pipe(flatten())
  .pipe(fileinclude({
      prefix: '@@',
      basePath: '@file'
  }));

  return merge([tmp, chromePluginResources])
  .pipe(gulp.dest('dist'));
});

gulp.task('dist-node-modules', function () {
  return gulp.src([
    'node_modules/bootstrap/**/*',
    'node_modules/angular/**/*',
    'node_modules/jquery/**/*'
    ], {base: 'node_modules'})
  .pipe(gulp.dest('tmp/vendor'));
});

gulp.task('clean', function () {
  return del(['tmp', 'dist']);
});

gulp.task('serve', ['tmp'], function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "./tmp",
    }
  });

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.watch("src/**/*.ts", ['scripts']);
  gulp.watch([
    "src/**/*.html",
    "src/**/*.css",
    "src/**/*.js"
    ], ['tmp']);
  gulp.watch("tmp/**/*").on("change", browserSync.reload);
});