tsc; 
( tsc --watch >&1 ) & 
vite &
tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css --watch=always &
nodemon ./api_dist/api/server.js &
wait