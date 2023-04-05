#!/bin/bash

#this file must be added as a cron job 
# in cron command before running this file do cd cloned project directory 

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})
FILE="./last_running_process"

if [ ! -f "$FILE" ]; then
    npm start ;
elif [[ $LOCAL == $BASE ]]; then 
    echo "Behind upstream branch.\n";
    echo "shuting service down to start again after applying changes ...\n";

    kill $(cat $FILE) 2> /dev/null ;
    npm start;
fi
