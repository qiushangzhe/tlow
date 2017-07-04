var gulp = require('gulp');
var sass = require('gulp-ruby-sass');
var autoprefixer = require('gulp-autoprefixer');
var cssmin = require('gulp-minify-css');
var notify = require("gulp-notify");
var handleErrors = require('../error/handleError.js');
var concat = require('gulp-concat');
// 不合并的sass任务
gulp.task('sass',function(){
    return sass('src/style/*.scss',{style:'expanded'})
    .on('error',handleErrors)
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // .pipe(concat('main.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/style'));
});
// 合并的sass任务
gulp.task('sass-concat',function(){
    return sass('src/style/*.scss',{style:'expanded'})
    .on('error',handleErrors)
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    .pipe(concat('main.css'))
    .pipe(cssmin())
    .pipe(gulp.dest('dist/style'));
});
