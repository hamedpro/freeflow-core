import axios from "axios";
import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const LoginPasswordBased = () => {
	var [search_params] = useSearchParams();
	var custom_nav = useNavigate();
	async function password_based_login() {
		try {
			var response = await axios({
				baseURL: window.api_endpoint,
				url: `/v2/auth/password_verification`,
				data: {
					user_id: search_params.get("user_id"),
					password: document.getElementById("password_input").value,
				},
				method: "post",
			});
			if (response.data.verified === true) {
				alert("auth was performed!");
				window.localStorage.setItem("jwt", response.data.jwt);
				window.localStorage.setItem("user_id", search_params.get("user_id"));
				custom_nav("/dashboard");
			} else {
				window.alert("password was wrong");
			}
		} catch (error) {
			console.log(error);
			alert(
				"something went wrong while trying to make a request to the server : details in console"
			);
		}
	}
	return (
		<>
			<p>enter your password here</p>
			<input className="border border-blue-400 " id="password_input" />
			<button onClick={password_based_login}> check my password </button>
		</>
	);
};
