var gulp = require('gulp');
var gulpSequence = require('gulp-sequence');
var config = require('../config.js');
gulp.task('default',function(cb){
    gulpSequence('init-project','watch-style','watch-js','watch-page','watch-image','open-static-server',cb)
});

gulp.task('css-concat',function(cb){
    gulpSequence('init-project','watch-style-concat','watch-js','watch-page','watch-image','open-static-server',cb)
});
