# how to use :
> this instruction has aimed linux and mac terminals and may not work on windows too 

clone this repositoty using this command:
```
git clone https://github.com/hamedpro/pink_rose
```

then install a mongodb server on your system by following installation instruction provided on their website :
https://www.mongodb.com/docs/manual/installation/
 
<br />

then go to this newly created directory and install global and local npm dependencies using this command below :

```
cd pink_rose;
npm i -g nodemon http-server ; npm i
```
then finally init a ".env" file. this command below creates a .env file and fills it with default configuration 

> you can then change configuration manually (if you dont want the default configs) by editing .env file directly

```
node create_env_randoms.cjs
```

then to start the project (both api and frontend) in development mode run this command below 

```
npm run dev
```

congrats you did it !