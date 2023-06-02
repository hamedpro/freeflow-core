#!/bin/bash
if [[ -f "~/.pink_rose_data/env.json" ]]; then 
    echo "'~/.pink_rose_data/env.json' does not exist. create it and try again"; 
    exit 1 ; 
fi; 
node ./api_dist/api/server.js &
tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css ;
vite build ;
node ./frontend_server.js &
wait