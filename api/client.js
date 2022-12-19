import axios from "axios";
var window = { api_endpoint: "http://localhost:4000" };
export async function custom_axios({
	task,
	body = {},
	content_type_json = true,
	responseType = undefined,
}) {
	var api_endpoint = window.api_endpoint;
	var method = "POST"; // case insensitive,
	var route = "/";
	var headers = {
		task,
	};
	if (content_type_json) {
		headers["Content-Type"] = "application/json";
	}
	var conf = {
		url: new URL(route, api_endpoint).href,
		method: method.toUpperCase(),
		data: body,
		headers,
		withCredentials: true,
	};
	if (responseType) {
		conf.responseType = responseType;
	}
	var response = await axios(conf);

	return response.data;
}

// new user : it writes the entire body as a new document in db
//this is just a example
//returns json stringified of id of inserted document
//test status : passed
export var new_user = async ({ body }) =>
	await custom_axios({
		task: "new_user",
		body: body,
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
export var new_workspace = async ({ title, description, collaborators = [], creator_user_id }) =>
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

//returns id of inserted row
export var new_task = async ({
	linked_notes,
	end_date,
	workflow_id,
	creator_user_id,
	workspace_id,
	start_date,
	title,
	category_id,
}) =>
	await custom_axios({
		task: "new_task",
		body: {
			init_date: new Date().getTime(),
			linked_notes,
			end_date,
			workflow_id,
			creator_user_id,
			workspace_id,
			start_date,
			title,
			category_id,
		},
	});
//returns id of new inserted document
export var new_calendar_category = async ({ user_id, color, name }) => await custom_axios({
	task: "new_document",
	body: {
		collection_name: "calendar_categories",
		document: {
			user_id,color,name
		}
	}
})
export var new_document = async ({collection_name,document}) => await custom_axios({
	task: "new_document",
	body: {
		collection_name,
		document
	}
})
//returns an array of calendar categories with the given user_id 
export var get_calendar_categories = async ({ user_id }) => await custom_axios({
	task: "get_collection",
	body: {
		collection_name: 'calendar_categories',
		filters: {
			user_id
		}
	}
})
export var get_collection = async ({collection_name,filters }) => await custom_axios({
	task: "get_collection",
	body: {
		collection_name,
		filters
	}
})
export var get_user_events = async ({ user_id }) => await custom_axios({
	task: "get_collection",
	body: {
		collection_name: "events",
		filters: {
			creator_user_id : user_id
		}
	}
})
//returns the result of deleteOne method of mongodb 
export var delete_task = async ({ task_id }) => await custom_axios({
	task: "delete_document",
	body: {
		filters: {
			_id : task_id 
		},
		collection_name : "tasks"
	}
})
export var delete_document = async ({collection_name,filters}) => custom_axios({
	task: "delete_document",
	body: {
		filters,
		collection_name
	}
})
//returns the result of deleteOne method of mongodb 
export var delete_event = async ({ event_id }) => await custom_axios({
	task: "delete_document",
	body: {
		filters: {
			_id : event_id 
		},
		collection_name : "events"
	}
})


//returns id of inserted row
export var new_event = async ({
	end_date,
	workflow_id,
	creator_user_id,
	workspace_id,
	start_date,
	title,
	category_id,
}) =>
	await custom_axios({
		task: "new_event",
		body: {
			init_date: new Date().getTime(),
			end_date,
			workflow_id,
			creator_user_id,
			workspace_id,
			start_date,
			title,
			category_id,
		},
	});
export var update_document = async ({ collection, update_filter, update_set }) =>
	await custom_axios({
		task: "update_document",
		body: {
			collection,
			update_filter,
			update_set,
		},
	});
export var update_note = ({ note_id, update_set }) =>
	update_document({
		//todo make sure this kind of extending functions works well
		collection: "notes",
		update_filter: {
			_id: note_id,
		},
		update_set,
	});
//todo test from here to the bottom (in current commit)
export var get_tasks = async ({ filters = {} }) =>
	await custom_axios({
		task: "get_tasks",
		body: {
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

export var new_workflow = async ({
	workspace_id,
	creator_user_id,
	title,
	description,
	collaborators = [],
}) =>
	await custom_axios({
		task: "new_workflow",
		body: {
			title,
			description,
			collaborators,
			init_date: new Date().getTime(),
			workspace_id,
			creator_user_id,
		},
	});

export var update_user = async ({ kind, new_value, user_id }) =>
	await custom_axios({
		task: "update_user",
		body: {
			kind,
			new_value,
			user_id,
		},
	});

//this one search for that value in all of these values : user_ids, usernames, email_addresses, mobiles
//and returns that user which matches

export var flexible_user_finder = async ({ value }) =>
	await custom_axios({
		task: "flexible_user_finder",
		body: {
			value,
		},
	});

export var get_workflows = async ({ filters = {} }) =>
	await custom_axios({
		task: "get_workflows",
		body: {
			filters,
		},
	});

export var get_user_data_hierarchy = async ({ user_id }) =>
	await custom_axios({
		task: "get_user_data_hierarchy",
		body: {
			user_id,
		},
	});

export var upload_files = async ({ task, data = {}, input_element_id }) => {
	var form = new FormData();
	var files = document.getElementById(input_element_id).files;
	var files_data = {};
	for (var i = 0; i < files.length; i++) {
		var file = files[i.toString()];
		form.append(i.toString(), file);
		console.log(file);
		files_data[i.toString()] = {};
		for (const prop in file) {
			files_data[i.toString()][prop] = file[prop];
		}
	}
	form.append("data", JSON.stringify(data));
	form.append("files_data", JSON.stringify(files_data));

	return await custom_axios({
		content_type_json: false,
		body: form,
		task,
	});
};

export var upload_new_resources = ({ data, input_element_id }) =>
	upload_files({
		task: "upload_new_resources",
		data,
		input_element_id,
	});

export var get_resources = ({ filters = {} }) =>
	custom_axios({
		task: "get_resources",
		body: {
			filters,
		},
	});
export var custom_axios_download = async ({ url, file_name }) => {
	var response = await axios({
		url,
		method: "GET",
		withCredentials: true,
		responseType: "blob",
	});
	// create file link in browser's memory
	const href = URL.createObjectURL(response.data);

	// create "a" HTML element with href to file & click
	const link = document.createElement("a");
	link.href = href;
	link.setAttribute("download", file_name); //file name should have extension, ex : fileff.pdf
	document.body.appendChild(link);
	link.click();

	// clean up "a" element & remove ObjectURL
	document.body.removeChild(link);
	URL.revokeObjectURL(href);
};

export var download_resource = async ({ resource_id }) => {
	var resource_name = (await get_resources({ filters: { _id: resource_id } }))[0].file_data.name;
	custom_axios_download({
		url: new URL(`/resources/${resource_id}`, window.api_endpoint).href,
		file_name: resource_name,
	});
};

export var new_comment = ({ date, text, user_id, workspace_id, workflow_id, note_id, task_id }) => new_document({
	collection_name: "comments",
	document: { date, text, user_id, workspace_id, workflow_id, note_id, task_id }
})

export var get_comments = ({ filters }) => get_collection({
	collection_name: "comments",
	filters
})

export var delete_comment = ({ filters }) => delete_document({
	collection_name: "comments",
	filters
})

export var edit_comment = ({ new_text, comment_id }) => update_document({
	collection: "comments",
	update_filter: {
		_id : comment_id
	},
	update_set: {
		text: new_text,
		edited : true
	}
})