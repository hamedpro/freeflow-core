#!/bin/bash

#this file must be added as a cron job 

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})
FILE="./last_running_process"

if [ ! -f "$FILE" ]; then
    ./start_bash
    exit 
fi
if [[ $LOCAL == $BASE ]]; then
    echo "Behind upstream branch.\n"
    echo "shuting service down to start again after applying changes ...\n"

    kill $(cat $FILE) 2> /dev/null ;
    ./start.bash
fi
