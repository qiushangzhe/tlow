var gulp = require('gulp');
gulp.task('watch-style',['sass'],function(){
    return gulp.watch('src/style/*.scss',function(){
        gulp.run('sass');
    });
});

gulp.task('watch-style-concat',['sass-concat'],function(){
    return gulp.watch('src/style/*.scss',function(){
        gulp.run('sass');
    });
});
