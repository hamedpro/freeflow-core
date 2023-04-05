function start(){
    git pull ;
    npm install ;
    node ./export_env_dot_json.js ; 
    source ./.env ;
    node ./api/server.js &
    npx tailwindcss -c ./tailwind.config.cjs -i ./src/input.css -o ./src/output.css ;
    vite build ;
    node ./frontend_server.js &
};
start ;
echo $! > ./last_running_process ;
wait 
#function cleanup(){
    # get the PIDs of all background processes
#    pids=$(jobs -p)

    # loop through the PIDs and kill each process
#    for pid in $pids; do
#        kill $pid
#    done 
#};
#trap "echo 'hamed is here'" SIGINT ;
#trap cleanup SIGINT;