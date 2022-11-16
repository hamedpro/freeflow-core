import axios from "axios";
var window = { api_endpoint: "http://localhost:4000" };
export async function custom_axios({
	api_endpoint = window.api_endpoint,
	route,
	method = "GET", // case insensitive,
	body = {},
	return_response_dot_data = true // set it to false if you want the reponse itself
}) {
	var response = await axios({
		url: new URL(route, api_endpoint).href,
		method: method.toUpperCase(),
		data: body,
		headers: {
			'Content-Type': 'application/json'
			}
	});
	return response.data;
}

export var get_root = async () =>
	await custom_axios({
		route: "/",
	});

export var new_user = async ({ username,
	password,
	subscribtion_plan = null,
	email_address,
	mobile}) =>
	await custom_axios({
		route: "/users",
		method: "POST",
		body: {
			username,
			password,
			subscribtion_plan,
			email_address,
			mobile
		},
	});

export var login = async({
	username,
	email_address,
	mobile,
	password,
	login_method
}) => {
	if ([username, email_address, mobile].filter(i => i !== undefined) !== 1) {
		throw "error was occured in login function of api driver : just one of these fields should be defined : [username,email_address,mobile]"
	}
	var used_value = username ? "username" : (mobile ? "mobile" : "email_address")
	var request_body = {}
	request_body[used_value] = username ? username : (mobile ? mobile : email_address)
	request_body["password"] = password
	request_body['login_method'] = login_method
	return await custom_axios({
		route: '/login',
		body
	})
}
export var get_user = async ({ username }) =>
	await custom_axios({
		route: `/users/${username}`,
	});

export var delete_user = async ({ username }) =>
	await custom_axios({
		route: `/users/${username}`,
		method: "delete",
	});

export var new_note = async ({
	creator, // username
	init_date,
	last_modification, //should be in format of new Date.getTime()
}) =>
	await custom_axios({
		route: `/users/${creator}/notes`,
		method: "post",
		body: {
			init_date,
			last_modification,
		},
	});

export var get_notes = async ({ username }) =>
	await custom_axios({
		route: `/users/${username}/notes`,
	});

export var delete_note = async ({ username, note_id }) =>
	await custom_axios({
		route: `/users/${username}/notes/${note_id}`,
		method: "delete",
	});

export var update_note = async ({ username, note_id, last_modification }) =>
	await custom_axios({
		route: `/users/${username}/notes/${note_id}`,
		method: "patch",
		body: {
			last_modification,
		},
	});

export var new_workspace = async ({ creator, init_date, title, description }) =>
	await custom_axios({
		route: `/users/${username}/workspaces`,
		method: "post",
		body: {
			init_date,
			title,
			description,
		},
	});

export var get_workspaces = async ({ username }) =>
	await custom_axios({
		route: `/users/${username}/workspaces`,
	});

export var update_workspace = async ({ username, workspace_id }) =>
	await custom_axios({
		route: `/users/${username}/workspaces/${workspace_id}`,
		method: "patch",
	});

export var delete_workspace = async ({ username, workspace_id }) =>
	await custom_axios({
		route: `/users/${username}/workspaces/${workspace_id}`,
		method: "delete",
	});

export var new_note_section_image = async ({
	init_date,
	href,
	index, // index of this section in array of that note's sections
	last_modification,
	note_id,
}) =>
	await custom_axios({
		//this func asks server to add a note section with type "image"
		route: `/users/${creator}/notes/${note_id}/note_sections`,
		method: "post",
		body: {
			init_date,
			href,
			index,
			last_modification,
			type: "image",
		},
	});

export var new_note_section_text = async ({
	init_date,
	text,
	index, // index of this section in array of that note's sections
	last_modification,
	note_id,
}) =>
	await custom_axios({
		//this func asks server to add a note section with type "text"
		route: `/users/${creator}/notes/${note_id}/note_sections`,
		method: "post",
		body: {
			init_date,
			text,
			index,
			last_modification,
			type: "text",
		},
	});

export var get_note_sections = async ({ note_id, creator }) =>
	await custom_axios({
		route: `/users/${creator}/notes/${note_id}/note_sections`,
	});
export var new_task = async ({
	linked_notes = [],
	parent = null, // so if not specified this task will be the starting node
	end_date = null,
	deadline_date = null,
	creator,
	workflow_id,
}) =>
	await custom_axios({
		route: `/users/${creator}/workflows/${workflow_id}/tasks`,
		method: "POST",
		body: {
			linked_notes,
			parent,
			end_date,
			deadline_date,
			init_date: new Date().getTime(),
			last_modification: new Date().getTime(),
			workflow_id,
			creator,
		},
	});
export var get_workflow_tasks_pyramid = async ({ username, workflow_id }) =>
	await custom_axios({
		url: `/users/${username}/workflows/${workflow_id}/tasks_pyramid`,
	});
export var get_workflow_tasks = async ({ workflow_id, creator }) =>
	await custom_axios({
		route: `/users/${creator}/workflows/${workflow_id}/tasks`,
	});
export var get_user_tasks = async ({ creator }) => await custom_axios({
	route : `/users/${creator}/tasks`
})
export var get_user_tasks_pyramid = async ({ creator }) => await custom_axios({
	route : `/users/${creator}/tasks_pyramid`
})
