var gulp = require('gulp');
var fs = require('fs');
var config = require('../../config.js');

gulp.task('init-project', function() {
    //创建相关文件夹
    for (var i in config.dirList) {
        if (!fs.existsSync(config.dirList[i])) {
            fs.mkdirSync(config.dirList[i]);
        }
    };

    //创建相关文件
    for (var i in config.fileList) {
        if (!fs.existsSync(config.fileList[i].path)) {
            fs.writeFileSync(config.fileList[i].path, config.fileList[i].template, 'utf8');
        }
    }
});
