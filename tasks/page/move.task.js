var gulp = require('gulp');
var config = require('../../config.js');
gulp.task('move-page',function(){
    return gulp.src('src/*.html')
        .pipe(gulp.dest(config.dirList.dist))
});
