var gulp = require('gulp');

gulp.task('watch-image',['move-image'],function(){
    return gulp.watch('src/images/*',function(info){
        if(info.type != 'deleted'){
            gulp.src(info.path)
                .pipe(gulp.dest('dist/images'))
        }
    });
});
