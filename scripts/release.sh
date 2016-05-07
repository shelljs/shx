#!/usr/bin/env bash

# require npm user
# bump package version
# commit
# create tag
# push commit & tag
# publish

usage() {
  echo ""
  echo "  Usage: bash $0 <major|minor|patch>"
}

run() {
  local version=$1
  local npm_user=$(npm whoami)
  local is_collaborator=$(npm access ls-collaborators | grep ".*$npm_user.*:.*write.*")
  local is_owner=$(npm owner ls | grep ".*$npm_user <.*")

  if [[ "$npm_user" ]]; then
    if [[ "$is_collaborator" ]] || [[ "$is_owner" ]]; then
      echo "Publishing new $version version as $npm_user."
      echo ""
      npm version ${version}
      git push
      git push --follow-tags
      npm publish
    else
      echo "$npm_user does not have NPM write access. Request access from one of these fine folk:"
      echo ""
      npm owner ls
    fi
  else
    echo "You must be logged in to NPM to publish, run \"npm login\" first."
  fi
}

case $1 in
  "major" | "minor" | "patch")
    run $1
  ;;

  *)
    usage
    exit 1
  ;;
esac
