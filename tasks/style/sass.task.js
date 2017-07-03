var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var notify = require("gulp-notify");
// var concat = require('gulp-concat');
gulp.task('sass',function(){
    return sass('src/style/*.scss',{style:'expanded'})
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/style'));
});
