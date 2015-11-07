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
  var tsResult = gulp.src('src/**/*.ts')
  .pipe($.sourcemaps.init())
  .pipe($.typescript(tsProject));

  return tsResult.js
    .pipe($.ngAnnotate())
    .pipe($.sourcemaps.write()) // Now the sourcemaps are added to the .js file
    .pipe(gulp.dest('tmp'));
});

// build project for serving up locally
gulp.task('tmp', ['scripts', 'dist-node-modules'], function () {
  return gulp.src([
    'src/**/*.html',
    'src/**/*.css',
    'src/content_script_web.js'
    ], {base: 'src'})
  .pipe($.flatten())
  .pipe($.fileInclude({
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
  var imageAssets = gulp.src('src/plugin-specific/*.png').pipe($.flatten());
  var chromePluginResources = gulp.src([
    'src/plugin-specific/**/*',
    '!src/plugin-specific/*.png',
  ])
  .pipe($.flatten())
  .pipe($.fileInclude({
    prefix: '@@',
    basePath: '@file'
  }));

  return $.merge([tmp, chromePluginResources, imageAssets])
  .pipe(gulp.dest('dist'));
});

gulp.task('dist-node-modules', function () {
  return gulp.src([
    'node_modules/bootstrap/**/*',
    'node_modules/angular/**/*',
    'node_modules/jquery/**/*',
    'node_modules/lodash/**/*',
    'node_modules/requirejs/**/*'
    ], {base: 'node_modules'})
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
      baseDir: "./tmp",
    }
  });

  // add browserSync.reload to the tasks array to make
  // all browsers reload after tasks are complete.
  gulp.watch("src/**/*.ts", ['serve-reload-scripts']);
  gulp.watch([
    "src/**/*.html",
    "src/**/*.css",
    "src/**/*.js"
    ], ['serve-reload-other']);
});

gulp.task('serve-reload-scripts', ['scripts'], function (done) {
  browserSync.reload;
  done();
});

gulp.task('serve-reload-other', ['tmp'], function (done) {
  browserSync.reload;
  done();
});