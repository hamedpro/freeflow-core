#!/bin/bash
if [ ! -f "$(echo $HOME)/.freeflow_data/env.json" ]; then 
    echo "'~/.freeflow_data/env.json' does not exist. create it and try again";
    exit 1 
fi;
tsc ;
node ./api_dist/api/server.js &
tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css ;
vite build ;
node ./frontend_server.js &
wait