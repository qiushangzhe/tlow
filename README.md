# 团子 深度定制 自动化工具流 “TLOW”

## 安装使用说明

#### step 1.
``npm install https://github.com/qiushangzhe/tlow.git --save``

#### step 2.
执行gulp

#### step 3.
自动创建目录 开发环境 src文件夹

看一下src下对应子文件夹 就知道干啥的了。

## 目前需要定制功能

- 静态服务 热更新
- sass 编译
- js 压缩处理
- 开发文件夹和产出文件夹分离

## 1.0.2 fix
1.导出的css无法压缩
2.js无法做到热更
3.每次报错需要重新编译gulp
4.js每一步操作都需要重新gulp
启动方式分为两种：
- gulp 是默认
- gulp css-concat 是将所有scss编译后打包成一个main.css


## 1.0.3更新

- 增加png和jpeg图片的无损压缩功能。
- 补充图片文件的移动和监听
- 增加javascript的sourcemap 仅在chrom下生效。

## 1.0.4 更新

- 增加版本显示
