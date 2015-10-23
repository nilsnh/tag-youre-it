'use strict';

var gulp = require('gulp');
var sourcemaps = require('gulp-sourcemaps');
var browserSync = require('browser-sync').create();
var del = require('del');
var flatten = require('gulp-flatten');
var ts = require('gulp-typescript');
var merge = require('merge2');
var concat = require('gulp-concat');

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
    .pipe(gulp.dest('dist'));
});

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
    'node_modules/bootstrap/**/*',
    'node_modules/angular/**/*',
    'node_modules/jquery/**/*'
    ], {base: 'node_modules'})
  .pipe(gulp.dest('dist/vendor'));
});

gulp.task('clean', function () {
  return del('dist');
});

gulp.task('serve', ['scripts', 'dist', 'dist-node-modules'], function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
          baseDir: "./dist",
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("src/**/*.ts", ['scripts']);
    gulp.watch([
      "src/**/*.html",
      "src/**/*.css",
      "src/**/*.js"
      ], ['dist']);
    gulp.watch("dist/**/*").on("change", browserSync.reload);
});