#!/usr/bin/env bash
set -e

[[ '' == $1 ]] && echo "Please provide version argument: x.x.x" && exit 1

yarn test
(cd packages/js && npm --no-git-tag-version version $1)
git add packages/js/package.json
git commit -m $1
git tag v$1
git push --tags
git push
(cd packages/js && npm publish)
