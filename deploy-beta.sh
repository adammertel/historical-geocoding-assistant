#!/bin/bash

# positional arguments
username=$1
host=$2

# use rsync
rsync -avz dist/ ${username}@${host}:~/../../var/www/html/apps/hga-beta/
