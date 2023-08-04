#!/bin/sh
# run this script to bundle the lambda function in python runtime.
# all files will be stored at ./dist

my_dir=$(cd $(dirname $0) && pwd)
dist_dir="$my_dir/dist"
[ -d $dist_dir ] || mkdir $dist_dir
cp -a $my_dir/.venv/lib/python3.11/site-packages/* $dist_dir
cp ${my_dir}/*.py $dist_dir

exit 0
