var gulp = require('gulp');
var gulpSass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
// var concat = require('gulp-concat');
gulp.task('sass',function(){
    return gulp.src('src/style/*.scss')
    .pipe(gulpSass().on('error', gulpSass.logError))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
    // .pipe(concat('main.css'))
    .pipe(gulp.dest('dist/style'));
});
