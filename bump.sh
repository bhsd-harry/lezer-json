#!/usr/local/bin/bash
gsed -i -E "s/\"version\": \".+\"/\"version\": \"$1\"/" package.json
npm run lint && npm run build
if [[ $? -eq 0 ]]
then
	git add -A
	git commit -m "chore: bump version to $1"
	git push
	git tag "$1"
	git push origin "$1"

	# GitHub release
	gsed -n "/## $1/,/##/{/^## .*/d;/./,\$!d;p}" CHANGELOG.md > release-notes.md
	gh release create "$1" --notes-file release-notes.md -t "v$1" --verify-tag --latest="${2-true}"
	rm release-notes.md

	# npm publish
	npm publish --tag "${2-latest}"
fi
