<img src="./freeflow_logo.svg" width="50%" style="">
<h1>what is freeflow ?</h1>
its idea has been to be a combination of a set of selected features of great existing apps. but with a new taste. new technical concepts, special considerations with a new mindset!
<br />
<br />
these titles below will be followed with explanations soon.

- always track changes. no overwrite at all. it enables a set of features such as special time travel !!
- code is 100 transparent && completely licensed under free licenses : most MIT.
- realtime sync : by using power of websockets and react we keep the UI always reflecting the most edge changes. no more reloads. wonderful ...! 
- being extensible in every aspect. any data structure can be uploaded and it can be used however you want. it means you can extend or mofify current behaviours and apply plugins and ... in order to make this app working the exact way you want it to work in terms of : using your own security rules, building special UIs on top of existing data, supporting more platforms, writing drivers for language of your choice and much much more ... . you are completely free to focus on things that matter to you by just extending the feature set we have given.
- strict error handling : we want the most stability we can provide. everything must be well tested and issues are tracked seriously and if something go wrong, user is informed exactly. 

<h1>setting dev environment</h1>

> this instruction is meant to be used in mac or common linux distros. almost sure will not work in windows. 

all you need is to clone the repo then install npm dependencies using: 

```
npm install ; 
``` 
application data is saved in `~/.freeflow_data` <br />
application data means all env vars and uploaded files and every tranasction that will be created in application. it means everything. application will not use anywhere else in the disk even its repo dir itself. <br />
so there are a few bash scripts in root of repo to help you get thing done quickly.

```
./init_data_dir.bash // creates a .freeflow_data and required all dirs and files. fills them with initial values. for env vars it creates env.json and fills it with a template and opens vi to customize it. after changes wq the vi and all is done.

./reset_but_env.bash // it resets everything inside data dir to their initial values but env.json
```

finally when you created data dir just by a single enter using the mentioned script you can use any of npm scripts :

```
npm start ; //for production 
npm run dev ; to start development mode 
```

<b>you made it !!!!</b>

<h1>how can i contribute ?</h1>

you can contribute in many ways. we dont have a paypal or something to get donations. the best way is to help us improve the code. adding features, new grown ideas, testing and fixing bugs, refactoring and improving codes, ... 
<br />
<br />
in issues you can find something that you like more. there are tasks labeled either UX or functionality.ux ones are meant to just make something work. for example adding a feature in a certain way of implementation. not caring about if it looks good or can have better styles. on the other hand ux issues are not meant to modify behaviours that much.
<br />
<br />

also there is a label "clear" there. an issue is just an idea, when its clear enough to be implemented its clear. specs must be clear.

<h1>stable checks</h1>
there are few things that may happen any time that code changes. they have to be considered but may be forgotten.
list of them is always kept in stablility_tests.txt
when you want to say something is stable these must be checked. for example before each stable release or merge something to stable branch. 