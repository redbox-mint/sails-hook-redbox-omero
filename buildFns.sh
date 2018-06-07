#!/bin/bash

# Expects a source and target

function linkNodeLib() {
  source=$1
  target=$2
  current_user=`whoami`

  sudo chown -R $current_user:$current_user "node_modules"
  cd "node_modules"
  sourcedir="${source}"
  targetdir="${target}"
  if [ -e "$targetdir" ]; then
    rm -rf $targetdir
  fi
  echo "Linked $sourcedir <-- $targetdir"
  ln -s $sourcedir $targetdir
  cd -
}

function removeJs() {
  echo "Cleaning up JS files in... ${1}"
  for tsFile in $(find $1 -name '*.ts' -print0 | xargs -0)
  do
    basename=${tsFile%.*}
    dirname=$(dirname "$tsFile")
    jsfile="${dirname}/${basename}.js"
  #  echo "Removing $jsfile"
    rm -rf "$jsfile"
  done
}

function cleanUpAllJs() {
  jsDirs=( "assets/angular" "typescript" "api" )
  for dir in "${jsDirs[@]}"
  do
    removeJs $dir
  done
}
