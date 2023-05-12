node ./export_env_dot_json.js ; 
source ./.env ;
node ./api/server.js &
npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css ;
vite build ;
node ./frontend_server.js &
wait