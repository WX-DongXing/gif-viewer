#!/usr/bin/env sh

# 当发生错误时中止脚本
set -e

# 打包
yarn build

# 复制打包好的内容
cp lib/index.js dist

# cd 到构建输出的目录下
cd dist

git init

git config user.name WX-DongXing

git config user.email xingdong.com@live.com

git add -A

git commit -m 'deploy to github pages'

# 部署到 https://WX-DongXing.github.io/gif-viewer
git push -f git@github.com:WX-DongXing/gif-viewer.git master:gh-pages

rm -rf .git

cd -
