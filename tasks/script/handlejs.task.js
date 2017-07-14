var gulp = require('gulp');
var path = require('path');
var eslint = require('gulp-eslint');
// var webpack = require('webpack');
// var webpackGulp = require('gulp-webpack');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
// var eslink_conf = require('./eslint.config.js');
// console.log(eslink_conf);
// var webpackPath = path.join(__dirname,'../..','webpack.config.js');
//实时监听js的变化
// gulp.task('js', function() {
//     return gulp.src('src/app.js')
//         .pipe(webpackGulp(require(webpackPath)), webpack)
//         .pipe(gulp.dest('./dist/scripts'));
// });

gulp.task('js',function(){
    return gulp.src('src/scripts/*.js')
    // .pipe(eslint(eslink_conf))
    // .pipe(eslint.format())
    .pipe(gulp.dest('dist/scripts'));
});

gulp.task('js-bundle',function(){
    return gulp.src('src/scripts/*.js')
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(uglify())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist/scripts'));
});

// path.join(__dirname,'..','..','dist'))
