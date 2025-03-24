#!/bin/bash

# positional arguments
username=$1
host=$2

# build with bun
bun run build

# use rsync
rsync -avz dist/ ${username}@${host}:~/../../var/www/html/apps/hga/
