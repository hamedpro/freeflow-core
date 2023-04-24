transactions are just reflecting the changes 
if you wanna reach current value of 
something you must apply 
all its transaction to the initial_value 
which is always {} in our network

our network uses WebSockets and is divided into 2 parts : 
- syncing part which makes sure all data that user has requested inside sync seed is sent to him.
- requests : just like what we have in a simple http api a range of tasks must be done by sending requests to the server through web socket messages and server then will respond.
examples would be : 
- requesting a transaction to be done. 
- login to system and stuff like that 
we have a "sync seed" which specifies which parts this particular client
wants. this "sync seed" is an array of objects in one of these schemas : 
- {type : "tree" , unit_id : string , unit_context : "packs" or ...}
> this sync seed part means keep my data synced with the tree (full tree) containg that unit
- {type : "mine"}
> this type means keep me synced with every tree that im a collaborator of at least one of its units 
