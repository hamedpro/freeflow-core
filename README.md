# how to use :
> this instruction has aimed linux and mac terminals and may not work on windows too 

clone this repositoty using this command:
```
git clone https://github.com/hamedpro/pink_rose
```

then go to this new created directory and install dependencies using this command below :

```
cd pink_rose;
npm i 
```

then create a .env file in the root and make it look like this 

```
api_port=4000
api_endpoint=http://localhost:4000
db_name=pink_rose
frontend_port=3000
```

and finally use this command below to create random values used for secret tokens and ... 
```
node create_env_randoms.cjs
```

then just start server and client with this command

```
npm run dev
```
