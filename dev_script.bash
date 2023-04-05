node ./export_env_dot_json.js ; 
source ./.env ;
vite --host --strictPort --port $frontend_port &
tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css --watch=always &
nodemon ./api/server.js &
wait