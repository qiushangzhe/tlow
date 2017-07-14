var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var config = require('../config.js');
gulp.task('default',function(cb){
    gulpSequence('version','init-project','watch-style','watch-js','watch-page','watch-image','open-static-server',cb)
});

gulp.task('bundle',function(cb){
    gulpSequence('version','move-page','js-bundle','sass','image-bundle','bundle-over',cb);
});

gulp.task('bundle-css-concat',function(cb){
    gulpSequence('move-page','js-bundle','sass-concat','image-bundle','bundle-over',cb);
});
