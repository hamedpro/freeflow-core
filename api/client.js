import axios from "axios";
var window = { api_endpoint: "http://localhost:4000" };
export async function custom_axios({ task, body = {} }) {
	var api_endpoint = window.api_endpoint;
	var method = "POST"; // case insensitive,
	var route = "/";

	var response = await axios({
		url: new URL(route, api_endpoint).href,
		method: method.toUpperCase(),
		data: body,
		headers: {
			"Content-Type": "application/json",
			task: task,
		},
		withCredentials: true,
	});

	return response.data;
}

// new user : it writes the entire body as a new document in db
//this is just a example
//returns json stringified of id of inserted document
//test status : passed
export var new_user = async () =>
	await custom_axios({
		task: "new_user",
	});

//returns json stringified of all users
//if body.filters is defined it will be passed to find method of mongo db
//test status : passed
export var get_users = async ({ filters = {} }) =>
	await custom_axios({
		task: "get_users",
		body: {
			filters,
		},
	});

//returns result of mongo db deleteOne method as stringified json
// deletes single document which belongs to that user from users collection
export var delete_user = async ({ user_id }) =>
	await custom_axios({
		task: "delete_user",
		body: {
			user_id,
		},
	});

//about args : user_id is necessary but only one of verf_code or password should be !undefined
//returns a json stringified boolean which indicates that user auth was done or not
//extra description : if password is included it checks user password with included one
//and if verf_code is there it will check it with the latest verf_code of that user (if present) in verf_codes collection
//important todo think about if user's password is null and we pass null to this func too
export var auth = async ({ user_id, password = undefined, verf_code = undefined }) =>
	await custom_axios({
		task: "auth",
		body: {
			user_id,
			password,
			verf_code,
		},
	});

//body should contain user_id and also kind that should be either "mobile" or "email_address"
//if this function doesnt throw anything its done
//test status : passed
export var send_verification_code = async ({ kind, user_id }) =>
	await custom_axios({
		task: "send_verification_code",
		body: {
			kind,
			user_id,
		},
	});

//inserts a new document in notes collection
//returns json : id of inserted document (new inserted note )
//test status : passed
export var new_note = async ({ creator_user_id, title, workflow_id, workspace_id }) =>
	await custom_axios({
		body: {
			creator_user_id,
			title,
			init_date: new Date().getTime(),
			workflow_id,
			workspace_id,
		},
		task: "new_note",
	});

//returns json : array of notes
export var get_user_notes = async ({ creator_user_id }) =>
	await custom_axios({
		body: {
			creator_user_id,
		},
		task: "get_user_notes",
	});

//returns json : id of inserted workspace
//test status : passed
export var new_wokspace = async ({ title, description, collaborators = [], creator_user_id }) =>
	await custom_axios({
		task: "new_workspace",
		body: {
			init_date: new Date().getTime(),
			title,
			description,
			collaborators,
			creator_user_id,
		},
	});

// test_status : passed
export var get_user_workspaces = async ({ creator_user_id }) =>
	await custom_axios({
		body: {
			creator_user_id,
		},
		task: "get_user_workspaces",
	});

// all args expect href and text are common but each time there should be only one of these : href and text
//test status : passed
export var new_note_section = async ({
	href = undefined, // either this or text
	index, // index of this section in array of that note's sections
	note_id,
	type, // "image" or "text",
	text = undefined, //either this or href
	creator_user_id,
}) =>
	await custom_axios({
		task: "new_note_section",
		body: {
			init_date: new Date().getTime(),
			index,
			note_id,
			type,
			href,
			text,
			creator_user_id,
		},
	});

export var get_note_sections = async ({ note_id }) =>
	await custom_axios({
		task: "get_note_sections",
		body: {
			note_id,
		},
	});

//returns id of inserted row
export var new_task = async ({
	linked_notes,
	parent,
	end_date,
	deadline_date,
	workflow_id,
	creator_user_id,
	workspace_id,
	start_date,
}) =>
	await custom_axios({
		task: "new_task",
		body: {
			init_date: new Date().getTime(),
			linked_notes,
			parent,
			end_date,
			deadline_date,
			workflow_id,
			creator_user_id,
			workspace_id,
			start_date,
		},
	});

//todo test from here to the bottom (in current commit)
export var get_tasks = async ({ pyramid_mode = false, filters = {} }) =>
	await custom_axios({
		task: "get_tasks",
		body: {
			pyramid_mode,
			filters,
		},
	});

export var get_workspace_workflows = async ({ workspace_id }) =>
	await custom_axios({
		task: "get_workspace_workflows",
		body: {
			workspace_id,
		},
	});

export var new_workflow = async ({workspace_id,creator_user_id, title, description, collaborators = [] }) =>
	await custom_axios({
		task: "new_workflow",
		body: {
			title,
			description,
			collaborators,
			init_date: new Date().getTime(),
			workspace_id,
			creator_user_id
		},
	});

export var update_user = async({
	kind,
	new_value,
	user_id
}) => await custom_axios({
	task: "update_user",
	body: {
		kind,
		new_value,
		user_id
	}
})