#this file is just a playground to play with bash

FILE="./current_running_process"
if [ -f "$FILE" ]; then
    cat ./current_running_process;
else 
    echo "$FILE does not exist."
fi