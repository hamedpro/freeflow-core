#!/bin/bash
if [ ! -f "$(echo $HOME)/.freeflow_data/env.json" ]; then 
    echo "'~/.freeflow_data/env.json' does not exist. create it and try again";
    exit 1 
fi;
tsc; 
( tsc --watch >&1 ) & 
vite &
tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css --watch=always &
nodemon ./api_dist/api/server.js &
wait