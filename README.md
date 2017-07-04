# 团子 深度定制 自动化工具流 “TLOW”


## 目前需要定制功能

- 静态服务 热更新
- sass 编译
- js 压缩处理
- 开发文件夹和产出文件夹分离

## fix
1.导出的css无法压缩
2.js无法做到热更
3.每次报错需要重新编译gulp
4.js每一步操作都需要重新gulp
启动方式分为两种：
- gulp 是默认
- gulp css-concat 是将所有scss编译后打包成一个main.css
