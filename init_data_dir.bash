#!/bin/bash
data_dir="$HOME/.freeflow_data"
[ -d $data_dir ] && echo "data dir already exists." && exit 1 ;
mkdir -p "${data_dir}/uploads" ; 
echo "[]" > "${data_dir}/store.json" ; 
cp ./env_template.json "${data_dir}/env.json" ;
vi "${data_dir}/env.json" ; 