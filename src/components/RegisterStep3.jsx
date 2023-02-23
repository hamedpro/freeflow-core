import axios from "axios";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const RegisterStep3 = () => {
	var nav = useNavigate();
	var [search_params, set_search_params] = useSearchParams();
	var username = search_params.get("username");

	// kind is either "mobile" , "email_address" , "password"
	// mobile means we are going to set mobile phone number value here
	// also the same for email_address and password ...
	var kind = search_params.get("kind");

	async function submit_new_user() {
		await axios({
			baseURL: window.api_endpoint,
			url: "/v2/users",
			method: "post",
			data: {
				username,
				[kind]: document.getElementById("input").value,
			},
		});
		alert("your new account was created. navigating to login page");
		nav("/login/find_user");
	}

	return (
		<>
			<p>add a new value for :</p>
			<h1>{kind}</h1>
			<input id="input" />
			<button onClick={submit_new_user}>submit this new user</button>
		</>
	);
};
