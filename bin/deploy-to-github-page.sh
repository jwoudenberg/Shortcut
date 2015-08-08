#!/bin/sh
set -ex
./node_modules/.bin/webpack
cd dist
rm -rf .git
git init
git add .
git commit -m 'Deploy frontend.'
git push -f 'git@github.com:jwoudenberg/shortcut.git' master:gh-pages
rm -rf .git
