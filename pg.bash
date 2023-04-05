#this file is just a playground to play with bash
function start_bg_processes(){
top > /dev/null & 
watch curl localhost:4000 > /dev/null &
};
start_bg_processes ; 
wait ;