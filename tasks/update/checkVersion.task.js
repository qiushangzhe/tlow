var gulp = require('gulp');
require('shelljs/global');
var path = require('path');
var fs = require('fs');
require('colors');
var AsciiBanner = require('ascii-banner');
var buildPackagePath = path.resolve(process.cwd(), './node_modules/tlow/package.json');
var obj = JSON.parse(fs.readFileSync(buildPackagePath).toString());
console.log("---------------------------------------".rainbow);
console.log("团子深度定制开发流工具 ".cyan);
console.log(("当前版本："+obj.version).rainbow);
// console.log(("当前版本：1.0.2").cyan);
console.log("---------------------------------------".rainbow);
