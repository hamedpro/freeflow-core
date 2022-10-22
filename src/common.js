import { customAjax } from "./custom_ajax";
export function toHHMMSS(seconds) {
	var sec_num = parseInt(seconds, 10);
	var hours = Math.floor(sec_num / 3600);
	var minutes = Math.floor((sec_num - hours * 3600) / 60);
	var seconds = sec_num - hours * 3600 - minutes * 60;

	if (hours < 10) {
		hours = "0" + hours;
	}
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	if (seconds < 10) {
		seconds = "0" + seconds;
	}
	return {
		hours,
		minutes,
		seconds,
	};
}
export function trim_text_if_its_long(string, max_length) {
	var tmp = string.split("");
	if (tmp.length > max_length) {
		var tmp2 = tmp.slice(0, max_length);
		tmp2.push("...");
		return tmp2.join("");
	} else {
		return tmp.join("");
	}
}
export function clone_simple_object(object_to_clone) {
	/* as it's obvious from it's name just use this 
	func for objects like {a:"hamed",b:"negin"} */
	var cloned_object = {};
	Object.keys(object_to_clone).forEach((key) => {
		cloned_object[key] = object_to_clone[key];
	});
	return cloned_object;
}
export function multi_lang_helper({ en, fa }) {
	var lang = window.localStorage.getItem("language");
	if (lang === null) {
		return fa; //defalt lang is set here
		//todo get default lang from user in the first setup page
	}
	return lang === "fa" ? fa : en;
}

export function getUserPrivilege() {
	return new Promise((resolve, reject) => {
		var localStorageUsername = window.localStorage.getItem("username");
		if (localStorageUsername === null) {
			resolve({
				username: null,
				is_admin: null,
			});
		} else {
			customAjax({
				params: {
					task_name: "get_users",
				},
			}).then(
				(data) => {
					var users = data.result;
					resolve({
						username: localStorageUsername,
						is_admin:
							users.find((user) => user.username == localStorageUsername).is_admin ===
							"true",
					});
				},
				(error) => {
					reject(error);
				}
			);
		}
	});
}
//todo do detecting if access is denied or not server side
export function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	// While there remain elements to shuffle.
	while (currentIndex != 0) {
		// Pick a remaining element.
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}
export function gen_link_to_file(relative_file_path) {
	/* we serve ./uploaded directory on same port as api 
		but when frontend wants to access an image the link 
		it should use depends on where its running in 
		for example if the frontend is in the same machine with api 
		it should connect to localhost but if its on a network it should
		connect to machine which api is running on using its local or public ip
	*/
	// relative_file_path is relative with ./uploaded directory
	return new URL(relative_file_path, window.api_endpoint).href;
}
