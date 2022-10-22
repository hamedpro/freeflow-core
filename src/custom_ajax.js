export async function customAjax({
	params = {},
	files = [], //setting a default value for it
	route = "/", // route should start with "/" -> example : "/products/2"
	headers = {},
	super_admin_access_token = null,
	jwt = null,
	verbose = false,
	disable_notifications_and_logs = false,
}) {
	var method = "POST";
	var base_path = window.api_endpoint;

	var response;
	if (files.length !== 0) {
		var form = new FormData();
		for (var i = 0; i < files.length; i++) {
			form.append(i, files[i]);
		}
		var path = base_path + "?";
		Object.keys(params).forEach((key, index) => {
			path += key + "=" + params[key] + "&";
		});
		if (verbose) {
			console.log("this path is going to be fetched " + path);
		}
		response = await fetch(path, {
			method,
			body: form,
		});
	} else {
		headers = {
			"Content-Type": "application/json",
			...headers,
		};
		if (jwt !== null) {
			headers["jwt"] = jwt;
		}

		if (super_admin_access_token !== null) {
			headers["super_admin_access_token"] = super_admin_access_token;
		}

		var path = base_path + route;
		if (verbose) {
			console.log("this path is going to be fetched " + path);
		}
		response = await fetch(path, {
			method,
			body: JSON.stringify(params),
			headers,
		});
	}

	if (!response.ok) {
		//todo add catch block for when fetch req iteself is rejected
		error_text = `network related problem : fetch request was not successful (status was not in the range 200-299) : response.status = ${response.status}`;
		if (!disable_notifications_and_logs) {
			window.new_log({
				type: "error",
				title: "network related problem",
				text: error_text,
			});
		}
		throw new Error(error_text);
	}
	var parsed_json;
	try {
		parsed_json = await response.json();
	} catch (e) {
		error_text =
			"network related problem : fetch request was successful (status was in the range 200-299) but server response was not a valid stringified json ";
		if (!disable_notifications_and_logs) {
			window.new_log({
				type: "error",
				title: "network related problem",
				text: error_text,
			});
		}
		throw new Error(error_text);
	}
	if (parsed_json.errors.length !== 0) {
		error_text = `network related problem : fetch request was successful and response was parsed successfuly but server reported one or more errors : ${parsed_json.errors.join(
			" -- "
		)}`;
		if (!disable_notifications_and_logs) {
			window.new_log({
				type: "error",
				title: "network related problem",
				text: error_text,
			});
		}

		throw error_text;
	} else {
		return parsed_json;
	}
}
/* how to use : 
use pass 2 functions to .then
1st func can get a data or ... arg
2nd func can get an error or ... arg  */
