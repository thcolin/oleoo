#!/usr/bin/env bash
set -e

[[ $1 =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "Please provide version argument: x.x.x" && exit 1; }

# A Go module of major version 2 or more carries it in its path.
major=${1%%.*}
if [[ $major -ge 2 ]] && ! grep -q "^module github.com/thcolin/oleoo/packages/go/v$major$" packages/go/go.mod; then
  echo "packages/go/go.mod must end with /v$major for $1" && exit 1
fi

command -v cargo >/dev/null || PATH="$(dirname "$(rustup which cargo)"):$PATH"

yarn test
(cd packages/go && go test ./...)
(cd packages/rust && cargo test --release)

trap 'git checkout HEAD -- packages/js/package.json packages/rust/Cargo.toml packages/rust/Cargo.lock' ERR
(cd packages/js && npm --no-git-tag-version version $1)
sed -i.bak "s/^version = \".*\"/version = \"$1\"/" packages/rust/Cargo.toml && rm packages/rust/Cargo.toml.bak
(cd packages/rust && cargo check --quiet)
git add packages/js/package.json packages/rust/Cargo.toml packages/rust/Cargo.lock
git commit -m $1
trap - ERR

git tag v$1
git tag packages/go/v$1
git push --tags
git push
(cd packages/js && npm publish)
