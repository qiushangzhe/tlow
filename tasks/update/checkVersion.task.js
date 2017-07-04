var gulp = require('gulp');
require('shelljs/global');
var path = require('path');
gulp.task('check-update',function(){
    var buildPackagePath = path.resolve(process.cwd(), './node_modules/tlow/package');
    var projectPackagePath = path.resolve(process.cwd(), './package.json');
    var curVersion = require(buildPackagePath).version;
    var targetVersion = require(projectPackagePath).devDependencies.tlow || require(projectPackagePath).dependencies.tlow || '';
    var lastVersion = exec('npm show tlow version', {
        silent: true
    }).stdout.trim();

    console.log(lastVersion);
});
