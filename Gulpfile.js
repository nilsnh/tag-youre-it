'use strict';

var gulp = require('gulp');
var $ = require('gulp-load-plugins')({
  pattern: ['gulp-*', 'del', 'merge2'],
  rename: {
    'merge2': 'merge'
  }
});
var browserSync = require('browser-sync').create();
var tsProject = $.typescript.createProject('tsconfig.json', {
  sortOutput : true
});

gulp.task('scripts', function() {
  var tsResult = gulp.src('src/*.ts')
  .pipe($.sourcemaps.init())
  .pipe($.typescript(tsProject));

  return tsResult.js
    .pipe($.concat('bundle.js'))
    .pipe($.ngAnnotate())
    .pipe($.sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(gulp.dest('tmp'));
});

// build project for serving up locally
gulp.task('tmp', ['scripts', 'dist-node-modules'], function () {
  return gulp.src([
    'src/**/*.html',
    'src/**/*.css',
    'src/load-menu-for-web-testing.js'
    ], {base: 'src'})
  .pipe($.flatten())
  .pipe(gulp.dest('tmp'));
});

// build project for loading up in Chrome
gulp.task('dist', ['tmp'], function () {
  return $.merge([
    gulp.src([
      'tmp/**/*',
      '!tmp/index.html',
      '!tmp/load-menu-for-web-testing.js'
    ], {base: 'tmp'}),
    gulp.src(
      'src/plugin-specific/**/*',
      {base: 'src/plugin-specific'})
    ])
    .pipe(gulp.dest('dist'));
});

gulp.task('dist-node-modules', function () {
  var cssDeps = gulp.src([
    'node_modules/bootstrap/**/*'
    ], {base: 'node_modules'});
  var jsDeps = gulp.src([
    'node_modules/angular/angular.js',
    'node_modules/jquery/dist/jquery.js',
    'node_modules/ngstorage/ngStorage.js',
    'node_modules/node-uuid/uuid.js',
    'node_modules/rangy/lib/rangy-core.js',
    'node_modules/rangy/lib/rangy-serializer.js',
    'node_modules/rangy/lib/rangy-selectionsaverestore.js',
    'src/lodash.js'
    ], {base: 'node_modules'})
  .pipe($.sourcemaps.init())
  .pipe($.concat('vendor.js'))
  .pipe($.sourcemaps.write());

  return $.merge([cssDeps, jsDeps])
    .pipe(gulp.dest('tmp/vendor'));
});

gulp.task('clean', function () {
  return $.del(['tmp', 'dist']);
});

gulp.task('watch-plugin', ['dist'], function () {
  gulp.watch("src/**/*", ['dist']);
});

gulp.task('serve', ['tmp'], function () {
  // Serve files from the root of this project
  browserSync.init({
    server: {
      baseDir: "./tmp"
    },
    notify: false
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