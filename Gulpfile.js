var gulp        = require('gulp');
var browserSync = require('browser-sync').create();

// use default task to launch Browsersync and watch JS files
gulp.task('serve', function () {

    // Serve files from the root of this project
    browserSync.init({
        server: {
          baseDir: "./",
          index: "prototype-menu.html"
        }
    });

    // add browserSync.reload to the tasks array to make
    // all browsers reload after tasks are complete.
    gulp.watch("**/*").on('change', browserSync.reload);
});