node ./export_env_dot_json.js ; 
source ./.env ;
npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css --watch & 
vite --host --strictPort --port $frontend_port &
nodemon ./api/server.js &
wait 