import axios from "axios";
var window = { api_endpoint: "http://localhost:4000" };
export async function custom_axios({task,body = {}}) {
	var api_endpoint = window.api_endpoint;
	var method = "POST"; // case insensitive,
	var route = "/";

	var response = await axios({
		url: new URL(route, api_endpoint).href,
		method: method.toUpperCase(),
		data: body,
		headers: {
			"Content-Type": "application/json",
			"task" : task
		},
		withCredentials: true,
	});

	return response.data;
}


// new user : it writes the entire body as a new document in db 
//this is just a example
//returns json stringified of id of inserted document
//test status : passed
export var new_user = async () => await custom_axios({
	task : "new_user"
})

//returns json stringified of all users 
//if body.filters is defined it will be passed to find method of mongo db
//test status : passed 
export var get_users = async ({ filters ={} }) => await custom_axios({
	task: "get_users",
	body: {
		filters
	}
})

//returns result of mongo db deleteOne method as stringified json
// deletes single document which belongs to that user from users collection 
export var delete_user = async ({ user_id }) => await custom_axios({
	task: "delete_user",
	body: {
		user_id
	}
})

//about args : user_id is necessary but only one of verf_code or password should be !undefined
//returns a json stringified boolean which indicates that user auth was done or not
//extra description : if password is included it checks user password with included one 
//and if verf_code is there it will check it with the latest verf_code of that user (if present) in verf_codes collection
//important todo think about if user's password is null and we pass null to this func too 
export var auth = async ({ user_id, password = undefined, verf_code = undefined }) => await custom_axios({
	task: "auth",
	body: {
		user_id,
		password,
		verf_code
	}
})

//body should contain user_id and also kind that should be either "mobile" or "email_address"
//if this function doesnt throw anything its done 
//test status : passed 
export var send_verification_code = async({ kind, user_id }) => await custom_axios({
	task: "send_verification_code",
	body: {
		kind,
		user_id
	}
})
