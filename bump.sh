#!env bash

[[ '' == $1 ]] && echo "Please provide version argument: x.x.x" && exit 1

git stash
npm run test
npm --no-git-tag-version version $1
git add package.json
git add package-lock.json
git commit -m $1
git tag v$1
git push --tags
git push
git stash pop
npm publish
