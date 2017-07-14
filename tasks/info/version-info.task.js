var gulp = require('gulp');
require('shelljs/global');
var path = require('path');
var fs = require('fs');
require('colors');
const boxen = require('boxen');

// var buildPackagePath = path.resolve(process.cwd(), './node_modules/tlow/package.json') || '';
// if(buildPackagePath){
    // var obj = JSON.parse(fs.readFileSync(buildPackagePath).toString());
// }

// console.log("---------------------------------------".rainbow);
// console.log("团子深度定制开发流工具 ".cyan);
// console.log(("当前版本："+obj.version).rainbow);
// console.log(("当前版本：1.0.2").cyan);
// console.log("---------------------------------------".rainbow);

gulp.task('version',function(){
    var obj = {};
    if(fs.existsSync(path.resolve(process.cwd(),'node_modules'))){
        var buildPackagePath = path.resolve(process.cwd(), './node_modules/tlow/package.json')
        obj = JSON.parse(fs.readFileSync(buildPackagePath).toString());
    }else{
        obj.version = "测试ing";
    }
    console.log(boxen("团子深度定制开发流工具\n当前版本:"+obj.version, {
        padding: 1,
        borderStyle: 'double-single',
        dimBorder:true,
        borderColor:'yellow',
        float:'left',
        align:"center"
    }));
});
