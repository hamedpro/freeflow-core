transactions are just reflecting the changes 
if you wanna reach current value of 
something you must apply 
all its transaction to the initial_value 
which is always {} in our network

our network uses WebSockets and is divided into 2 parts : 
- syncing part which makes sure all transactions that is discoverable by user(user has read access to them ) is sent to the user 

> transactions that we must transfer over network can get too much in this system but 1- they are all just changes 2- they are simple texts which we can compress them sometimes over 65 % using xz compressing algorithm.
if we show a very nice progress state when we are loading them (showing how much of work is done realtime) and cache them inside users device for next times we can use this system's benefits : with this system we have not any data fetching delay any more (even 1ms) and this is great for messages system and searching stuff :)

- requests : just like what we have in a simple http api a range of tasks must be done by sending requests to the server through web socket messages and server then will respond.
examples would be : 
1- requesting a transaction to be done. 
2-  login to system and stuff like that 

how transactions are saved ? 
transactions are simple objects which hold the changes of "things". 
> _id field of this transaction below is converted to string. the only place _id is a mongodb objectId is when we are communicating directly with mongodb. everywhere in virtual_transactions and when transfering transactions over network using json we face _id in string format  
```
{_id : string, diff : result of getDiff of package "recursive-diff" , time : unix_timestamp as int}
``` 
