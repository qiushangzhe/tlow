var gulp = require('gulp');
gulp.task('watch-js',['js'],function(){
    return gulp.watch('src/scripts/*.js',function(){
        gulp.run('js');
    });
});
