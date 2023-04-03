function start(){
    git pull ;
    npm install ;
    node ./export_env_dot_json.js ; 
    source ./.env ;
    node ./api/server.js &
    npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css ;
    vite build --base ./ ;
    cp ./dist/index.html ./dist/404.html
    http-server --cors -p $frontend_port -c 1 ./dist;
};
start ;
echo $! > ./last_running_process ;
