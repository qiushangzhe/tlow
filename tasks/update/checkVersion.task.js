var gulp = require('gulp');

gulp.task('check-update',function(){
    var lastVersion = exec('npm show tlow version', {
        silent: true
    }).stdout.trim();
    console.log(lastVersion);
});
