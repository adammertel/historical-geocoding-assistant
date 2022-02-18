#!/bin/bash

# positional arguments
username=$1
host=$2

# use rsync
scp -r packages/client/dist/* ${username}@${host}:/var/www/html/apps/inkvisitor-staging
rsync -avz dist/ ${username}@${host}:~/../../var/www/html/apps/hga/
