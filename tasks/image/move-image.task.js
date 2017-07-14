var gulp = require('gulp');
var smushit = require('gulp-smushit');

gulp.task('move-image',function(){
    return gulp.src('src/images/*')
    .pipe(gulp.dest('dist/images'));
})


gulp.task('image-bundle',function(){
    return gulp.src('src/images/*')
    .pipe(smushit({
        verbose: true
    }))
    .pipe(gulp.dest('dist/images'));
})
