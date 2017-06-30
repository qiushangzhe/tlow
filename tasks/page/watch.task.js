var gulp = require('gulp');
var config = require('../../config.js');
gulp.task('watch-page',['move-page'],function(){
    return gulp.watch('src/*.html',function(info){
        if(info.type != 'deleted'){
            gulp.src(info.path)
                .pipe(gulp.dest(config.dirList.dist))
        }
    });
});
