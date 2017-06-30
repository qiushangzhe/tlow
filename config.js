var path = require('path');
var fs = require('fs');
var base = path.join(__dirname, '..');
var src = 'src';
var script = 'scripts';
var dist = 'dist';
var style = 'style';
var lib = 'libs';
var picture = 'images';
var views = 'views';

var dirList = {
    src : src,
    dist : dist,
    picture : path.join(src,picture),
    style : path.join(src,style),
    script : path.join(src,script),
    lib : path.join(src,lib)
}

var fileList = {
    index : {
        path : path.join(src,'index.html'),
        template:fs.readFileSync(path.join(__dirname,'template','index.html'))
    }
}

var serverConfig = {
    port : 12345
}

var config = {
    dirList : dirList,
    fileList: fileList,
    serverConfig:serverConfig
}


module.exports = config;
