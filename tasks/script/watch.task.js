var gulp = require('gulp');
gulp.task('watch-js',['js'],function(){
    return gulp.watch('src/*.js',function(){
        gulp.run('js');
    });
});
